const SkipVotingService = require('./SkipVotingService');
const ViewerTrackingService = require('./ViewerTrackingService');

class LiveViewersController {
  // Get live viewers for ALL users (including creators)
  static async getLiveViewers(req, res) {
    try {
      const { roomId } = req.params;
      const userId = req.user.id;
      const io = req.app.get('socketio');

      console.log(`[GET LIVE VIEWERS] User ${userId} requesting data for room ${roomId}`);

      // Get live viewers and update capacity
      const liveViewers = await ViewerTrackingService.getAndUpdateLiveViewers(roomId, io);

      // Get skip voting data
      const skipCount = SkipVotingService.getSkipCount(roomId);
      const threshold = SkipVotingService.calculateThreshold(liveViewers);
      const hasUserVoted = SkipVotingService.hasUserVoted(roomId, userId);

      // Get detailed voting info for debugging
      const votingInfo = SkipVotingService.getVotingInfo(roomId);

      console.log(`[LIVE VIEWERS RESPONSE] Room ${roomId}: ${liveViewers} viewers, ${skipCount}/${threshold} votes`);
      console.log(`[USER VOTE STATUS] User ${userId}: ${hasUserVoted ? 'HAS VOTED' : 'NOT VOTED'}`);

      res.json({
        liveViewers,
        skipCount,
        threshold,
        hasUserVoted,
        userId, // Include for debugging
        votingInfo: process.env.NODE_ENV === 'development' ? votingInfo : undefined
      });

    } catch (error) {
      console.error('[LIVE VIEWERS ERROR]', error);
      res.status(500).json({ error: 'Failed to get live viewers' });
    }
  }

  // **FIXED**: Use toggle instead of add-only
  static async handleSkipVote(req, res) {
    try {
      const { roomId } = req.params;
      const userId = req.user.id;
      const io = req.app.get('socketio');

      console.log(`[VOTE REQUEST] User ${userId} in room ${roomId}`);

      // Get live viewers and update capacity
      const liveViewers = await ViewerTrackingService.getAndUpdateLiveViewers(roomId, io);

      // **FIX**: Use toggleUserVote for proper toggle functionality
      const { action, skipCount } = SkipVotingService.toggleUserVote(roomId, userId);
      const threshold = SkipVotingService.calculateThreshold(liveViewers);

      console.log(`[VOTE RESULT] User ${userId} ${action} vote. Current: ${skipCount}/${threshold}`);

      // Get current voting state
      const hasUserVoted = SkipVotingService.hasUserVoted(roomId, userId);

      // Emit real-time update to all users in the room
      io.to(`room-${roomId}`).emit('skipVoteUpdate', {
        liveViewers,
        skipCount,
        threshold,
        lastVoter: userId,
        action
      });

      // Check threshold (only if vote was added, not removed)
      let skipTriggered = false;
      if (action === 'added') {
        skipTriggered = await SkipVotingService.checkAndTriggerSkip(roomId, liveViewers, req.headers.authorization, io);
      }

      res.json({
        success: true,
        liveViewers,
        skipCount,
        threshold,
        hasUserVoted,
        action,
        skipTriggered,
        userId, // Include for debugging
        message: action === 'added' ? 'Vote added' : 'Vote removed'
      });

    } catch (error) {
      console.error('[VOTE ERROR]', error);
      res.status(500).json({ error: 'Failed to handle skip vote' });
    }
  }

  // Clear skip votes for a room (called when song changes)
  static clearRoomSkipVotes(roomId) {
    console.log(`[CONTROLLER CLEAR] Clearing skip votes for room ${roomId}`);
    SkipVotingService.clearRoomSkipVotes(roomId);
  }

  // Remove user from skip votes (called when user leaves)
  static removeUserFromSkipVotes(roomId, userId) {
    return SkipVotingService.removeUserFromSkipVotes(roomId, userId);
  }
}

module.exports = LiveViewersController;