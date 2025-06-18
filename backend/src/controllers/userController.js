const User = require('../models/User');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    // Get user ID from the token payload (added by auth middleware)
    const userId = req.user.userId;
    
    // Find the user by ID, excluding the password
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data
    res.json({
      nickname: user.nickname,
      email: user.email,
      profilePic: user.profilePic,
      genres: user.genres,
      points: user.points
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user points
exports.updatePoints = async (req, res) => {
  try {
    const { points } = req.body;
    const userId = req.user.userId;

    // Validate points
    if (typeof points !== 'number' || !Number.isInteger(points) || points < 0) {
      return res.status(400).json({ message: 'Points must be a non-negative integer' });
    }

    // Update the user's points
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { points },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      nickname: updatedUser.nickname,
      profilePic: updatedUser.profilePic,
      genres: updatedUser.genres,
      points: updatedUser.points
    });
  } catch (err) {
    console.error('Points update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user genres
exports.updateGenres = async (req, res) => {
  try {
    const { genres } = req.body;
    const userId = req.user.userId;
    
    // Validate genres
    if (!Array.isArray(genres)) {
      return res.status(400).json({ message: 'Genres must be an array' });
    }
    
    if (genres.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 genres allowed' });
    }
    
    // Update the user's genres
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { genres },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      nickname: updatedUser.nickname,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      genres: updatedUser.genres,
      points: updatedUser.points
    });
  } catch (err) {
    console.error('Genre update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};