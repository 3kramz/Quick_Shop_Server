const express = require("express");

module.exports = (db,verifyToken) => {
  const router = express.Router();
  const cartsCollection = db.collection("carts");
  const productsCollection = db.collection("products");
  const couponsCollection = db.collection("coupons");
  
  router.get("/", verifyToken, async (req, res) => {
    try {
      const { email } = req.query;
      
      if (!email) return res.status(400).json({ message: "Email is required" });
  
      const userCart = await cartsCollection.findOne({ email });
      if (!userCart) return res.json({ cart: [] });
      const cartDetails = await Promise.all(
        userCart.cart.map(async ({ menuId, quantity }) => {
          const product = await productsCollection.findOne({ _id: menuId});
          return {
            ...product,
            quantity,
          };
        })
      );
  
      res.json({ cart: cartDetails , coupon: userCart.coupon || null });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  router.post("/",verifyToken, async (req, res) => {
    try {
      const { email, menuId, quantity = 1 } = req.body;
  
      if (!email || !menuId) {
        return res.status(400).json({ message: "Email and menuId are required." });
      }
  
      const cart = await cartsCollection.findOne({ email });
  
      if (cart) {
        const exists = cart.cart.find(item => item.menuId === menuId);
  
        if (exists) {
          return res.status(409).json({ message: "Product already in cart." });
        }
  
        // Add new product
        cart.cart.push({ menuId, quantity });
        await cartsCollection.updateOne(
          { email },
          { $set: { cart: cart.cart } }
        );
  
      } else {
        // Create a new cart if it doesn't exist
        await cartsCollection.insertOne({
          email,
          cart: [{ menuId, quantity }],
        });
      }
  
      res.status(201).json({ message: "Product added to cart." });
  
    } catch (error) {
      console.error("Error adding to cart:", error.message);
      res.status(500).json({ message: "Server error while adding to cart." });
    }
  });

router.patch("/update",verifyToken, async (req, res) => {
  const { email, menuId, quantity } = req.body;

  if (!email || !menuId || quantity < 1) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const result = await cartsCollection.updateOne(
    { email, "cart.menuId": menuId },
    { $set: { "cart.$.quantity": quantity } }
  );

  if (result.modifiedCount > 0) {
    res.status(200).json({ message: "Cart updated" });
  } else {
    res.status(404).json({ message: "Item not found in cart" });
  }
});
  
router.delete("/",verifyToken, async (req, res) => {
  const { email, menuId } = req.body;

  const cart = await cartsCollection.findOne({ email });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const updatedCart = cart.cart.filter(item => item.menuId !== menuId);
  await cartsCollection.updateOne({ email }, { $set: { cart: updatedCart } });

  res.status(200).json({ message: "Product removed from cart" });
});

router.delete("/clear",verifyToken, async (req, res) => {
  const { email } = req.body;
  await cartsCollection.updateOne({ email }, { $set: { cart: [] } });
  res.status(200).json({ message: "Cart cleared" });
});

router.post("/coupon",verifyToken, async (req, res) => {
  const { email, coupon } = req.body;

  const code = await couponsCollection.findOne({ code: coupon });

  if (!code) {
    return res.status(400).json({ message: "Invalid coupon code." });
  }

 
  const cart = await cartsCollection.findOne({ email });
  if (!cart) {
    return res.status(404).json({ message: "Cart not found." });
  }

  await cartsCollection.updateOne(
    { email },
    { $set: { coupon: { code: coupon, discount: code.discount } } }
  );

  const updatedCart = await cartsCollection.findOne({ email });

  res.status(200).json({
    message: `Coupon "${code}" applied successfully!`,
    cart: updatedCart,
  });
});

router.post("/coupon/remove",verifyToken, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const cart = await cartsCollection.findOne({ email });

  if (!cart) {
    return res.status(404).json({ message: "Cart not found." });
  }

  // Remove coupon from the cart
  await cartsCollection.updateOne(
    { email },
    { $unset: { coupon: "" } }
  );

  const updatedCart = await cartsCollection.findOne({ email });

  res.status(200).json({
    message: "Coupon removed successfully.",
    cart: updatedCart,
  });
});

  return router;
};
