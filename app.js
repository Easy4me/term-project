const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');
const cars = require('./data/cars.json');

// use pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'pug'));

// static files (images, styles, etc) are in /PUBLIC
app.use(express.static(path.join(__dirname, 'public')));

// index.pug is the root page
app.get('/', (req, res) => {
  res.render('index', { cars });
});

app.get('/product/:shortName', (req, res) => {
  const car = cars.find(c => c.shortName === req.params.shortName);
  if (!car) {
    return res.status(404).send('404: product not found!');
  }
  res.render('product', { car });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
