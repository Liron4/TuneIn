const User = require('../../models/User');
const axios = require('axios');

// In-memory storage for room voting data
const roomVotingData = new Map();
// Structure: roomId -> { currentViewers: 0, likeVotes: 0, dislikeVotes: 0, userVotes: Map(userId -> 'like'|'dislike') }

// Initialize room voting data
const initializeRoomVoting = (roomId) => {
  if (!roomVotingData.has(roomId)) {
    roomVotingData.set(roomId, {
      currentViewers: 0,
      likeVotes: 0,
      dislikeVotes: 0,
      userVotes: new Map() // userId -> 'like' | 'dislike'
    });
  }
  return roomVotingData.get(roomId);
};

// Handle vote submission
exports.handleVote = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { voteType } = req.body; // voteType: 'like', 'dislike', or null (remove vote)
    const userId = req.user.id;

    console.log('Vote request:', { roomId, voteType, userId });

    // Validate vote type
    if (voteType && !['like', 'dislike'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    // Get room voting data
    const roomData = initializeRoomVoting(roomId);
    const currentUserVote = roomData.userVotes.get(userId);

    // Update vote counts based on previous and new vote
    if (currentUserVote === 'like') {
      roomData.likeVotes = Math.max(0, roomData.likeVotes - 1);
    } else if (currentUserVote === 'dislike') {
      roomData.dislikeVotes = Math.max(0, roomData.dislikeVotes - 1);
    }

    // Apply new vote
    if (voteType === 'like') {
      roomData.likeVotes += 1;
      roomData.userVotes.set(userId, 'like');
    } else if (voteType === 'dislike') {
      roomData.dislikeVotes += 1;
      roomData.userVotes.set(userId, 'dislike');
    } else {
      // Remove vote (voteType is null)
      roomData.userVotes.delete(userId);
    }

    console.log(`Room ${roomId} votes updated:`, {
      viewers: roomData.currentViewers,
      likes: roomData.likeVotes,
      dislikes: roomData.dislikeVotes,
      userVote: roomData.userVotes.get(userId) || null
    });

    // Emit vote update to all users in the room
    const io = req.app.get('socketio');
    io.to(`room-${roomId}`).emit('voteUpdate', {
      currentViewers: roomData.currentViewers,
      likeVotes: roomData.likeVotes,
      dislikeVotes: roomData.dislikeVotes,
      userVote: roomData.userVotes.get(userId) || null
    });

    // **AUTO-SKIP LOGIC**: Check if song should be auto-skipped (50% threshold)
    if (roomData.currentViewers > 0) {
      const dislikePercentage = (roomData.dislikeVotes / roomData.currentViewers) * 100;
      
      if (dislikePercentage > 50) {
        console.log(`Auto-skipping song in room ${roomId} due to ${dislikePercentage.toFixed(1)}% dislikes`);
        
        try {
          // **BACKEND DECIDES**: Trigger skip endpoint internally
          const skipResponse = await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/songs/${roomId}/skip`,
            { 
              reason: 'majority_dislike',
              dislikePercentage: Math.round(dislikePercentage)
            },
            {
              headers: { 
                Authorization: req.headers.authorization,
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log('Auto-skip triggered successfully:', skipResponse.data);
          
          // Clear votes for the room since song is skipped
          exports.clearRoomVotes(roomId);
          
        } catch (skipError) {
          console.error('Error triggering auto-skip:', skipError.message);
        }
        
        // Emit skip notification to users
        io.to(`room-${roomId}`).emit('songSkipped', {
          reason: 'majority_dislike',
          dislikePercentage: Math.round(dislikePercentage)
        });
      }
    }

    // Award points to song owner for likes (if provided)
    if (voteType === 'like' && req.body.addedBy) {
      try {
        const songOwner = await User.findOne({ username: req.body.addedBy });
        if (songOwner) {
          songOwner.points += 1;
          await songOwner.save();
          console.log(`Awarded 1 point to ${req.body.addedBy}`);
        }
      } catch (error) {
        console.error('Error awarding points:', error);
      }
    }

    res.json({
      success: true,
      currentViewers: roomData.currentViewers,
      likeVotes: roomData.likeVotes,
      dislikeVotes: roomData.dislikeVotes,
      userVote: roomData.userVotes.get(userId) || null
    });

  } catch (error) {
    console.error('Error handling vote:', error);
    res.status(500).json({ error: 'Failed to process vote' });
  }
};

// Get current voting status for a room
exports.getVotingStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    // Get room voting data (initialize if doesn't exist)
    const roomData = initializeRoomVoting(roomId);

    // Update viewer count from socket rooms
    const io = req.app.get('socketio');
    const roomSockets = await io.in(`room-${roomId}`).fetchSockets();
    roomData.currentViewers = roomSockets.length;

    console.log(`Room ${roomId} voting status:`, {
      viewers: roomData.currentViewers,
      likes: roomData.likeVotes,
      dislikes: roomData.dislikeVotes,
      userVote: roomData.userVotes.get(userId) || null
    });

    res.json({
      currentViewers: roomData.currentViewers,
      likeVotes: roomData.likeVotes,
      dislikeVotes: roomData.dislikeVotes,
      userVote: roomData.userVotes.get(userId) || null
    });

  } catch (error) {
    console.error('Error getting voting status:', error);
    res.status(500).json({ error: 'Failed to get voting status' });
  }
};

// **SOCKET HANDLERS**: Handle user join room
exports.handleUserJoinRoom = (roomId, userId, socket) => {
  const roomData = initializeRoomVoting(roomId);
  
  // Update viewer count
  const io = socket.server;
  io.in(`room-${roomId}`).allSockets().then(sockets => {
    roomData.currentViewers = sockets.size;
    
    // Emit updated viewer count to all users in room
    io.to(`room-${roomId}`).emit('voteUpdate', {
      currentViewers: roomData.currentViewers,
      likeVotes: roomData.likeVotes,
      dislikeVotes: roomData.dislikeVotes,
      userVote: roomData.userVotes.get(userId) || null
    });
    
    console.log(`User ${userId} joined room ${roomId}. Viewer count: ${roomData.currentViewers}`);
  });
};

// **SOCKET HANDLERS**: Handle user leave room
exports.handleUserLeaveRoom = (roomId, userId, socket) => {
  const roomData = roomVotingData.get(roomId);
  if (!roomData) return;

  // Remove user's vote if they had one
  const userVote = roomData.userVotes.get(userId);
  if (userVote) {
    if (userVote === 'like') {
      roomData.likeVotes = Math.max(0, roomData.likeVotes - 1);
    } else if (userVote === 'dislike') {
      roomData.dislikeVotes = Math.max(0, roomData.dislikeVotes - 1);
    }
    roomData.userVotes.delete(userId);
    console.log(`Removed ${userVote} vote from user ${userId} in room ${roomId}`);
  }

  // Update viewer count
  const io = socket.server;
  io.in(`room-${roomId}`).allSockets().then(sockets => {
    roomData.currentViewers = sockets.size;
    
    // Emit updated counts to remaining users
    io.to(`room-${roomId}`).emit('voteUpdate', {
      currentViewers: roomData.currentViewers,
      likeVotes: roomData.likeVotes,
      dislikeVotes: roomData.dislikeVotes
    });
    
    console.log(`User ${userId} left room ${roomId}. Viewer count: ${roomData.currentViewers}`);
  });
};

// **SOCKET HANDLERS**: Clear votes when song changes
exports.handleSongChange = (roomId, socket) => {
  const roomData = roomVotingData.get(roomId);
  if (roomData) {
    roomData.likeVotes = 0;
    roomData.dislikeVotes = 0;
    roomData.userVotes.clear();
    
    // Emit reset votes to all users
    const io = socket.server;
    io.to(`room-${roomId}`).emit('voteUpdate', {
      currentViewers: roomData.currentViewers,
      likeVotes: 0,
      dislikeVotes: 0,
      userVote: null
    });
    
    console.log(`Cleared all votes for room ${roomId} due to song change`);
  }
};

// Remove user vote when they leave the room (legacy function)
exports.removeUserFromRoom = (roomId, userId) => {
  const roomData = roomVotingData.get(roomId);
  if (roomData && roomData.userVotes.has(userId)) {
    const userVote = roomData.userVotes.get(userId);
    
    // Decrease vote count
    if (userVote === 'like') {
      roomData.likeVotes = Math.max(0, roomData.likeVotes - 1);
    } else if (userVote === 'dislike') {
      roomData.dislikeVotes = Math.max(0, roomData.dislikeVotes - 1);
    }
    
    // Remove user vote
    roomData.userVotes.delete(userId);
    
    console.log(`Removed user ${userId} vote from room ${roomId}`);
    return roomData;
  }
  return null;
};

// Clear all votes for a room (when song changes)
exports.clearRoomVotes = (roomId) => {
  const roomData = roomVotingData.get(roomId);
  if (roomData) {
    roomData.likeVotes = 0;
    roomData.dislikeVotes = 0;
    roomData.userVotes.clear();
    console.log(`Cleared all votes for room ${roomId}`);
    return roomData;
  }
  return null;
};

// Export room data for external access
module.exports.roomVotingData = roomVotingData;