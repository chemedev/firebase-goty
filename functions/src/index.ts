import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
//
// Credentials
//
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://gotysurvey.firebaseio.com',
});
const db = admin.firestore();

//
// Functions
//
export const helloWorld = functions.https.onRequest((req, res) => {
  res.json({
    mensaje: 'Hello gamers from Firebase!',
  });
});

export const getGOTY = functions.https.onRequest(async (req, res) => {
  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get();
  const games = docsSnap.docs.map((doc) => doc.data());

  res.json(games);
});
//
// Express
//
const app = express().use(cors({ origin: true }));

app.get('/goty', async (req, res) => {
  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get();
  const games = docsSnap.docs.map((doc) => doc.data());

  res.json(games);
});

app.post('/goty/:id', async (req, res) => {
  const id = req.params.id;
  const gameRef = db.collection('goty').doc(id);
  const gameSnap = await gameRef.get();

  if (!gameSnap.exists) {
    res
      .status(404)
      .json({ ok: false, mensaje: 'No existe un juego con el ID', id });
  } else {
    const antes = gameSnap.data() || { votes: 0 };
    await gameRef.update({ votes: antes.votes + 1 });
    res.json({ ok: true, mensaje: `Tu voto a ${antes.name} fue computado.` });
  }
});

export const api = functions.https.onRequest(app);
