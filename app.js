const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

const cars = require('./data/cars.json'); // for front-end demo rendering
//const db = require('./data/data.js');     

const cartRouter = require('./routes/cart');
app.use('/cart', cartRouter);  // Mount it to root so /cart/add and /cart/remove work

app.use(session({
  secret: 'your-secret-key', // change this in production!
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set true only with HTTPS
}));

// SQLite connection
const { initializeDatabase, db } = require('./data/data');

// Call the function to set up the table
initializeDatabase();

// Use Pug and views folder
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'pug'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ---------------------------
   PUG VIEW ROUTES
---------------------------- */

// Homepage with slideshow
app.get('/', (req, res) => {
  const slideshowImages = cars.map(car => car.images[0]);
  res.render('index', { cars, slideshowImages });
});

// Product detail page
app.get('/product/:shortName', (req, res) => {
  const car = cars.find(c => c.shortName === req.params.shortName);
  if (!car || !Array.isArray(car.images) || car.images.length === 0) {
    return res.status(404).send('404: product not found!');
  }
  const carImages = car.images;
  res.render('product', { car, carImages });
});

// Static pages
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('registration'));
app.get('/cart', (req, res) => {
  const cartItems = req.session.cart || [];
  res.render('cart', {cartItems});});
app.get('/checkout', (req, res) => res.render('checkout'));
app.get('/profile', (req, res) => {
  const user = { username: "Guest", email: "guest@example.com" }; // mock user
  res.render('profile', { user });
});
app.get('/about', (req, res) => res.render('about-faq'));
app.get('/order-confirmed', (req, res) => res.render('order-confirmed'));

/* ---------------------------
   PRODUCTS API (DATABASE)
---------------------------- */

// Get all cars
app.get('/products', (req, res) => {
  db.all('SELECT * FROM database', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get one car by ID
app.get('/products/:id', (req, res) => {

  db.get('SELECT * FROM database WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Car not found' });
    
    if (row.cart) {
      try {
        const cartArray = JSON.parse(row.cart);
        console.log("Cart items:", cartArray);
      } catch (e) {
        console.error("Failed to parse cart JSON:", e.message);
      } 
    }
    
    res.json(row);
  });
});

// Create a new car
app.post('/products', (req, res) => {
  const { id, car_name, price, category } = req.body;
  if (!car_name || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.run(
    `INSERT INTO database (id, car_name, price, category) 
     VALUES (?, ?, ?, ?)`,
    [id, car_name, price, category || 'uncategorized'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: 'Car added successfully' });
    }
  );
});

// Update a car
app.put('/products/:id', (req, res) => {
  const { car_name, price, category } = req.body;
  if (!car_name || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.run(
    `UPDATE database 
     SET car_name = ?, price = ?, category = ? 
     WHERE id = ?`,
    [car_name, price, category || 'uncategorized', req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Car not found' });
      res.json({ message: 'Car updated successfully' });
    }
  );
});
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, user) => {
    if (err || !user) return res.status(401).send('Invalid login');

    req.session.userId = user.id;
    req.session.cart = JSON.parse(user.cart || '[]'); // Load saved cart into session
    res.redirect('/profile');
  });
});

// Delete a car
app.delete('/products/:id', (req, res) => {
  db.run('DELETE FROM database WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Car not found' });
    res.json({ message: 'Car deleted successfully' });
  });
});

app.post('/logout', (req, res) => {
  if (req.session.userId && req.session.cart) {
    updateUserCart(req.session.userId, req.session.cart);
  }
  req.session.destroy(() => res.redirect('/'));
});

/* ---------------------------
   404 FALLBACK
---------------------------- */
app.use((req, res) => {
  res.status(404).send("404: Page Not Found");
});

/* ---------------------------
   START SERVER
---------------------------- */
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});


