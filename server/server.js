const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the parent directory (your frontend)
app.use(express.static(path.join(__dirname, '..')));

// Initialize SQLite database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create quotations table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS quotations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            whatsappNumber TEXT NOT NULL,
            size TEXT NOT NULL,
            type TEXT NOT NULL,
            details TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (createErr) => {
            if (createErr) {
                console.error('Error creating table:', createErr.message);
            } else {
                console.log('Quotations table created or already exists.');
            }
        });
    }
});

// API endpoint to save quotation data
app.post('/api/quotations', (req, res) => {
    const { name, whatsappNumber, size, type, details } = req.body;

    if (!name || !whatsappNumber || !size || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare('INSERT INTO quotations (name, whatsappNumber, size, type, details) VALUES (?, ?, ?, ?, ?)');
    stmt.run(name, whatsappNumber, size, type, details, function(err) {
        if (err) {
            console.error('Error inserting data:', err.message);
            return res.status(500).json({ error: 'Failed to save quotation' });
        }
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        res.status(201).json({ message: 'Quotation saved successfully', id: this.lastID });
    });
    stmt.finalize();
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
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
