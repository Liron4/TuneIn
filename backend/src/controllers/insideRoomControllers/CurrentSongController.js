const Room = require('../../models/Room');
const LiveViewersController = require('./VotingSystem/LiveViewersController');
const SkipVotingService = require('./VotingSystem/SkipVotingService');
const ViewerTrackingService = require('./VotingSystem/ViewerTrackingService');

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

const SONG_TRANSITION_DELAY = 5000; // 5 seconds delay before playing the next song

exports.playNextSong = async (roomId, io, source = 'unknown') => {
  // **SINGLE LOG**: Only log the trigger source once
  console.log(`[playNextSong] Room ${roomId}: Triggered from "${source}"`);
  
  try {
    // Clear last votes because we start a new song
    LiveViewersController.clearRoomSkipVotes(roomId, source);
    
    // Clear all timers for this room to prevent conflicts
    clearAllRoomTimers(roomId);

    io.to(`room-${roomId}`).emit('skipVoteUpdate', {
      skipCount: 0,
      threshold: 0,
      hasUserVoted: false,
      reason: 'song_changed',
      source: source
    });

    const room = await Room.findById(roomId);

    if (!room || room.songqueue.length === 0) {
      // Clear current song if queue is empty
      await Room.findByIdAndUpdate(roomId, { currentSong: null });
      io.to(`room-${roomId}`).emit('currentSongUpdated', {
        currentSong: null,
        serverTime: Date.now()
      });
      return;
    }

    // Mark this room as being in countdown
    roomsInCountdown.add(roomId);

    // Start countdown for next song
    io.to(`room-${roomId}`).emit('nextSongCountdown', {
      countdown: SONG_TRANSITION_DELAY / 1000,
      nextSong: room.songqueue[0],
      source: source
    });

    // **TRANSITION TIMER**: Handle the 5-second delay before starting song
    const transitionTimer = setTimeout(async () => {
      try {
        // Always clear countdown state first
        roomsInCountdown.delete(roomId);

        // Remove transition timer from tracking (it's completed)
        const timers = roomTimers.get(roomId) || {};
        if (timers.transitionTimer) {
          timers.transitionTimer = null;
          roomTimers.set(roomId, timers);
        }

        // Fetch the room again in case queue has changed during countdown
        const updatedRoom = await Room.findById(roomId);
        if (!updatedRoom || updatedRoom.songqueue.length === 0) {
          return;
        }

        // Get next song from queue
        const nextSong = updatedRoom.songqueue[0];

        // Remove song from queue
        const updatedQueue = updatedRoom.songqueue.slice(1);

        // Record exact start time to calculate end accurately
        const exactStartTime = Date.now();

        // Add start time to the song
        const songWithMetadata = {
          ...nextSong,
          startTime: exactStartTime,
          triggerSource: source
        };

        // Update room with current song and modified queue
        await Room.findByIdAndUpdate(roomId, {
          currentSong: songWithMetadata,
          songqueue: updatedQueue
        });

        // Emit current song update to all clients in the room
        io.to(`room-${roomId}`).emit('currentSongUpdated', {
          currentSong: songWithMetadata,
          serverTime: exactStartTime
        });

        // Other emission logic
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

        // Emit queue update
        io.to(`room-${roomId}`).emit('queueUpdated', { 
          queue: updatedQueue,
          source: source 
        });

        // **SONG DURATION TIMER**: Schedule next song when current one ends
        if (nextSong.duration) {
          const songDurationTimer = setTimeout(() => {
            exports.playNextSong(roomId, io, 'natural_end');
          }, nextSong.duration * 1000);

          // Store timer reference for later cancellation
          roomTimers.set(roomId, { songDurationTimer });
        }
      } catch (error) {
        console.error(`[COUNTDOWN ERROR] Room ${roomId}:`, error);
      }
    }, SONG_TRANSITION_DELAY);

    // Track this timer for later cancellation
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