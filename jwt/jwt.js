const express = require("express");
const jwt = require("jsonwebtoken");

module.exports = (db) => {
  const router = express.Router();
  
  const usersCollection = db.collection("users");

  router.post("/", async (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
      expiresIn: "1h",
    });
    res.send({ token });
  });

  const verifyToken = (req, res, next) => {
      const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "unauthorized access" });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            console.log("authHeader", err);
            return res.status(401).send({ message: "unauthorized access" });
        }
      req.decoded = decoded;
      next();
    });
  };
  const verifyAdmin = async (req, res, next) => {
    const email = req.decoded.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    const isAdmin = user?.role === 'admin';
    if (!isAdmin) {
      return res.status(403).send({ message: 'forbidden access' });
    }
    next();
  }
  return {
    jwtRouter: router,
    verifyToken,
    verifyAdmin
  };
};
