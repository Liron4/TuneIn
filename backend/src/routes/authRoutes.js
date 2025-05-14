const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const registerController = require('../controllers/authControllers/registerController');
const loginController = require('../controllers/authControllers/loginController');

// Temporary memory storage for multer
// We'll only use this to parse the multipart form data, not for storing
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Registration route (with profile pic upload)
router.post('/register', upload.single('profilePic'), registerController.register);

// Login route
router.post('/login', loginController.login);

module.exports = router;