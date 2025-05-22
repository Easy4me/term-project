const express = require('express');
const router = express.Router();

// Get all products (for API or internal use)
router.get('/products', (req, res) => {
  const db = req.app.get('db');
  db.all('SELECT * FROM cars', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    rows.forEach(car => car.images = car.images ? JSON.parse(car.images) : []);
    res.json(rows);
  });
});

// View a single product (for /product/:shortName)
router.get('/product/:shortName', (req, res) => {
  const db = req.app.get('db');
  const shortNameParam = req.params.shortName.replace(/-/g, ' ').toLowerCase();

  db.all('SELECT * FROM cars', [], (err, rows) => {
    if (err) return res.status(500).send('Database error');

    // Match car name loosely to shortName
    const car = rows.find(c => c.car_name.toLowerCase().includes(shortNameParam));

    if (!car) return res.status(404).send('Car not found');

    car.images = car.images ? JSON.parse(car.images) : [];

    const product = {
      name: car.car_name,
      image: car.images[0],
      images: car.images,
      price: `$${car.price}`,
      description: car.description
    };

    res.render('product', {
      product,
      car: {
        movie: car.category,
        year: car.year || 'N/A'
      }
    });
  });
});

module.exports = router;
