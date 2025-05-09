const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json());

// Open database connection
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
   
    // Set up the database schema
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
          console.log('Database table created or already exists.');
        }
      });
    });

    // Set up the database schema
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
          firstname TEXT NOT NULL UNIQUE,
          lastname TEXT NOT NULL UNIQUE,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL UNIQUE,
          email TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`
      , (err) => {
        if (err) {
         console.error('Error creating table:', err.message);
        } else {
         console.log('Database table created or already exists.');
        }
      });
    });
  }
});

/*
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
   
    // Set up the database schema
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
          firstname TEXT NOT NULL UNIQUE,
          lastname TEXT NOT NULL UNIQUE,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL UNIQUE,
          email TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )`
      , (err) => {
        if (err) {
         console.error('Error creating table:', err.message);
        } else {
         console.log('Database table created or already exists.');
        }
      });
    });
  }
});

*/

// Create a car
app.post('/products', (req, res) => {
  const { id, car_name, price, category } = req.body;
  
  if (!car_name || !price ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.run(
    `INSERT INTO database (id, car_name, price, category) 
     VALUES (?, ?, ?, ?)`,
    [id, car_name, price, category || 'uncategorized'],
    function(err) {
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

// Get all cars
app.get('/products', (req, res) => {
  db.all('SELECT * FROM database', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get a specific car
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

// Update a car 
app.put('/products/:id', (req, res) => {
  const { id, car_name, price, category } = req.body;
  
  if (!car_name || !price ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.run(
    `UPDATE database 
     SET car_name = ?, price = ?, category = ? 
     WHERE id = ?`,
    [car_name, price, category || 'uncategorized', req.params.id],
    function(err) {
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
  db.run('DELETE FROM database WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    res.json({ message: 'Car deleted successfully' });
  });
});
/*

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
*/

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