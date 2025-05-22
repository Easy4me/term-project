const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');
const cars = require('./data/cars.json');
const { initializeDatabase, db } = require('./data/data.js');

// use pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'pug'));

// static files (images, styles, etc) are in /public
app.use(express.static(path.join(__dirname, 'public')));

// Initialize the table(s)
// initializeDatabase();  -- similar to problem in data.js (this function does not exist)

// index.pug is the root page
app.get('/', (req, res) => {
  const slideshowImages = cars.map(car => car.images[0]);
  res.render('index', { cars, slideshowImages });
});

app.get('/product/:shortName', (req, res) => {
  const car = cars.find(c => c.shortName === req.params.shortName);
  if (!car) {
    return res.status(404).send('404: product not found!');
  }
  res.render('product', { car });
});

// Get all cars (from database)
app.get('/products', (req, res) => {
  db.all('SELECT * FROM database', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get a specific car (from database)
app.get('/products/:id', (req, res) => {
  db.get('SELECT * FROM database WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(row);
  });
});

// Create a car
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
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        id: this.lastID,
        message: 'Car added successfully'
      });
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
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Car not found' });
      }

      res.json({ message: 'Car updated successfully' });
    }
  );
});

// Delete a car
app.delete('/cart/:id', (req, res) => {
  db.run('DELETE FROM database WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json({ message: 'Car deleted successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


const sqlite3 = require('sqlite3').verbose();

// Connect to (or create) the database file
// const db = new sqlite3.Database('mydatabase.db');        --added by Manuel
// ^ adding this line broke the app so I have commented it out for now --John