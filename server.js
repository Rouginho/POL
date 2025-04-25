const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Helper to get client IP
const getUserIP = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  return forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
};

const db = mysql.createConnection({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT,
  charset:  'utf8mb4'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL on Aiven');
});

app.post('/api/submit', (req, res) => {
  const ipAddress = getUserIP(req);
  const {
    firstName,
    lastName,
    thl,
    email,
    perioxh,
    diefthinsi,
    koudouni,
    sxolia,
    cartItems
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !thl || !email || !perioxh || !diefthinsi || !cartItems || cartItems.length === 0) {
    return res.status(400).send({ message: 'Λείπουν απαραίτητα πεδία στο αίτημα.' });
  }

  // 1) Έλεγχος για παραγγελία από αυτή την IP εντός 10 λεπτών
  const checkSql = `
    SELECT 1
      FROM users_new
     WHERE ip_address = ?
       AND last_order_time >= NOW() - INTERVAL 10 MINUTE
    LIMIT 1
  `;
  db.query(checkSql, [ipAddress], (err, rows) => {
    if (err) {
      console.error('Error checking recent order:', err);
      return res.status(500).send({ message: 'Σφάλμα κατά τον έλεγχο προηγούμενης παραγγελίας.' });
    }

    if (rows.length) {
      // Νέο μήνυμα για επαναυποβολή πριν περάσει ο χρόνος
      return res
        .status(429)
        .send({ message: 'Έχετε πραγματοποιήσει παραγγελία. Δοκιμάστε ξανά αργότερα.' });
    }

    // 2) Εισαγωγή νέας παραγγελίας
    const insertUserSql = `
      INSERT INTO users_new
        (first_name, last_name, thl, email, perioxh, diefthinsi, koudouni, sxolia, ip_address, last_order_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const userParams = [firstName, lastName, thl, email, perioxh, diefthinsi, koudouni, sxolia, ipAddress];

    db.query(insertUserSql, userParams, (err, result) => {
      if (err) {
        console.error('Error inserting order:', err);
        return res.status(500).send({ message: 'Σφάλμα κατά την αποθήκευση της παραγγελίας.' });
      }

      const userId  = result.insertId;
      const orderId = userId;  // assuming order_id = user_id

      // 3) Εισαγωγή προϊόντων παραγγελίας
      const orderItems = cartItems.map(item => [
        orderId,
        userId,
        item.name,
        item.price,
        item.quantity
      ]);

      const insertItemsSql = `
        INSERT INTO users_order
          (order_id, user_id, name, price, quantity)
        VALUES ?
      `;
      db.query(insertItemsSql, [orderItems], (err) => {
        if (err) {
          console.error('Error inserting order items:', err);
          return res.status(500).send({ message: 'Σφάλμα κατά την αποθήκευση των προϊόντων.' });
        }

        res.status(200).send({ message: 'Η παραγγελία καταχωρήθηκε επιτυχώς!' });
      });
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
