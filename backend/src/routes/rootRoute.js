const express = require('express');
const router = express.Router();

// Root route - redirect to frontend
router.get('/', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  // Send HTML with JavaScript redirect
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Redirecting to TuneIn...</title>
        <script>
          window.location.href = '${frontendUrl}';
        </script>
      </head>
      <body>
        <p>Redirecting to TuneIn...</p>
        <p>If you are not redirected automatically, <a href="${frontendUrl}">click here</a>.</p>
      </body>
    </html>
  `);
});

module.exports = router;
