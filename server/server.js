const express = require('express');
const { Client } = require('pg'); // Use pg for PostgreSQL
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Use process.env.PORT for Render

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the parent directory (your frontend)
app.use(express.static(path.join(__dirname, '..')));

// PostgreSQL Connection
const connectionString = process.env.DATABASE_URL || 'postgresql://andyssmash_db_user:H1LGLzPra4ww3o2gxa3B7RVNOAkyVfRV@dpg-d2iagtvdiees73d4pr3g-a.oregon-postgres.render.com/andyssmash_db';
const client = new Client({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false // Required for Render\'s SSL
    }
});

client.connect()
    .then(() => {
        console.log('Connected to PostgreSQL database.');
        // Create quotations table if it doesn\'t exist
        // Use SERIAL for auto-incrementing ID in PostgreSQL
        // Use TIMESTAMP for DATETIME
        return client.query(`
            CREATE TABLE IF NOT EXISTS quotations (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                whatsappNumber TEXT NOT NULL,
                size TEXT NOT NULL,
                type TEXT NOT NULL,
                details TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    })
    .then(() => {
        console.log('Quotations table created or already exists.');
    })
    .catch(err => {
        console.error('Error connecting to or creating table in PostgreSQL:', err.message);
    });

// API endpoint to save quotation data
app.post('/api/quotations', (req, res) => {
    const { name, whatsappNumber, size, type, details } = req.body;

    if (!name || !whatsappNumber || !size || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO quotations (name, whatsappNumber, size, type, details) VALUES ($1, $2, $3, $4, $5) RETURNING id'; // Use $1, $2 for parameterized queries
    const values = [name, whatsappNumber, size, type, details];

    client.query(query, values)
        .then(result => {
            const id = result.rows[0].id;
            console.log(`A row has been inserted with rowid ${id}`);
            res.status(201).json({ message: 'Quotation saved successfully', id: id });
        })
        .catch(err => {
            console.error('Error inserting data:', err.message);
            res.status(500).json({ error: 'Failed to save quotation' });
        });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    client.end()
        .then(() => {
            console.log('PostgreSQL connection closed.');
            process.exit(0);
        })
        .catch(err => {
            console.error('Error closing PostgreSQL connection:', err.message);
            process.exit(1);
        });
});

