const express = require("express");

module.exports = (db) => {
  const router = express.Router();
  const cartsCollection = db.collection("carts");

  // Get all carts (typically admin use)
  router.get("/", async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const cart = await cartsCollection.findOne({ email });
      res.status(200).json(cart || { cart: [] });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Add product to cart
  router.post("/", async (req, res) => {
    try {
      const { email, menuId } = req.body;

      if (!email || !menuId) {
        return res.status(400).json({
          success: false,
          message: "Email and menuId are required.",
        });
      }

      const userCart = await cartsCollection.findOne({ email });

      // If cart doesn't exist, create new cart
      if (!userCart) {
        const newCart = {
          email,
          cart: [menuId],
        };
        const result = await cartsCollection.insertOne(newCart);
        return res.status(201).json({
          success: true,
          message: "Product added to cart.",
          insertedId: result.insertedId,
        });
      }

      // Check if menuId already in cart
      const alreadyExists = userCart.cart.includes(menuId);
      if (alreadyExists) {
        return res.status(409).json({
          success: false,
          message: "Product already in cart.",
        });
      }

      // Add new item to cart
      const result = await cartsCollection.updateOne(
        { email },
        { $push: { cart: menuId } }
      );

      return res.status(200).json({
        success: true,
        message: "Product added to cart.",
        modifiedCount: result.modifiedCount,
      });

    } catch (error) {
      console.error("Error in cart POST:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  });

  return router;
};
