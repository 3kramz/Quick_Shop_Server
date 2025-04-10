const express = require("express");

module.exports = (db) => {
  const router = express.Router();
  const productsCollection = db.collection("products");
  const categoriesCollection = db.collection("categories");


  // Get all products
  router.get("/", async (req, res) => {
    try {
   
      const products = await productsCollection.find().toArray();
      if (!products || products.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Get single product by ID
  router.get("/product/:id", async (req, res) => {
    try {
      const { id } = req.params;


      const product = await productsCollection.findOne({
        _id: id
      });
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Get popular products
  router.get("/popular", async (req, res) => {
    try {
      const products = await productsCollection
        .find()
        .sort({ sales: -1 })
        .limit(8)
        .toArray();

      if (!products || products.length === 0) { 
        return res.status(404).json({ message: "No popular products found" });
      }
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Get all categories
  router.get("/categories", async (req, res) => {
    try {

      const categories = await categoriesCollection.find().toArray();
      if (!categories || categories.length === 0) {
        return res.status(404).json({ message: "No categories found" });
      }
      res.json(categories);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Get featured categories (updated to actually filter featured)
  router.get("/featuredCategories/:name", async (req, res) => {
    try {
      const { name } = req.params;
      if (name === "all") {
        const featuredCategories = await categoriesCollection.find().toArray();

        if (!featuredCategories || featuredCategories.length === 0) {
          return res
            .status(404)
            .json({ message: "No featured categories found" });
        }
        res.json(featuredCategories);
      } else {
        console.log(name);
        const featuredCategories = await categoriesCollection
          .find({ categories: name })
          .toArray();

        if (!featuredCategories || featuredCategories.length === 0) {
          return res
            .status(404)
            .json({ message: "No featured categories found" });
        }
        res.json(featuredCategories);
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Get products by category
  router.get("/category/:category", async (req, res) => {
    try {

      const { category } = req.params;
      let products;

      if (category === "all") {
        products = await productsCollection.find().toArray();
      } else {
        products = await productsCollection
          .find({ category })
          .sort({ sales: -1 })
          .toArray();
      }

      if (!products || products.length === 0) {
        return res.status(404).json({
          message: `No products found ${
            category === "all" ? "" : "in this category"
          }`,
        });
      }
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


  router.get("/top-sales", async (req, res) => {
    try {
      

      const products = await productsCollection
        .find()
        .sort({ sales: -1 })
        .limit(3)
        .toArray();

      if (!products || products.length === 0) {
        return res
          .status(404)
          .json({ message: "No top-selling products found" });
      }
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get("/trending", async (req, res) => {
    try {
      const products = await productsCollection
        .find()
        .sort({ views: -1 })
        .limit(3)
        .toArray();

      res.json(products.map((p) => ({ ...p, _id: p._id.toString() })));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get("/recent", async (req, res) => {
    try {
      const products = await productsCollection
        .find()
        .sort({ _id: -1 }) // most recent first
        .limit(3)
        .toArray();

      res.json(products.map((p) => ({ ...p, _id: p._id.toString() })));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get("/top-rated", async (req, res) => {
    try {
      const products = await productsCollection
        .find()
        .sort({ rating: -1 })
        .limit(3)
        .toArray();

      res.json(products.map((p) => ({ ...p, _id: p._id.toString() })));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Similar implementation for other endpoints...

  return router;
};
