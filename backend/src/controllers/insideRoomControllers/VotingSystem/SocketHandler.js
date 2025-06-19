const LiveViewersController = require('./LiveViewersController');
const SkipVotingService = require('./SkipVotingService');

class SocketHandler {
  static setupSocketHandlers(io) {
    io.on('connection', (socket) => {
      console.log('[SOCKET] User connected:', socket.id);

      // Handle user identification for proper vote tracking
      socket.on('setUserId', (userId) => {
        socket.userId = userId;
        console.log(`[SOCKET] Socket ${socket.id} identified as user ${userId}`);
      });

      // Handle room joining with enhanced tracking
      socket.on('joinRoom', async (roomId) => {
        socket.join(`room-${roomId}`);
        socket.roomId = roomId;
        console.log(`[SOCKET] User ${socket.id} joined room-${roomId}`);

        // Update viewer count and emit to all users
        await this.updateRoomViewerCount(roomId, io, 'user_joined');
      });

      // Handle room leaving with cleanup
      socket.on('leaveRoom', async (roomId) => {
        socket.leave(`room-${roomId}`);
        console.log(`[SOCKET] User ${socket.id} left room-${roomId}`);

        // Remove user from skip votes and update counts
        const userId = socket.userId;
        if (userId) {
          LiveViewersController.removeUserFromSkipVotes(roomId, userId);
          console.log(`[SOCKET] Removed user ${userId} skip votes from room ${roomId}`);
        }

        // Update viewer count for remaining users
        await this.updateRoomViewerCount(roomId, io, 'user_left');
      });

      // Handle disconnect with proper cleanup
      socket.on('disconnect', async () => {
        console.log('[SOCKET] User disconnected:', socket.id);
        
        // Clean up if user was in a room
        if (socket.roomId) {
          const roomId = socket.roomId;
          const userId = socket.userId;

          // Remove from skip votes
          if (userId) {
            LiveViewersController.removeUserFromSkipVotes(roomId, userId);
            console.log(`[SOCKET] Cleaned up user ${userId} from room ${roomId} on disconnect`);
          }

          // Update viewer count for remaining users
          await this.updateRoomViewerCount(roomId, io, 'user_disconnected');
        }
      });

      // Handle song changes (clear skip votes)
      socket.on('songChanged', (roomId) => {
        console.log(`[SOCKET] Song changed in room ${roomId} - clearing skip votes`);
        LiveViewersController.clearRoomSkipVotes(roomId);
        
        // Emit reset to all clients
        io.to(`room-${roomId}`).emit('skipVoteUpdate', {
          skipCount: 0,
          threshold: 0,
          reason: 'song_changed'
        });
      });
    });
  }

  // Update room viewer count and emit updates
  static async updateRoomViewerCount(roomId, io, reason = 'update') {
    try {
      // Get current live viewers
      const roomSockets = await io.in(`room-${roomId}`).fetchSockets();
      const liveViewers = roomSockets.length;
      
      console.log(`[SOCKET] Room ${roomId} now has ${liveViewers} viewers (${reason})`);
      
      // Emit viewer count update
      io.to(`room-${roomId}`).emit('viewerCountUpdate', {
        liveViewers,
        reason
      });

      // Also emit updated skip threshold since viewer count changed
      const skipCount = SkipVotingService.getSkipCount(roomId);
      const threshold = SkipVotingService.calculateThreshold(liveViewers);
      
      io.to(`room-${roomId}`).emit('skipVoteUpdate', {
        liveViewers,
        skipCount,
        threshold,
        reason: `viewer_${reason}`
      });

      console.log(`[SOCKET] Emitted updates to room ${roomId}: ${liveViewers} viewers, ${skipCount}/${threshold} votes`);

    } catch (error) {
      console.error(`[SOCKET] Error updating viewer count for room ${roomId}:`, error);
    }
  }

  // Force update all clients in a room (useful for manual triggers)
  static async forceUpdateRoom(roomId, io, reason = 'manual_update') {
    await this.updateRoomViewerCount(roomId, io, reason);
  }

  // Get current viewer count for a room
  static async getRoomViewerCount(roomId, io) {
    try {
      const roomSockets = await io.in(`room-${roomId}`).fetchSockets();
      return roomSockets.length;
    } catch (error) {
      console.error(`[SOCKET] Error getting viewer count for room ${roomId}:`, error);
      return 0;
    }
  }
}

module.exports = SocketHandler;