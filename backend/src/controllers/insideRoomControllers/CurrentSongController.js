const Room = require('../../models/Room');
const LiveViewersController = require('./VotingSystem/LiveViewersController');
const SkipVotingService = require('./VotingSystem/SkipVotingService');
const ViewerTrackingService = require('./VotingSystem/ViewerTrackingService');
const UpdateUserPoints = require('./UpdateUserPoints');

let roomsInCountdown = new Set();
const roomTimers = new Map();

exports.isCountdownActive = (roomId) => {
  return roomsInCountdown.has(roomId);
};

function clearAllRoomTimers(roomId) {
  const timers = roomTimers.get(roomId);
  if (timers) {
    if (timers.transitionTimer) {
      clearTimeout(timers.transitionTimer);
    }
    if (timers.songDurationTimer) {
      clearTimeout(timers.songDurationTimer);
    }
    roomTimers.delete(roomId);
  }
}

// Helper function to handle points for previous song
function handlePreviousSongPoints(previousSong, source) {
  if (source === 'natural_end') {
    // Award points asynchronously (non-blocking)
    UpdateUserPoints.awardNaturalEndPoints(previousSong).catch(err => 
      console.error('[POINTS] Award error:', err.message)
    );
  } else if (source === 'SkipSong') {
    // Deduct points asynchronously (non-blocking)
    UpdateUserPoints.deductSkippedSongPoints(previousSong).catch(err => 
      console.error('[POINTS] Deduct error:', err.message)
    );
  }
}

const SONG_TRANSITION_DELAY = 5000; // 5 seconds delay before playing the next song

exports.playNextSong = async (roomId, io, source = 'unknown') => {
  console.log(`[playNextSong] Room ${roomId}: Triggered from "${source}"`);

  // **COUNTDOWN PROTECTION**: Prevent multiple simultaneous playNextSong operations
  if (roomsInCountdown.has(roomId)) {
    console.log(`[playNextSong] Room ${roomId}: Countdown already active, ignoring new request from "${source}"`);
    return;
  }

  try {
    // Clear votes and timers
    LiveViewersController.clearRoomSkipVotes(roomId, source);
    clearAllRoomTimers(roomId);

    // Get room and validate queue
    const room = await Room.findById(roomId);
    if (!room || room.songqueue.length === 0) {
      // Handle points for previous song if it exists
      if (room && room.currentSong) {
        console.log(`[POINTS] Processing points for previous song before clearing queue`);
        handlePreviousSongPoints(room.currentSong, source);
      } else {
        console.log(`[POINTS] No current song to process points for (first song or empty room)`);
      }
      
      await Room.findByIdAndUpdate(roomId, { currentSong: null });
      io.to(`room-${roomId}`).emit('currentSongUpdated', {
        currentSong: null,
        serverTime: Date.now()
      });
      return;
    }

    // **CAPTURE PREVIOUS SONG**: Before processing new song
    const previousSong = room.currentSong;

    // **TIME DRIFT FIX**: Calculate exact future start time upfront
    const currentTime = Date.now();
    const exactStartTime = currentTime + SONG_TRANSITION_DELAY;

    // **PRE-PROCESS**: Prepare all data before timer
    const nextSong = room.songqueue[0];
    const updatedQueue = room.songqueue.slice(1);
    const songWithMetadata = {
      ...nextSong,
      startTime: exactStartTime,
      triggerSource: source
    };

    // **RACE CONDITION FIX**: Update queue immediately and mark countdown
    roomsInCountdown.add(roomId);
    await Room.findByIdAndUpdate(roomId, {
      songqueue: updatedQueue
    });

    // Emit queue update immediately to prevent user interference
    io.to(`room-${roomId}`).emit('queueUpdated', {
      queue: updatedQueue,
      source: source
    });

    // Mark countdown and emit with exact start time
    io.to(`room-${roomId}`).emit('nextSongCountdown', {
      countdown: SONG_TRANSITION_DELAY / 1000,
      nextSong: nextSong,
      source: source,
      exactStartTime: exactStartTime
    });

    // **PRECISE TIMER**: Use exact timing calculation
    const actualDelay = exactStartTime - Date.now();
    const transitionTimer = setTimeout(async () => {
      try {
        // Clear countdown state immediately
        roomsInCountdown.delete(roomId);

        // **MINIMAL OPERATIONS**: Only update current song (queue already updated)
        await Room.findByIdAndUpdate(roomId, {
          currentSong: songWithMetadata
        });

        // Emit with exact pre-calculated time
        io.to(`room-${roomId}`).emit('currentSongUpdated', {
          currentSong: songWithMetadata,
          serverTime: exactStartTime
        });

        // Get live data and emit updates
        const liveViewers = await ViewerTrackingService.getLiveViewersCount(roomId, io);
        const skipCount = SkipVotingService.getSkipCount(roomId);
        const threshold = SkipVotingService.calculateThreshold(liveViewers);

        io.to(`room-${roomId}`).emit('skipVoteUpdate', {
          liveViewers,
          skipCount,
          threshold,
          reason: 'new_song_started',
          source: source
        });

        // Note: queueUpdated already emitted earlier to prevent race conditions

        // **HANDLE POINTS**: Process points for previous song
        if (previousSong) {
          console.log(`[POINTS] Processing points for previous song: "${previousSong.title || 'Unknown'}" by ${previousSong.addedby || 'Unknown'}`);
          handlePreviousSongPoints(previousSong, source);
        } else {
          console.log(`[POINTS] No previous song to process points for (likely first song in room)`);
        }

        // **DRIFT-FREE DURATION TIMER**: Calculate from exact start time
        if (nextSong.duration) {
          const songEndTime = exactStartTime + (nextSong.duration * 1000) + 1000; // Add 1 second buffer, so song doesn't cut off abruptly 
          const durationDelay = songEndTime - Date.now();

          const songDurationTimer = setTimeout(() => {
            exports.playNextSong(roomId, io, 'natural_end');
          }, durationDelay);

          // **TIMER CLEANUP FIX**: Preserve existing timers
          const timers = roomTimers.get(roomId) || {};
          timers.songDurationTimer = songDurationTimer;
          roomTimers.set(roomId, timers);
        }

      } catch (error) {
        console.error(`[COUNTDOWN ERROR] Room ${roomId}:`, error);
        roomsInCountdown.delete(roomId);
      }
    }, actualDelay);

    // Track transition timer
    roomTimers.set(roomId, { transitionTimer });

  } catch (error) {
    console.error(`[playNextSong ERROR] Room ${roomId}:`, error);
    roomsInCountdown.delete(roomId);
  }
};

// Skip current song
exports.skipSong = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const io = req.app.get('socketio');
    await exports.playNextSong(roomId, io, "SkipSong");

    return res.status(200).json({ message: 'Song skipped successfully' });
  } catch (error) {
    console.error('Error skipping song:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get current song for a room
exports.getCurrentSong = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    return res.status(200).json({
      currentSong: room.currentSong,
      serverTime: Date.now()
    });
  } catch (error) {
    console.error('Error getting current song:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};