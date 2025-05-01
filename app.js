// app.js

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Simple test route
app.get('/', (req, res) => {
  res.send('Welcome to the E-Commerce App');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
