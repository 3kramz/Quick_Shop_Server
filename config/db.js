const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8qgsb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
const client = new MongoClient(uri);

async function connectDB() {
  try {
    // await client.connect();
    // console.log("MongoDB Connected...");
    return client.db("Quick_Shop");
  } catch (error) {
    // console.error("MongoDB Connection Failed:", error);
  
  }
}

module.exports = connectDB;
