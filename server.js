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

  db.beginTransaction(err => {
    if (err) {
      console.error('Transaction Error:', err);
      return res.status(500).send({ message: 'Σφάλμα κατά την έναρξη συναλλαγής.' });
    }

    // 1️⃣ Εισαγωγή του χρήστη
    const insertUserQuery = `
      INSERT INTO users (first_name, last_name, thl, perioxh, diefthinsi, koudouni, sxolia, last_order_time) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    db.query(insertUserQuery, [firstName, lastName, thl, perioxh, diefthinsi, koudouni, sxolia], (err, userResult) => {
      if (err) {
        console.error('Error inserting user:', err);
        return db.rollback(() => res.status(500).send({ message: 'Σφάλμα κατά την αποθήκευση του χρήστη.' }));
      }

      const userId = userResult.insertId;

      // 2️⃣ Δημιουργία νέας παραγγελίας
      const insertOrderQuery = `INSERT INTO orders (user_id, order_time) VALUES (?, NOW())`;

      db.query(insertOrderQuery, [userId], (err, orderResult) => {
        if (err) {
          console.error('Error inserting order:', err);
          return db.rollback(() => res.status(500).send({ message: 'Σφάλμα κατά την αποθήκευση της παραγγελίας.' }));
        }

        const orderId = orderResult.insertId; // Το μοναδικό order_id

        // 3️⃣ Εισαγωγή προϊόντων στην παραγγελία
        const orderItems = cartItems.map(item => [
          orderId,
          userId,
          item.name,
          item.price,
          item.quantity
        ]);

        const insertOrderItemsQuery = `
          INSERT INTO users_order (order_id, user_id, name, price, quantity) VALUES ?
        `;

        db.query(insertOrderItemsQuery, [orderItems], (err) => {
          if (err) {
            console.error('Error inserting order items:', err);
            return db.rollback(() => res.status(500).send({ message: 'Σφάλμα κατά την αποθήκευση των προϊόντων.' }));
          }

          db.commit(err => {
            if (err) {
              console.error('Transaction commit error:', err);
              return db.rollback(() => res.status(500).send({ message: 'Σφάλμα κατά την ολοκλήρωση της παραγγελίας.' }));
            }

            res.status(200).send({ message: 'Η παραγγελία καταχωρήθηκε επιτυχώς!' });
          });
        });
      });
    });
  });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
