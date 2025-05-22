const express = require('express');
const router = express.Router();

// Middleware to protect user-only routes
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// GET /profile — view user profile
router.get('/profile', isAuthenticated, (req, res) => {
  const db = req.app.get('db');
  const userId = req.session.user.id;

  db.get('SELECT id, username, email FROM users WHERE id = ?', [userId], (err, user) => {
    if (err || !user) return res.status(500).send("User not found");
    res.render('profile', { user });
  });
});

// (Optional) GET /profile/edit — show edit form
// (Optional) POST /profile/edit — save user updates

module.exports = router;
