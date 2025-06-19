const Room = require('../../../models/Room');

class ViewerTrackingService {
  // Get live viewers count for a room
  static async getLiveViewersCount(roomId, io) {
    try {
      const roomSockets = await io.in(`room-${roomId}`).fetchSockets();
      const liveViewers = roomSockets.length;

      console.log(`Room ${roomId} has ${liveViewers} live viewers`);
      return liveViewers;
    } catch (error) {
      console.error('Error getting live viewers count:', error);
      return 0;
    }
  }

  // Update room capacity in database
  static async updateRoomCapacity(roomId, liveViewers) {
    try {
      await Room.findByIdAndUpdate(roomId, { capacity: liveViewers });
      console.log(`Updated room ${roomId} capacity to ${liveViewers}`);
      return true;
    } catch (error) {
      console.error('Error updating room capacity:', error);
      return false;
    }
  }

  // Emit viewer count update to all users in room
  static emitViewerCountUpdate(roomId, liveViewers, io) {
    io.to(`room-${roomId}`).emit('viewerCountUpdate', {
      liveViewers
    });
    console.log(`Emitted viewer count update to room ${roomId}: ${liveViewers} viewers`);
  }

  // Get and update live viewers (combined operation)
  static async getAndUpdateLiveViewers(roomId, io) {
    const liveViewers = await this.getLiveViewersCount(roomId, io);
    await this.updateRoomCapacity(roomId, liveViewers);
    this.emitViewerCountUpdate(roomId, liveViewers, io);
    return liveViewers;
  }
}

module.exports = ViewerTrackingService;