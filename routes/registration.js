// routes/registration.js

const express = require('express');
const router = express.Router();
const { db } = require('../data/data'); // adjust path if needed

router.post('/', (req, res) => {
  const { firstname, lastname, username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).send('All fields are required.');
  }

  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match.');
  }

  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err) return res.status(500).send('Database error.');
    if (user) return res.status(400).send('Username already taken.');

    db.run(
      `INSERT INTO users (firstname, lastname, username, email, password, cart) VALUES (?, ?, ?, ?, ?, ?)`,
      [firstname, lastname, username, email, password, JSON.stringify([])],
      function (err) {
        if (err) return res.status(500).send('Error creating account.');
        res.redirect('/login');
      }
    );
  });
});


module.exports = router;
