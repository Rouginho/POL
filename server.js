const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');
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

// Σύνδεση Twilio
const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

app.post('/api/submit', (req, res) => {
  const { firstName, lastName, thl, perioxh, diefthinsi, koudouni, sxolia, cartItems, phoneNumber } = req.body;

  if (!firstName || !lastName || !thl || !perioxh || !diefthinsi || !cartItems || cartItems.length === 0 || !phoneNumber) {
    return res.status(400).send({ message: 'Λείπουν απαραίτητα πεδία στο αίτημα.' });
  }

  db.query(
    'INSERT INTO users (first_name, last_name, thl, perioxh, diefthinsi, koudouni, sxolia, last_order_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
    [firstName, lastName, thl, perioxh, diefthinsi, koudouni, sxolia],
    (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).send({ message: 'Σφάλμα κατά την αποθήκευση του χρήστη.' });
      }

      const userId = result.insertId;

      const orderItems = cartItems.map(item => [
        userId, 
        item.name,
        item.price,
        item.quantity
      ]);

      const sqlOrderItems = 'INSERT INTO users_order (user_id, name, price, quantity) VALUES ?';
      db.query(sqlOrderItems, [orderItems], (err, result) => {
        if (err) {
          console.error('Error inserting order items:', err);
          return res.status(500).send({ message: 'Σφάλμα κατά την αποθήκευση των προϊόντων.' });
        }

        // Στείλτε SMS επιβεβαίωσης μέσω Twilio
        client.messages.create({
          body: 'Η παραγγελία σας καταχωρήθηκε επιτυχώς!',
          from: process.env.TWILIO_PHONE_NUMBER, 
          to: phoneNumber
        })
        .then((message) => {
          console.log(`SMS sent with SID: ${message.sid}`);
          res.status(200).send({ message: 'Η παραγγελία καταχωρήθηκε επιτυχώς και το SMS επιβεβαίωσης στάλθηκε!' });
        })
        .catch((error) => {
          console.error('Error sending SMS:', error);
          res.status(500).send({ message: 'Σφάλμα κατά την αποστολή SMS.' });
        });
      });
    }
  );
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
