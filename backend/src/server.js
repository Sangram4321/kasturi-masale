console.log("ENV CHECK:", {
  token: process.env.ITHINK_ACCESS_TOKEN,
  secret: process.env.ITHINK_SECRET_KEY,
  pickup: process.env.ITHINK_PICKUP_ADDRESS_ID,
});

require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

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
