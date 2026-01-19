const Room = require('../../models/Room');
const SkipVotingService = require('./VotingSystem/SkipVotingService');
const ViewerTrackingService = require('./VotingSystem/ViewerTrackingService');
const UpdateUserPoints = require('./UpdateUserPoints');
const TimerManager = require('./helpers/TimerManager');
const Emitter = require('./helpers/RoomSocketEmitter');

const TRANSITION_DELAY = 5000;
const roomsInCountdown = new Set();

exports.isCountdownActive = (roomId) => roomsInCountdown.has(roomId);

function processPoints(song, source) {
  if (!song) return;
  if (source === 'natural_end') {
    UpdateUserPoints.awardNaturalEndPoints(song).catch(e => console.error('[POINTS]', e.message));
  } else if (source === 'SkipSong') {
    UpdateUserPoints.deductSkippedSongPoints(song).catch(e => console.error('[POINTS]', e.message));
  }
}

exports.playNextSong = async (roomId, io, source = 'unknown') => {
  if (roomsInCountdown.has(roomId)) return;

  try {
    SkipVotingService.clearRoomSkipVotes(roomId);
    TimerManager.clearAll(roomId);

    const room = await Room.findById(roomId);
    processPoints(room?.currentSong, source);

    if (!room || room.songqueue.length === 0) {
      await Room.findByIdAndUpdate(roomId, { currentSong: null });
      Emitter.currentSongUpdated(io, roomId, null, Date.now());
      return;
    }

    const exactStartTime = Date.now() + TRANSITION_DELAY;
    const nextSong = room.songqueue[0];
    const updatedQueue = room.songqueue.slice(1);
    const songWithMetadata = { ...nextSong, startTime: exactStartTime, triggerSource: source };

    roomsInCountdown.add(roomId);
    await Room.findByIdAndUpdate(roomId, { songqueue: updatedQueue });

    Emitter.queueUpdated(io, roomId, updatedQueue, source);
    Emitter.countdownStarted(io, roomId, TRANSITION_DELAY / 1000, nextSong, source, exactStartTime);

    setTimeout(async () => {
      try {
        roomsInCountdown.delete(roomId);
        await Room.findByIdAndUpdate(roomId, { currentSong: songWithMetadata });
        Emitter.currentSongUpdated(io, roomId, songWithMetadata, exactStartTime);

        const liveViewers = await ViewerTrackingService.getLiveViewersCount(roomId, io);
        Emitter.skipVoteUpdate(io, roomId, {
          liveViewers,
          skipCount: SkipVotingService.getSkipCount(roomId),
          threshold: SkipVotingService.calculateThreshold(liveViewers),
          source
        });

        if (nextSong.duration) {
          // +1000 for any small delays
          const SongDurationTimer = exactStartTime + (nextSong.duration * 1000) + 1000 - Date.now();
          TimerManager.setSongDurationTimer(roomId, setTimeout(() => {
            exports.playNextSong(roomId, io, 'natural_end');
          }, SongDurationTimer));
        }
      } catch (error) {
        console.error(`[TRANSITION ERROR] Room ${roomId}:`, error);
        roomsInCountdown.delete(roomId);
      }
    }, TRANSITION_DELAY);
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