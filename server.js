const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  charset: 'utf8mb4'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);  // More detailed error logging
    return;
  }
  console.log('✅ Connected to MySQL on Aiven');
});

app.post('/api/submit', (req, res) => {
  const { firstName, lastName, thl, perioxh, diefthinsi, koudouni, sxolia, cartItems } = req.body;

  // Έλεγχος αν υπάρχουν τα απαραίτητα πεδία στο αίτημα
  if (!firstName || !lastName || !thl || !perioxh || !diefthinsi || !cartItems || cartItems.length === 0) {
    return res.status(400).send({ message: 'Λείπουν απαραίτητα πεδία στο αίτημα.' });
  }

  // Εισαγωγή νέας παραγγελίας
  const sqlOrder = 'INSERT INTO users (first_name, last_name, thl, perioxh, diefthinsi, koudouni, sxolia, last_order_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())';
  db.query(sqlOrder, [firstName, lastName, thl, perioxh, diefthinsi, koudouni, sxolia], (err, result) => {
      if (err) {
        console.error('Error inserting order:', err);  // More detailed error logging
        return res.status(500).send({ message: 'Σφάλμα κατά την αποθήκευση της παραγγελίας.' });
      }

      const orderId = result.insertId;
      const sqlOrderItems = 'INSERT INTO users_order (order_id, name, price, quantity) VALUES ?';
      const orderItems = cartItems.map(item => [orderId, item.name, item.price, item.quantity]);

      db.query(sqlOrderItems, [orderItems], (err, result) => {
          if (err) {
            console.error('Error inserting order items:', err);  // More detailed error logging
            return res.status(500).send({ message: 'Σφάλμα κατά την αποθήκευση των προϊόντων.' });
          }

          res.status(200).send({ message: 'Η παραγγελία καταχωρήθηκε επιτυχώς!' });
      });
  });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
