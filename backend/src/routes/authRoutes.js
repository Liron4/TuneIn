const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const registerController = require('../controllers/registerController');
const loginController = require('../controllers/loginController');

// Multer config for profile pic uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });


// Registration route (with profile pic upload)
router.post('/register', upload.single('profilePic'), registerController.register);

// Login route
router.post('/login', loginController.login);

module.exports = router;