const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const requestOrigin = req.get('origin') || req.headers.referer || 'no-origin';
  console.log('🔵 Login request from origin:', requestOrigin);
  console.log('🔵 Request body:', JSON.stringify(req.body));
  console.log('🔵 Content-Type:', req.get('content-type'));
  
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set in environment variables.');
    }


    const { email, password } = req.body;
    if (!email || !password) {
      console.log('❌ Missing credentials from:', requestOrigin);
      return res.status(400).json({ message: 'Email and password required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email, '| from:', requestOrigin);
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password mismatch for:', email, '| from:', requestOrigin);
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Determine the request origin (what the backend sees from the incoming request)
    const requestOrigin = req.get('origin') || req.headers.referer || `${req.protocol}://${req.get('host')}`;

    const response = {
      token,
      user: {
        userId: user._id,
        email: user.email,
        nickname: user.nickname,
        genres: user.genres,
        profilePic: user.profilePic
      },
      // Expose the origin so frontend can log and verify what the backend received
      requestOrigin
    };

    console.log('✅ Login successful from:', requestOrigin);
    res.json(response);
  } catch (err) {
    console.error('❌ Login failed from:', requestOrigin, '| Error:', err.message);
    const response = {
      message: err && err.message ? err.message : 'Server error.',
      stack: err && err.stack ? err.stack : null
    };
    res.status(500).json(response);
  }
};