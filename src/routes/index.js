const axios = require('axios');
const  { hapikey } = require('../views/husbpot');
const { Router } = require("express");
const router = Router();

var admin = require("firebase-admin");

var serviceAccount = require("../../serviceAccountKeys.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://conectar-3bcbb-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

router.get("/", async (req, res) => {
  try {
    const querySnapshot = await db.collection("contacts").get();
    const contacts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.render("index", { contacts });
  } catch (error) {
    console.error(error);
  }
});

router.post("/new-contact", async (req, res) => {
  const { firstname, lastname, email, phone } = req.body;
  await db.collection("contacts").add({
    firstname,
    lastname,
    email,
    phone,
  });
  res.redirect("/");
});

router.get("/delete-contact/:id", async (req, res) => {
  await db.collection("contacts").doc(req.params.id).delete();
  res.redirect("/");
});

router.get("/edit-contact/:id", async (req, res) => {
  const doc = await db.collection("contacts").doc(req.params.id).get();
  res.render("index", { contact: { id: doc.id, ...doc.data() } });
});

router.post("/update-contact/:id", async (req, res) => {
  const { firstname, lastname, email, phone } = req.body;

  axios.get(`https://api.hubapi.com/contacts/v1/contact/vid/42318614/profile/email/${email}/?hapikey=${hapikey}`,
  
  {
    headers: {
      'Authorization': `Bearer pat-na1-2743f05f-785b-41f5-bb84-3dc6da1e0d81`,
      'Content-Type': 'application/json'
    }
  },
  (err, data) => {
    // Handle the API response
  }
);
  
  const { id } = req.params;
  await db
    .collection("contacts")
    .doc(id)
    .update({ firstname, lastname, email, phone });
  res.redirect("/");
});

module.exports = router;
