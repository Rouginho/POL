require('dotenv').config(); // Για φόρτωση μεταβλητών περιβάλλοντος από .env
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Σύνδεση με MySQL (περάστε τα credentials μέσω .env για ασφάλεια)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    charset: 'utf8mb4'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1); // Τερματισμός αν αποτύχει η σύνδεση
    }
    console.log('✅ Connected to database');
});

app.post('/api/submit', (req, res) => {
    const { firstName, lastName, thl, perioxh, diefthinsi, koudouni, sxolia, cartItems } = req.body;
    
    if (!cartItems || cartItems.length === 0) {
        return res.status(400).send({ message: 'Το καλάθι είναι άδειο!' });
    }

    const userIp = req.ip;
    const userAgent = req.headers['user-agent'];
    const deviceHash = `${userIp}-${userAgent}`;

    // Έλεγχος αν αυτή η συσκευή έκανε παραγγελία το τελευταίο λεπτό
    const checkTimeSQL = `SELECT last_order_time FROM users WHERE device_hash = ? ORDER BY last_order_time DESC LIMIT 1`;
    
    db.query(checkTimeSQL, [deviceHash], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send({ message: 'Σφάλμα βάσης δεδομένων' });
        }

        if (results.length > 0) {
            const lastOrderTime = new Date(results[0].last_order_time);
            const currentTime = new Date();
            const timeDiff = (currentTime - lastOrderTime) / (1000 * 60); // Διαφορά σε λεπτά

            if (timeDiff < 1) {
                return res.status(429).send({ message: 'Πρέπει να περιμένετε 1 λεπτό πριν ξαναπαραγγείλετε.' });
            }
        }

        // Εισαγωγή παραγγελίας
        const sqlOrder = `
            INSERT INTO users (first_name, last_name, thl, perioxh, diefthinsi, koudouni, sxolia, device_hash, last_order_time) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        db.query(sqlOrder, [firstName, lastName, thl, perioxh, diefthinsi, koudouni, sxolia, deviceHash], (err, result) => {
            if (err) {
                console.error('Error saving order:', err);
                return res.status(500).send({ message: 'Αποτυχία αποθήκευσης παραγγελίας' });
            }

            const orderId = result.insertId;

            // Εισαγωγή των προϊόντων της παραγγελίας
            const sqlOrderItems = `INSERT INTO orders (order_id, name, price, quantity) VALUES ?`;
            const orderItems = cartItems.map(item => [orderId, item.name, item.price, item.quantity]);

            db.query(sqlOrderItems, [orderItems], (err, result) => {
                if (err) {
                    console.error('Error saving order items:', err);
                    return res.status(500).send({ message: 'Αποτυχία αποθήκευσης προϊόντων' });
                }

                res.status(200).send({ message: 'Η παραγγελία καταχωρήθηκε επιτυχώς!' });
            });
        });
    });
});

// Εκκίνηση server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
