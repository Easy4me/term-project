const express = require('express');
const router = express.Router();
const { db } = require('../data/data');

//Update user table
const updateUserCart = (userId, cart) => {
  const cartString = JSON.stringify(cart);
  db.run(`UPDATE users SET cart = ? WHERE id = ?`, [cartString, userId], (err) => {
    if (err) console.error('Failed to update cart:', err.message);
  });
};

// Add to cart
router.post('/add', (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) return res.status(400).send("Missing name or price");

  if (!req.session.cart) req.session.cart = [];

  const cart = req.session.cart;
  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.quantity += 1;
  } else {
    req.session.cart.push({ name, price: parseFloat(price), quantity: 1 });
  }
  
  //If user logged in, 
  if (req.session.userId) {
    updateUserCart(req.session.userId, cart);
  }

  res.redirect('/cart');
});

// Remove item
router.post('/remove', (req, res) => {
  const { name } = req.body;
  req.session.cart = (req.session.cart || []).filter(item => item.name !== name);

  //updated cart to DB if user is logged in
  if (req.session.userId) {
    updateUserCart(req.session.userId, req.session.cart);
  }

  res.redirect('/cart');
});


module.exports = router;