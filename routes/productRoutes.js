const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (db, verifyToken, verifyAdmin) => {
  const router = express.Router();
  const productsCollection = db.collection("products");
  const categoriesCollection = db.collection("categories");



  router.post('/', verifyToken, verifyAdmin, async (req, res) => {
    const item = req.body;
    const result = await productsCollection.insertOne(item);
    res.send(result);
  });

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




  router.get("/product/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await productsCollection.findOne({
        _id: new ObjectId(id)
      }); 
      
      res.json(product);
    } catch (err) {

      try {
        const { id } = req.params;
        const product = await productsCollection.findOne({
          _id: id
        }); 
        
        res.json(product);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  });

  router.delete("/product/:id", async (req, res) => {
    const { id } = req.params;

  
    try {
      const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
  
      if (result.deletedCount > 0) {
        res.status(200).json({ message: "Product deleted successfully" });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.patch("/product/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;
  
      const result = await productsCollection.updateOne(
        { _id:   new ObjectId(id) },
        { $set: updatedData }
      );
  
      res.json(result);
    } catch (error) {
      console.error("Update Product Error:", error);
      res.status(500).json({ message: "Failed to update product" });
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
