const path = require("path");

/* 🔥 VERY IMPORTANT FIX */
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
  override: true
});

const app = require("./app");
const orderRoutes = require("./routes/order.routes");
app.use("/api/orders", orderRoutes);

// 🔄 Server Restart Triggered for Admin Fix
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
