const express = require("express");
const { ObjectId } = require('mongodb');
module.exports = (db,verifyToken,verifyAdmin) => {
  const router = express.Router();
  const ordersCollection = db.collection("orders");



  router.get("/", verifyToken,verifyAdmin, async (req, res) => {
    try {
      const orders = await ordersCollection.find().toArray();
      res.send(orders);
    } catch (error) {
      res.status(500).send({ message: "Failed to fetch orders" });
    }
  });

  router.post("/track",verifyToken, async (req, res) => {
    const { orderId, email } = req.body;
  
    if (!orderId || !email) {
      return res.status(400).send({ message: "Order ID and email are required" });
    }
  
    try {
      const order = await ordersCollection.findOne({
        _id: new ObjectId(orderId),
        userEmail: email,
      });
  
      if (!order) {
        return res.status(404).send({ message: "Order not found or email does not match" });
      }
  
      res.send(order);
    } catch (error) {
      console.error("Error tracking order:", error);
      res.status(500).send({ message: "Failed to track order" });
    }
  });

  // Node.js/Express
router.get("/user/:email",verifyToken, async (req, res) => {
  const email = req.params.email;
  const userOrders = await ordersCollection.find({ userEmail: email }).toArray();
  res.send(userOrders);
});


  // Update order status
  router.patch("/:id", verifyToken,verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const result = await ordersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status } }
      );
      res.send(result);
    } catch (error) {
      res.status(500).send({ message: "Failed to update status" });
    }
  });

  router.patch('/status/:id',verifyToken,verifyAdmin, async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }
  
    try {

      const result = await ordersCollection.updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { status: status } }
      );
  
      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: 'Order not found or status unchanged.' });
      }
  
      res.send({ message: 'Order status updated successfully.' });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  });

  
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
