const Room = require('../../models/Room');
const CurrentSongController = require('./CurrentSongController');

exports.addSongToQueue = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { song } = req.body;

    // Validate song data
    if (!song || !song.title || !song.id || !song.addedby) {
      return res.status(400).json({ error: 'Invalid song data' });
    }

    // Find the room and add song to queue
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Add song to the end of the queue
    room.songqueue.push(song);
    await room.save();

    // Get socketio instance
    const io = req.app.get('socketio');

    // Emit queue updated event
    io.to(`room-${roomId}`).emit('queueUpdated', { queue: room.songqueue });

    // If no song is currently playing, start playing this one
    if (!room.currentSong && room.songqueue.length === 1 && !CurrentSongController.isCountdownActive(roomId)) {
      // Play the first song
      await CurrentSongController.playNextSong(roomId, io);
    }

    return res.status(200).json({ message: 'Song added to queue successfully' });
  } catch (err) {
    console.error('Error adding song to queue:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get room queue
exports.getRoomQueue = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId).select('songqueue');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({
      queue: room.songqueue,
      queueLength: room.songqueue.length
    });

  } catch (err) {
    console.error('Get room queue error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove song from queue
exports.removeSongFromQueue = async (req, res) => {
  try {
    const { roomId, songIndex } = req.params;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (songIndex < 0 || songIndex >= room.songqueue.length) {
      return res.status(400).json({ message: 'Invalid song index' });
    }

    // Remove song at specified index
    const removedSong = room.songqueue.splice(songIndex, 1)[0];
    await room.save();

    // Emit to all clients in this room via Socket.IO
    const io = req.app.get('socketio');
    if (io) {
      io.to(`room-${roomId}`).emit('queueUpdated', {
        queue: room.songqueue,
        queueLength: room.songqueue.length,
        action: 'songRemoved',
        removedSong: removedSong,
        removedIndex: songIndex
      });
    }

    res.status(200).json({
      message: 'Song removed from queue',
      removedSong: removedSong,
      queueLength: room.songqueue.length
    });

  } catch (err) {
    console.error('Remove song from queue error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};