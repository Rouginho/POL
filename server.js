const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const twilio = require('twilio');  // Εισαγωγή Twilio SDK

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

// Ρύθμιση σύνδεσης Twilio
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('✅ Connected to MySQL on Aiven');
});

app.post('/api/submit', (req, res) => {
  const { firstName, lastName, thl, perioxh, diefthinsi, koudouni, sxolia, cartItems } = req.body;

  // Έλεγχος για τα απαιτούμενα πεδία
  if (!firstName || !lastName || !thl || !perioxh || !diefthinsi || !cartItems || cartItems.length === 0) {
    return res.status(400).send({ message: 'Λείπουν απαραίτητα πεδία στο αίτημα.' });
  }

  // Εισαγωγή χρήστη στον πίνακα users
  db.query(
    'INSERT INTO users (first_name, last_name, thl, perioxh, diefthinsi, koudouni, sxolia, last_order_time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
    [firstName, lastName, thl, perioxh, diefthinsi, koudouni, sxolia],
    (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).send({ message: 'Σφάλμα κατά την αποθήκευση του χρήστη.' });
      }

      const userId = result.insertId; // Το user_id από την εισαγωγή του χρήστη

      // Εισαγωγή αντικειμένων παραγγελίας στον πίνακα users_order
      const orderItems = cartItems.map(item => [
        userId,  // Χρησιμοποιούμε το userId για να το συνδέσουμε με το χρήστη
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

        // Αποστολή SMS επιβεβαίωσης στον χρήστη μέσω Twilio
        client.messages
          .create({
            body: `Γεια σας ${firstName} ${lastName}, η παραγγελία σας καταχωρήθηκε επιτυχώς.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: thl  // Το τηλέφωνο του χρήστη
          })
          .then(message => {
            console.log('SMS sent:', message.sid);
            res.status(200).send({ message: 'Η παραγγελία καταχωρήθηκε και αποστάλθηκε επιβεβαίωση μέσω SMS!' });
          })
          .catch(err => {
            console.error('Error sending SMS:', err);
            res.status(500).send({ message: 'Σφάλμα κατά την αποστολή SMS επιβεβαίωσης.' });
          });
      });
    }
  );
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
