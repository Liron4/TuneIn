const Room = require('../../../models/Room');

class ViewerTrackingService {
  // Get live viewers count for a room
  static async getLiveViewersCount(roomId, io) {
    try {
      const roomSockets = await io.in(`room-${roomId}`).fetchSockets();
      const liveViewers = roomSockets.length;
      return liveViewers;
    } catch (error) {
      console.error('[VIEWER TRACKING] Error getting live viewers count:', error);
      return 0;
    }
  }

  // Update room capacity in database
  static async updateRoomCapacity(roomId, liveViewers) {
    try {
      await Room.findByIdAndUpdate(roomId, { capacity: liveViewers });
      return true;
    } catch (error) {
      console.error('[VIEWER TRACKING] Error updating room capacity:', error);
      return false;
    }
  }

  // **ENHANCED** Emit viewer count update with threshold recalculation
  static emitViewerCountUpdate(roomId, liveViewers, io) {
    // Basic viewer count update
    io.to(`room-${roomId}`).emit('viewerCountUpdate', {
      liveViewers
    });

    // **NEW**: Also emit updated threshold since viewer count changed
    const SkipVotingService = require('./SkipVotingService');
    const skipCount = SkipVotingService.getSkipCount(roomId);
    const threshold = SkipVotingService.calculateThreshold(liveViewers);

    io.to(`room-${roomId}`).emit('skipVoteUpdate', {
      liveViewers,
      skipCount,
      threshold,
      reason: 'viewer_count_changed'
    });
  }

  // Get and update live viewers (combined operation)
  static async getAndUpdateLiveViewers(roomId, io) {
    const liveViewers = await this.getLiveViewersCount(roomId, io);
    await this.updateRoomCapacity(roomId, liveViewers);
    this.emitViewerCountUpdate(roomId, liveViewers, io);
    return liveViewers;
  }

  // **NEW**: Use SocketHandler for force updates
  static async forceUpdateAllClients(roomId, io, reason = 'manual_update') {
    const SocketHandler = require('./SocketHandler');
    await SocketHandler.forceUpdateRoom(roomId, io, reason);
  }
}

module.exports = ViewerTrackingService;