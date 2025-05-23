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
  console.log('POST /cart/add hit', req.body); // <--- Add this
  // Accept JSON or form data
  const car_name = req.body.car_name || req.body.name;
  let price = req.body.price;

  if (!car_name || price === undefined) return res.status(400).send("Missing car_name or price");

  price = parseFloat(price);
  if (isNaN(price)) return res.status(400).send("Invalid price");

  if (!req.session.cart) req.session.cart = [];

  const cart = req.session.cart;
  const existing = cart.find(item => item.car_name === car_name);

  if (existing) {
    existing.quantity += 1;
  } else {
    req.session.cart.push({ car_name, price, quantity: 1 });
  }

  if (req.session.userId) {
    updateUserCart(req.session.userId, cart);
  }
  console.log('Session cart after add:', req.session.cart); // <-- Add this line

  // If AJAX, send JSON; else redirect
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json({ success: true, cart });
  }
  res.redirect('/cart');
});

// Remove item
router.post('/remove', (req, res) => {
  const car_name = req.body.car_name || req.body.name;
  req.session.cart = (req.session.cart || []).filter(item => item.car_name !== car_name);

  if (req.session.userId) {
    updateUserCart(req.session.userId, req.session.cart);
  }

  res.redirect('/cart');
});

// Decrement quantity
router.post('/decrement', (req, res) => {
  const car_name = req.body.car_name || req.body.name;
  if (!car_name) return res.status(400).send("Missing car_name");

  if (!req.session.cart) req.session.cart = [];
  const cart = req.session.cart;
  const existing = cart.find(item => item.car_name === car_name);

  if (existing && existing.quantity > 1) {
    existing.quantity -= 1;
  } else if (existing) {
    req.session.cart = cart.filter(item => item.car_name !== car_name);
  }

  if (req.session.userId) {
    updateUserCart(req.session.userId, req.session.cart);
  }

  res.redirect('/cart');
});

module.exports = {
  router,
  updateUserCart
};
