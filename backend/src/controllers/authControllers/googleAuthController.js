// src/controllers/authControllers/googleAuthController.js
const jwt = require('jsonwebtoken');

const googleCallback = (req, res) => {
  try {
    if (!req.user) {
      throw new Error('User authentication failed via Google');
    }

    // 1. יצירת הטוקן (זהה ל-loginController)
    const payload = { userId: req.user._id, email: req.user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // 2. הפניה חזרה ל-Frontend עם הטוקן ו-userId כ-Query Parameters
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // ניצור URL לטיפול ב-Callback בצד ה-Frontend
    const redirectUrl = new URL(`${frontendUrl}/auth/callback`);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('userId', req.user._id);

    res.redirect(redirectUrl.toString());

  } catch (err) {
    console.error('Error in Google Auth Controller:', err);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth?error=true`);
  }
};

module.exports = {
  googleCallback
};
