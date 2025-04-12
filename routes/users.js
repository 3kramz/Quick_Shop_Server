const express = require("express");

module.exports = (db) => {
  const router = express.Router();
  const usersCollection = db.collection("users");

  
  router.post('/', async (req, res) => {
    const user = req.body;
    const query = { email: user.email }
    const existingUser = await usersCollection.findOne(query);
    if (existingUser) {
      return res.send({ message: 'user already exists', insertedId: null })
    }
    const result = await usersCollection.insertOne(user);
    res.send(result);
  });


  return router;
};
