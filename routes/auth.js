const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Render login/register views
router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('registration'));

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Login POST
router.post('/login', (req, res) => {
  const db = req.app.get('db');
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) return res.send('Login failed');

    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        req.session.user = { id: user.id, username: user.username, email: user.email };
        res.redirect('/profile');
      } else {
        res.send('Invalid email or password');
      }
    });
  });
});

// Register POST
router.post('/register', (req, res) => {
  const db = req.app.get('db');
  const { firstname, lastname, username, email, password } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.send('Server error');

    db.run(
      'INSERT INTO users (firstname, lastname, username, email, password) VALUES (?, ?, ?, ?, ?)',
      [firstname, lastname, username, email, hashedPassword],
      (err) => {
        if (err) return res.send('Registration failed');
        res.redirect('/login');
      }
    );
  });
});

module.exports = router;
