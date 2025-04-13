const express = require("express");

module.exports = (db,verifyToken) => {
  const router = express.Router();
  const ordersCollection = db.collection("orders");

  
  router.post('/',verifyToken, async (req, res) => {
    try {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.send({ insertedId: result.insertedId });
    } catch (err) {
      res.status(500).send({ message: 'Failed to place order', error: err.message });
    }
  });
  


  return router;  
};
