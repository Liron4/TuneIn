const userController = require('../userController');

// Award points for natural song completion
exports.awardNaturalEndPoints = async (previousSong) => {
  try {
    if (!previousSong) {
      console.log('[POINTS] No previous song to award points for');
      return;
    }

    if (!previousSong.addedby) {
      console.log('[POINTS] WARNING: Previous song missing addedby field, cannot award points');
      return;
    }

    console.log(`[POINTS] Extracting nickname from previous song: "${previousSong.addedby}"`);

    // Create mock request/response for userController
    const mockReq = {
      body: {
        points: 1,
        nickname: previousSong.addedby,
        operation: 'add'
      },
      user: { userId: null } // Not needed when using nickname
    };

    let responseData = null;
    let statusCode = 200;

    const mockRes = {
      json: (data) => {
        responseData = data;
        if (statusCode === 200) {
          console.log(`[POINTS] Successfully awarded +1 point to ${previousSong.addedby} for natural song end`);
        }
        return mockRes;
      },
      status: (code) => {
        statusCode = code;
        return mockRes;
      }
    };

    await userController.updatePoints(mockReq, mockRes);

    // Handle error responses
    if (statusCode !== 200) {
      if (statusCode === 404) {
        console.error(`[POINTS ERROR] User "${previousSong.addedby}" not found when awarding points`);
      } else {
        console.error(`[POINTS ERROR] Failed to award points to ${previousSong.addedby}, status: ${statusCode}, response:`, responseData);
      }
    }

  } catch (error) {
    console.error(`[POINTS ERROR] Exception when awarding points to ${previousSong?.addedby}:`, error.message);
  }
};

// Deduct points for skipped song
exports.deductSkippedSongPoints = async (previousSong) => {
  try {
    if (!previousSong) {
      console.log('[POINTS] No previous song to deduct points for');
      return;
    }

    if (!previousSong.addedby) {
      console.log('[POINTS] WARNING: Previous song missing addedby field, cannot deduct points');
      return;
    }

    console.log(`[POINTS] Extracting nickname from previous song: "${previousSong.addedby}"`);

    // Create mock request/response for userController
    const mockReq = {
      body: {
        points: 1,
        nickname: previousSong.addedby,
        operation: 'reduce'
      },
      user: { userId: null } // Not needed when using nickname
    };

    let responseData = null;
    let statusCode = 200;

    const mockRes = {
      json: (data) => {
        responseData = data;
        if (statusCode === 200) {
          console.log(`[POINTS] Successfully deducted -1 point from ${previousSong.addedby} for skipped song`);
        }
        return mockRes;
      },
      status: (code) => {
        statusCode = code;
        return mockRes;
      }
    };

    await userController.updatePoints(mockReq, mockRes);

    // Handle error responses
    if (statusCode !== 200) {
      if (statusCode === 404) {
        console.error(`[POINTS ERROR] User "${previousSong.addedby}" not found when deducting points`);
      } else {
        console.error(`[POINTS ERROR] Failed to deduct points from ${previousSong.addedby}, status: ${statusCode}, response:`, responseData);
      }
    }

  } catch (error) {
    console.error(`[POINTS ERROR] Exception when deducting points from ${previousSong?.addedby}:`, error.message);
  }
};
