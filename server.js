const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const jwtModule = require("./jwt/jwt");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

async function startServer() {
  const db = await connectDB();
  
  const { jwtRouter, verifyToken } = jwtModule(db);
  
  const productRoutes = require("./routes/productRoutes")(db);
  const carts = require("./routes/carts")(db, verifyToken);
  const orders = require("./routes/orders")(db, verifyToken);
  const users = require("./routes/users")(db, verifyToken);

  // ✅ Mount JWT Auth route
  app.use("/jwt", jwtRouter);

  app.use("/products", productRoutes);
  app.use("/carts", carts);
  app.use("/orders", orders);
  app.use("/users", users);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer();
