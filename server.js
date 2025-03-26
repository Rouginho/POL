const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  charset: 'utf8mb4'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ Connected to MySQL on Aiven');
});

app.post('/api/submit', (req, res) => {
    const { firstName, lastName, thl, perioxh, diefthinsi, koudouni, sxolia, cartItems } = req.body;

    // Εισαγωγή νέας παραγγελίας
    const sqlOrder = 'INSERT INTO users (first_name, last_name, thl, perioxh, diefthinsi, koudouni, sxolia, last_order_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())';
    db.query(sqlOrder, [firstName, lastName, thl, perioxh, diefthinsi, koudouni, sxolia], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Error saving order' });
        }

        const orderId = result.insertId;
        const sqlOrderItems = 'INSERT INTO users_order (order_id, name, price, quantity) VALUES ?';
        const orderItems = cartItems.map(item => [orderId, item.name, item.price, item.quantity]);

        db.query(sqlOrderItems, [orderItems], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ message: 'Error saving order items' });
            }

            res.status(200).send({ message: 'Order placed successfully!' });
        });
    });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});

