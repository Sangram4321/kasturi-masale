require("dotenv").config();

console.log("ENV CHECK:", {
  token: process.env.ITHINK_ACCESS_TOKEN,
  secret: process.env.ITHINK_SECRET_KEY,
  pickup: process.env.ITHINK_PICKUP_ADDRESS_ID,
});

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// ✅ Health check route (IMPORTANT for Railway)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

const startServer = async () => {
  try {
    await connectDB();

    // Seed Products (Idempotent)
    const seedProducts = require("./utils/seedProducts");
    await seedProducts();

    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
