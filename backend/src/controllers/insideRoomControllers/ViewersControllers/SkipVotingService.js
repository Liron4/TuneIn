const axios = require('axios');

// In-memory storage for room skip votes
const roomSkipVotes = new Map();

class SkipVotingService {
  // Helper function for consistent threshold calculation
  static calculateThreshold(liveViewers) {
    if (liveViewers <= 1) return 1;
    if (liveViewers === 2) return 2;
    return Math.floor(liveViewers / 2) + (liveViewers % 2 === 1 ? 1 : 0);
  }

  // Get skip votes for a room
  static getSkipVotes(roomId) {
    return roomSkipVotes.get(roomId) || new Set();
  }

  // Initialize skip votes for a room
  static initializeSkipVotes(roomId) {
    if (!roomSkipVotes.has(roomId)) {
      roomSkipVotes.set(roomId, new Set());
    }
    return roomSkipVotes.get(roomId);
  }

  // **FIXED**: Proper toggle functionality
  static toggleUserVote(roomId, userId) {
    const skipVotes = this.initializeSkipVotes(roomId);
    
    console.log(`[VOTE TOGGLE] User ${userId} in room ${roomId}`);
    console.log(`[VOTE STATE BEFORE] Room ${roomId} votes:`, Array.from(skipVotes));
    
    let action;
    if (skipVotes.has(userId)) {
      // User already voted - remove their vote
      skipVotes.delete(userId);
      action = 'removed';
      console.log(`[VOTE REMOVED] User ${userId} removed vote from room ${roomId}`);
    } else {
      // User hasn't voted - add their vote
      skipVotes.add(userId);
      action = 'added';
      console.log(`[VOTE ADDED] User ${userId} added vote to room ${roomId}`);
    }
    
    console.log(`[VOTE STATE AFTER] Room ${roomId} votes:`, Array.from(skipVotes));
    
    return { action, skipCount: skipVotes.size };
  }

  // Keep addUserVote for specific cases
  static addUserVote(roomId, userId) {
    const skipVotes = this.initializeSkipVotes(roomId);
    
    if (skipVotes.has(userId)) {
      console.log(`[VOTE DUPLICATE] User ${userId} already voted in room ${roomId}`);
      return { action: 'already_voted', skipCount: skipVotes.size };
    }
    
    skipVotes.add(userId);
    console.log(`[VOTE FORCE ADD] User ${userId} added vote to room ${roomId}`);
    return { action: 'added', skipCount: skipVotes.size };
  }

  // Remove user vote specifically
  static removeUserVote(roomId, userId) {
    const skipVotes = roomSkipVotes.get(roomId);
    if (!skipVotes || !skipVotes.has(userId)) {
      return { action: 'not_voted', skipCount: skipVotes ? skipVotes.size : 0 };
    }
    
    skipVotes.delete(userId);
    console.log(`[VOTE FORCE REMOVE] User ${userId} removed vote from room ${roomId}`);
    return { action: 'removed', skipCount: skipVotes.size };
  }

  // Check if user has voted
  static hasUserVoted(roomId, userId) {
    const skipVotes = roomSkipVotes.get(roomId);
    const hasVoted = skipVotes ? skipVotes.has(userId) : false;
    console.log(`[VOTE CHECK] User ${userId} in room ${roomId}: ${hasVoted ? 'HAS VOTED' : 'NOT VOTED'}`);
    return hasVoted;
  }

  // Get skip vote count
  static getSkipCount(roomId) {
    const skipVotes = roomSkipVotes.get(roomId);
    return skipVotes ? skipVotes.size : 0;
  }

  // Enhanced threshold checking with logging
  static async checkAndTriggerSkip(roomId, liveViewers, authHeader, io) {
    const skipCount = this.getSkipCount(roomId);
    const threshold = this.calculateThreshold(liveViewers);

    console.log(`[SKIP CHECK] Room ${roomId}: ${skipCount}/${threshold} votes (${liveViewers} viewers)`);

    if (skipCount >= threshold && liveViewers > 0) {
      console.log(`[SKIP TRIGGERED] Room ${roomId}: Threshold met! Triggering skip...`);
      
      try {
        // Trigger the actual skip
        await axios.post(
          `${process.env.SERVER_URL || 'http://localhost:5000'}/api/song/${roomId}/skip`,
          { reason: 'majority_vote', voteCount: skipCount, threshold },
          {
            headers: { 
              Authorization: authHeader,
              'Content-Type': 'application/json'
            }
          }
        );

        // Clear skip votes after successful skip
        this.clearRoomSkipVotes(roomId);
        console.log(`[SKIP SUCCESS] Song skipped in room ${roomId} due to majority vote`);

        // Emit skip notification
        io.to(`room-${roomId}`).emit('songSkippedByVote', {
          reason: 'majority_vote',
          voteCount: skipCount,
          threshold
        });

        return true;
      } catch (skipError) {
        console.error('[SKIP ERROR] Error triggering skip:', skipError.response?.data || skipError.message);
        return false;
      }
    }

    return false;
  }

  // **ENHANCED**: Clear skip votes for a room
  static clearRoomSkipVotes(roomId) {
    const skipVotes = roomSkipVotes.get(roomId);
    if (skipVotes) {
      console.log(`[CLEANUP BEFORE] Room ${roomId} had votes from:`, Array.from(skipVotes));
    }
    
    roomSkipVotes.delete(roomId);
    console.log(`[CLEANUP] Cleared all skip votes for room ${roomId}`);
  }

  // Remove user from skip votes (when user leaves)
  static removeUserFromSkipVotes(roomId, userId) {
    const skipVotes = roomSkipVotes.get(roomId);
    if (skipVotes && skipVotes.has(userId)) {
      skipVotes.delete(userId);
      console.log(`[USER LEFT] Removed user ${userId} from skip votes in room ${roomId}`);
      return true;
    }
    return false;
  }

  // Get detailed voting info for debugging
  static getVotingInfo(roomId) {
    const skipVotes = roomSkipVotes.get(roomId) || new Set();
    return {
      roomId,
      voterIds: Array.from(skipVotes),
      voteCount: skipVotes.size,
      timestamp: Date.now()
    };
  }

  // **NEW**: Debug method to see all room votes
  static getAllRoomVotes() {
    const allVotes = {};
    for (const [roomId, votes] of roomSkipVotes.entries()) {
      allVotes[roomId] = Array.from(votes);
    }
    console.log('[ALL VOTES DEBUG]', allVotes);
    return allVotes;
  }
}

module.exports = SkipVotingService;