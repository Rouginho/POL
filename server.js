Skip to content
You said:
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
  const { firstName, lastName, thl,email, perioxh, diefthinsi, koudouni, sxolia, cartItems } = req.body;

  if (!firstName || !lastName || !thl || !email || !perioxh || !diefthinsi || !cartItems || cartItems.length === 0) {
    return res.status(400).send({ message: 'Λείπουν απαραίτητα πεδία στο αίτημα.' });
  }

  db.query(
    'INSERT INTO users (first_name, last_name, thl,email, perioxh, diefthinsi, koudouni, sxolia, last_order_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
    [firstName, lastName, thl, email, perioxh, diefthinsi, koudouni, sxolia],
    (err, result) => {
      if (err) {
        console.error('Error inserting order:', err);
        return res.status(500).send({ message: 'Σφάλμα κατά την αποθήκευση της παραγγελίας.' });
      }

      const userId = result.insertId; // Ανάκτηση του user_id από την εισαγωγή χρήστη
      const orderId = userId; // Αν το order_id είναι ίδιο με το user_id

      // Καταχώρηση των αντικειμένων της παραγγελίας στον πίνακα users_order
      const orderItems = cartItems.map(item => [orderId, userId, item.name, item.price, item.quantity]);

      const sqlOrderItems = 'INSERT INTO users_order (order_id, user_id, name, price, quantity) VALUES ?';
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
});   εχω αυτο το backend server και θελω οταν ο χρηστης κανει submit με τα στοιχεια του να εμφανιζεται και κατι σαν id device το οποιο ειναι μοναδικο για αυτον ή το ip του οτιδηποτε ωστε να μην μπορει να ξαναπαραγγειλει για 10 λεπτα 
ChatGPT said:

Για να αποτρέψεις έναν χρήστη από το να κάνει δεύτερη παραγγελία μέσα σε 10 λεπτά, μπορείς να το πετύχεις με βάση είτε:

    τη διεύθυνση IP του, ή

    ένα μοναδικό "device ID" που αποθηκεύεις μέσω τοπικού storage/cookie στον client (π.χ. browser ή mobile app).

Παρακάτω σου δείχνω πώς να το κάνεις με IP address, που είναι η πιο απλή λύση server-side:
🔧 1. Απόκτηση της IP του χρήστη:

Μπορείς να πάρεις την IP του χρήστη έτσι:

const getUserIP = (req) => {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
};

🔒 2. Έλεγχος για πρόσφατη παραγγελία με ίδια IP:

Πριν αποθηκεύσεις την παραγγελία, έλεγξε αν υπάρχει ήδη παραγγελία από αυτή την IP μέσα στα τελευταία 10 λεπτά:

app.post('/api/submit', (req, res) => {
  const ipAddress = getUserIP(req);

  db.query(
    'SELECT * FROM users WHERE ip_address = ? AND last_order_time >= NOW() - INTERVAL 10 MINUTE',
    [ipAddress],
    (err, results) => {
      if (err) {
        console.error('Error checking previous orders:', err);
        return res.status(500).send({ message: 'Σφάλμα κατά τον έλεγχο προηγούμενης παραγγελίας.' });
      }

      if (results.length > 0) {
        return res.status(429).send({ message: 'Έχετε ήδη κάνει παραγγελία. Παρακαλώ περιμένετε 10 λεπτά.' });
      }

      // Συνεχίζει κανονικά την εισαγωγή
      const { firstName, lastName, thl, email, perioxh, diefthinsi, koudouni, sxolia, cartItems } = req.body;

      if (!firstName || !lastName || !thl || !email || !perioxh || !diefthinsi || !cartItems || cartItems.length === 0) {
        return res.status(400).send({ message: 'Λείπουν απαραίτητα πεδία στο αίτημα.' });
      }

      db.query(
        'INSERT INTO users (first_name, last_name, thl,email, perioxh, diefthinsi, koudouni, sxolia, ip_address, last_order_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [firstName, lastName, thl, email, perioxh, diefthinsi, koudouni, sxolia, ipAddress],
        (err, result) => {
          if (err) {
            console.error('Error inserting order:', err);
            return res.status(500).send({ message: 'Σφάλμα κατά την αποθήκευση της παραγγελίας.' });
          }

          const userId = result.insertId;
          const orderId = userId;

          const orderItems = cartItems.map(item => [orderId, userId, item.name, item.price, item.quantity]);
          const sqlOrderItems = 'INSERT INTO users_order (order_id, user_id, name, price, quantity) VALUES ?';

          db.query(sqlOrderItems, [orderItems], (err, result) => {
            if (err) {
              console.error('Error inserting order items:', err);
              return res.status(500).send({ message: 'Σφάλμα κατά την αποθήκευση των προϊόντων.' });
            }
            res.status(200).send({ message: 'Η παραγγελία καταχωρήθηκε επιτυχώς!' });
          });
        }
      );
    }
  );
});

🗃️ 3. Προσθήκη πεδίου ip_address στον πίνακα users:

Βεβαιώσου ότι έχεις προσθέσει μια στήλη ip_address στον πίνακα users:

ALTER TABLE users ADD COLUMN ip_address VARCHAR(45);

Αν προτιμάς να το κάνεις με device ID (client-side identifier) αντί για IP, μπορούμε να το υλοποιήσουμε με localStorage ή cookies — απλά πες μου και σου δείχνω τον κώδικα.

Θες να σου δείξω πώς γίνεται με device ID στον browser;
You said:
πως γραφω εντολη για να μου εμφανιστουν ολα τα columns του πινακα users για να στα στειλω και να μου πεις που πρεπει να τοποθετηθει η νεα γραμμγ
ChatGPT said:

Μπορείς να δεις όλα τα columns του πίνακα users με την εξής SQL εντολή:

DESCRIBE users;

ή εναλλακτικά:

SHOW COLUMNS FROM users;

Αυτές οι εντολές θα σου εμφανίσουν το όνομα κάθε στήλης, τον τύπο της, αν επιτρέπεται NULL, αν είναι PRIMARY KEY, κλπ.

Στείλε μου το αποτέλεσμα για να σου πω πού είναι καλύτερο να τοποθετηθεί το νέο πεδίο ip_address.
You said:
γιατι δεν θελω να χαλασω τον πινακα αυτον , φτιαξε μου εναν νεο με ολα αυτα που εχει 
ChatGPT said:

Τέλεια, μπορείς να δημιουργήσεις έναν νέο πίνακα που θα έχει όλα τα πεδία του users συν το νέο πεδίο ip_address, χωρίς να πειράξεις τον αρχικό πίνακα.

Ακολουθεί η SQL εντολή για να αντιγράψεις τη δομή και τα δεδομένα του users και να προσθέσεις τη στήλη ip_address:
✅ Βήμα 1: Δημιουργία αντιγράφου του πίνακα users

CREATE TABLE users_new LIKE users;

✅ Βήμα 2: Αντιγραφή όλων των υπαρχόντων δεδομένων

INSERT INTO users_new SELECT * FROM users;

✅ Βήμα 3: Προσθήκη της στήλης ip_address

ALTER TABLE users_new ADD COLUMN ip_address VARCHAR(45) AFTER sxolia;

(ή βάλε AFTER σε οποιαδήποτε άλλη στήλη θέλεις)

Έτσι, έχεις έναν νέο πίνακα users_new που περιλαμβάνει όλα τα δεδομένα και επιπλέον το νέο πεδίο IP address, χωρίς να πειράξεις τον παλιό πίνακα.

Θες να σου δώσω και το full SQL σε ένα μπλοκ για να το τρέξεις με copy/paste κατευθείαν;
You said:
αρα ο νεος κωδικας του server.js πως θα γινει δωστον ολοκληρο 
ChatGPT said:

Below is the complete server.js, updated to write into your new users_new table (which has all the original columns plus ip_address), and to block repeat orders from the same IP for 10 minutes:

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
  // standard header set by proxies/load-balancers:
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

  // 1) Check for recent order from this IP in last 10 minutes
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
      return res
        .status(429)
        .send({ message: 'Έχετε ήδη κάνει παραγγελία. Παρακαλώ περιμένετε 10 λεπτά πριν ξαναδοκιμάσετε.' });
    }

    // 2) Insert new user/order record
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

      // 3) Bulk insert order items
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

Τι άλλαξε

    Νέος πίνακας: όλα τα queries πλέον δείχνουν σε users_new (ο αρχικός users παραμένει άθικτος).

    IP rate-limiting: πριν την εισαγωγή, γίνεται SELECT για να δούμε αν υπάρχει εγγραφή με ίδια ip_address και last_order_time εντός 10 λεπτών.

    ip_address column: εισάγεται στην εγγραφή μέσω INSERT INTO users_new (..., ip_address, ...).

Αν τρέξεις παράλληλα τα τρία DDL/DML βήματα που σου έδωσα για να δημιουργήσεις/αντιγράψεις τον πίνακα, ο server σου θα δουλεύει ακριβώς όπως πριν, με το επιπλέον φιλτράρισμα των αιτημάτων ανά 10λεπτο.


ChatGPT can make mistakes. Check important info.
