require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, async () => {
      console.log(`Backend running on port ${PORT}`);

      // TEMPORARY: Fetch & Log iThink Pickup Addresses (For Config)
      try {
        const { getPickupAddresses } = require("./services/ithink.service");
        await getPickupAddresses();
      } catch (err) {
        console.error("Failed to fetch pickup addresses:", err.message);
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
