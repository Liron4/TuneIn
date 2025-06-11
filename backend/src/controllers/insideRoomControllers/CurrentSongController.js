const Room = require('../../models/Room');

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
      serverTime: Date.now() // Needed for client synchronization
    });
  } catch (error) {
    console.error('Error getting current song:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

const SONG_TRANSITION_DELAY = 5000; // 5 seconds delay before playing the next song

exports.playNextSong = async (roomId, io) => {
  try {
    const room = await Room.findById(roomId);
    
    if (!room || room.songqueue.length === 0) {
      // Clear current song if queue is empty
      await Room.findByIdAndUpdate(roomId, { currentSong: null });
      io.to(`room-${roomId}`).emit('currentSongUpdated', { currentSong: null });
      return;
    }
    
    // Start countdown for next song
    io.to(`room-${roomId}`).emit('nextSongCountdown', { 
      countdown: SONG_TRANSITION_DELAY / 1000,
      nextSong: room.songqueue[0]
      // TO CHECK: the code may be vulnerable because we may add more songs to the queue during the countdown
    });
    
    // Wait for the countdown before playing the next song
    setTimeout(async () => {
      // Fetch the room again in case queue has changed during countdown
      const updatedRoom = await Room.findById(roomId);
      if (!updatedRoom || updatedRoom.songqueue.length === 0) return;
      
      // Get next song from queue
      const nextSong = updatedRoom.songqueue[0];
      
      // Remove song from queue
      const updatedQueue = updatedRoom.songqueue.slice(1);
      
      // Add start time to the song (duration is already included)
      const songWithMetadata = {
        ...nextSong,
        startTime: Date.now()
      };
      
      // Update room with current song and modified queue
      await Room.findByIdAndUpdate(roomId, {
        currentSong: songWithMetadata,
        songqueue: updatedQueue
      });
      
      // Emit current song update to all clients in the room
      io.to(`room-${roomId}`).emit('currentSongUpdated', { 
        currentSong: songWithMetadata,
        serverTime: Date.now()
      });
      
      // Emit queue update
      io.to(`room-${roomId}`).emit('queueUpdated', { queue: updatedQueue });
      
      // Schedule next song
      setTimeout(() => {
        exports.playNextSong(roomId, io);
      }, nextSong.duration * 1000); // No buffer needed with countdown
    }, SONG_TRANSITION_DELAY);
    
  } catch (error) {
    console.error('Error playing next song:', error);
  }
};

// Skip current song - TO BE to be used with the future voting system
exports.skipSong = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    // Get IO instance from request
    const io = req.app.get('socketio');
    
    // Play next song
    await exports.playNextSong(roomId, io);
    
    return res.status(200).json({ message: 'Song skipped successfully' });
  } catch (error) {
    console.error('Error skipping song:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Initialize song playback for a room
exports.initializeRoomPlayback = async (roomId, io) => {
  try {
    const room = await Room.findById(roomId);
    
    if (!room) return;
    
    if (room.currentSong) {
      const now = Date.now();
      const startTime = room.currentSong.startTime;
      const duration = room.currentSong.duration;
      
      if (startTime && duration) {
        const elapsedTime = (now - startTime) / 1000;
        
        if (elapsedTime < duration) {
          // Song is still playing, schedule next song
          const remainingTime = duration - elapsedTime;
          setTimeout(() => {
            exports.playNextSong(roomId, io);
          }, remainingTime * 1000 + 1000);
        } else {
          // Song has ended, play next song immediately
          exports.playNextSong(roomId, io);
        }
      } else {
        // Missing metadata, play next song
        exports.playNextSong(roomId, io);
      }
    } else if (room.songqueue.length > 0) {
      // No current song but queue has songs
      exports.playNextSong(roomId, io);
    }
  } catch (error) {
    console.error('Error initializing room playback:', error);
  }
};