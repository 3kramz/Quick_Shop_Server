const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (db, verifyToken, verifyAdmin) => {
  const router = express.Router();
  const usersCollection = db.collection("users");

  router.post("/", async (req, res) => {
    let user = req.body;
    const query = { email: user.email };
    const existingUser = await usersCollection.findOne(query);
    if (existingUser) {
      return res.send({ message: "user already exists", insertedId: null });
    }

    user = { ...user, createdAt: new Date(), role: "customer" };
    const result = await usersCollection.insertOne(user);
    res.send(result);
  });

  router.get("/", verifyToken, verifyAdmin, async (req, res) => {
    try {
      const users = await usersCollection.find().toArray();
      if (!users || users.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get("/admin/:email", verifyToken, verifyAdmin, async (req, res) => {
    const email = req.params.email;

    if (email !== req.decoded.email) {
      return res.status(403).send({ message: "forbidden access" });
    }

    const query = { email: email };
    const user = await usersCollection.findOne(query);
    let admin = false;
    if (user) {
      admin = user?.role === "admin";
    }
    res.send({ admin });
  });

  router.patch("/admin/:id", verifyToken, verifyAdmin, async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: {
        role: "admin",
      },
    };
    const result = await usersCollection.updateOne(filter, updatedDoc);
    res.send(result);
  });

  router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
    const id = req.params.id;
    try {
      const query = { _id: new ObjectId(id) };
      const user = await usersCollection.findOne(query);
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      if (user.role === "admin") {
        return res.status(403).send({ message: "Cannot delete an admin user" });
      }
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).send({ message: "Failed to delete user" });
    }
  });

  return router;
};
