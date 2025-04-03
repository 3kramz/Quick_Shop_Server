const express = require("express");

module.exports = (db) => {
  const router = express.Router();
  const productsCollection = db.collection("products");


  router.get("/", async (req, res) => {
    const products = await productsCollection.find().toArray();
    res.json(products);
  });


  return router;
};
