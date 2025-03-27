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
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('✅ Connected to MySQL on Aiven');
});

app.post('/api/submit', (req, res) => {
  const { firstName, lastName, thl, perioxh, diefthinsi, koudouni, sxolia, cartItems } = req.body;

  if (!firstName || !lastName || !thl || !perioxh || !diefthinsi || !cartItems || cartItems.length === 0) {
    return res.status(400).send({ message: 'Λείπουν απαραίτητα πεδία στο αίτημα.' });
  }

  // Εισαγωγή του χρήστη πρώτα
  db.query(
    'INSERT INTO users (first_name, last_name, thl, perioxh, diefthinsi, koudouni, sxolia, last_order_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
    [firstName, lastName, thl, perioxh, diefthinsi, koudouni, sxolia],
    (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).send({ message: 'Σφάλμα κατά την αποθήκευση του χρήστη.' });
      }

      const userId = result.insertId; // Το user_id του νέου χρήστη
      const orderId = userId;  // Ή μπορείς να το αφήσεις να το δημιουργήσεις μόνο του για τις παραγγελίες

      const orderItems = cartItems.map(item => [
        orderId,  // Χρησιμοποιούμε το userId για να συνδέσουμε την παραγγελία με το χρήστη
        item.name,
        item.price,
        item.quantity,
        firstName,  // Το πρώτο όνομα του χρήστη
        lastName    // Το επώνυμο του χρήστη
      ]);

      const sqlOrderItems = 'INSERT INTO users_order (order_id, user_id, name, price, quantity, first_name, last_name) VALUES ?';
      db.query(sqlOrderItems, [orderItems], (err, result) => {
        if (err) {
          console.error('Error inserting order items:', err);
          return res.status(500).send({ message: 'Σφάλμα κατά την αποθήκευση των προϊόντων.' });
        }
        res.status(200).send({ message: 'Η παραγγελία καταχωρήθηκε επιτυχώς!' });
      });
    }
  );
});


app.listen(5000, () => {
  console.log('Server running on port 5000');
});
