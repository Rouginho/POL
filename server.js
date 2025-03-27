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

        // Προσθήκη του +30 στο τηλέφωνο του χρήστη
        const formattedPhoneNumber = `+30${thl}`;

        // Στείλτε SMS επιβεβαίωσης μέσω Twilio
        client.messages.create({
          body: 'Η παραγγελία σας καταχωρήθηκε επιτυχώς!',
          from: process.env.TWILIO_PHONE_NUMBER, 
          to: formattedPhoneNumber
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
