const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();  // Για να διαβάσουμε τα περιβαλλοντικά μεταβλητά

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,  // Προσθέτουμε και το port από το περιβάλλον
  charset: 'utf8mb4'
});

// Σύνδεση με τη βάση δεδομένων
db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);  // Εμφάνιση του σφάλματος σύνδεσης
    return;
  }
  console.log('✅ Connected to MySQL on Aiven');
});

app.post('/api/submit', (req, res) => {
    const { firstName, lastName, thl, perioxh, diefthinsi, koudouni, sxolia, cartItems } = req.body;

    // Προσθήκη logs για να δούμε τα δεδομένα του request
    console.log("Request Data:", req.body);

    // Εισαγωγή νέας παραγγελίας
    const sqlOrder = 'INSERT INTO users (first_name, last_name, thl, perioxh, diefthinsi, koudouni, sxolia, last_order_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())';
    
    // Ελέγχουμε τα δεδομένα που αποστέλλονται στο SQL
    console.log("SQL Query Data:", firstName, lastName, thl, perioxh, diefthinsi, koudouni, sxolia);

    db.query(sqlOrder, [firstName, lastName, thl, perioxh, diefthinsi, koudouni, sxolia], (err, result) => {
        if (err) {
            console.error("SQL Error:", err);  // Εμφάνιση του σφάλματος SQL
            return res.status(500).send({ message: 'Error saving order', error: err });
        }

        const orderId = result.insertId;
        const sqlOrderItems = 'INSERT INTO users_order (order_id, name, price, quantity) VALUES ?';
        const orderItems = cartItems.map(item => [orderId, item.name, item.price, item.quantity]);

        // Ελέγχουμε τα δεδομένα των προϊόντων που προστίθενται στην παραγγελία
        console.log("Order Items Data:", orderItems);

        db.query(sqlOrderItems, [orderItems], (err, result) => {
            if (err) {
                console.error("SQL Error:", err);  // Εμφάνιση του σφάλματος SQL για τα items
                return res.status(500).send({ message: 'Error saving order items', error: err });
            }

            // Αν όλα πάνε καλά, στέλνουμε επιτυχία στο client
            res.status(200).send({ message: 'Order placed successfully!' });
        });
    });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
