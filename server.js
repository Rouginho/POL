const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');
require('dotenv').config();

// Ορισμός του app με το Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Σύνδεση στη βάση δεδομένων MySQL
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

      const userId = result.insertId; // Το userId που επιστρέφει από την εισαγωγή του χρήστη

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

        // Προσθήκη του +30 στο τηλέφωνο του χρήστη
        const formattedPhoneNumber = `+30${thl}`;

        // Στείλτε SMS επιβεβαίωσης μέσω Twilio
        client.messages.create({
          body: 'Η παραγγελία σας καταχωρήθηκε επιτυχώς!',
          from: process.env.TWILIO_PHONE_NUMBER, // Ο αριθμός τηλεφώνου Twilio από το .env
          to: formattedPhoneNumber // Ο αριθμός τηλεφώνου του χρήστη με το +30 μπροστά
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
);

// Εκκίνηση του server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
