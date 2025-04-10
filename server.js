const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");


dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

async function startServer() {
  const db = await connectDB();

  const productRoutes = require("./routes/productRoutes")(db);
  const carts = require("./routes/carts")(db);

  app.use("/products", productRoutes);

  app.use("/carts", carts);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer();
