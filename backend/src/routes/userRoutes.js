const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Profile routes
router.get('/profile', auth, userController.getProfile);
router.get('/profile/:username', userController.getUserProfileByUsername); // New public route
router.put('/profile/genres', auth, userController.updateGenres);

module.exports = router;