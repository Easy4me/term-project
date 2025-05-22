const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json());

// Open database connection
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});
  
function initializeDatabase() {
  db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS database (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        car_name TEXT NOT NULL UNIQUE,
        price INTEGER,
        description TEXT,
        category TEXT DEFAULT 'uncategorized',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       )
    `, (err) => {
       if (err) {
         console.error('Error creating table:', err.message);
       } else {
         console.log('Database table: database, created or already exists.');
       }
    });
  });

      // Set up the database schema
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        cart INTEGER [],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      , (err) => {
       if (err) {
        console.error('Error creating table:', err.message);
       } else {
        console.log('Database table: users, created or already exists.');
       }
    });
  }); 
};

// Handle process termination and cleanup
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

// Export the function and the db instance
module.exports = {
  initializeDatabase,
  db,
};