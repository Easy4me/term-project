// Add to cart
router.post('/cart/add', (req, res) => {
  const { name, price } = req.body;
  if (!req.session.cart) req.session.cart = [];

  const cart = req.session.cart;
  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }

  res.redirect('/cart');
});

// Remove item
router.post('/cart/remove', (req, res) => {
  const { name } = req.body;
  req.session.cart = (req.session.cart || []).filter(item => item.name !== name);
  res.redirect('/cart');
});
