const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const orderRoutes = require("./routes/order.routes");
const adminAuthRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

/* SECURE HEADERS */
app.use(helmet());

/* RATE LIMITING */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api", limiter);

/* MIDDLEWARE */
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    // 🔒 SECURE CORS POLICY
    const allowedOrigins = [
      process.env.FRONTEND_URL, // Production
      "https://kasturimasale.in",
      "https://www.kasturimasale.in"
    ];

    // Dev Environments
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push("http://localhost:3000");
      allowedOrigins.push("http://localhost:3001");
    }

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      console.error(`🚫 CORS BLOCKED: ${origin}`);
      return callback(new Error('CORS Policy Blocked'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

/* HEALTH CHECK */
app.get("/", (req, res) => {
  res.send("Kasturi Masale Backend is running");
});

/* ROUTES */
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin/wallet", require("./routes/admin.wallet.routes")); // 🪙 Admin Wallet Panel
app.use("/api/user", userRoutes);
app.use("/api/batches", require("./routes/batch.routes")); // 📦 Inventory

/* GLOBAL ERROR HANDLER */
app.use((err, req, res, next) => {
  console.error("🔥 UNHANDLED ERROR:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only show stack in development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
