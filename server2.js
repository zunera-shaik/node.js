const express = require('express');
const admin = require('firebase-admin');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Firebase Admin SDK
const serviceAccount = require('./firebase-admin.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => res.redirect('/signup.html'));

// Signup: create user + save to Firestore
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await admin.auth().createUser({ email, password });

    // Save to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.redirect('/login.html');
  } catch (error) {
    res.send(`Signup Error: ${error.message}`);
  }
});

// Login: just redirect (Firebase Admin can't verify password)
app.post('/login', (req, res) => {
  res.redirect('/home.html');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
