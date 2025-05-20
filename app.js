const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');

// use pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'pug'));

// static files (images, styles, etc) are in /PUBLIC
app.use(express.static(path.join(__dirname, 'public')));

// index.pug is the root page
app.get('/', (req, res) => {
  res.render('index');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
