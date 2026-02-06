const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

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
  origin: [
    "https://www.kasturimasale.in",
    "https://kasturimasale.in",
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

/* HEALTH CHECK */
app.get("/", (req, res) => {
  res.send("Kasturi Masale Backend is running");
});

/* ROUTES */
app.use("/api/auth", adminAuthRoutes); // Changed from /api/admin to /api/auth for clarity if needed, but keeping consistent with current
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin/wallet", require("./routes/admin.wallet.routes"));
app.use("/api/user", userRoutes);
app.use("/api/batches", require("./routes/batch.routes"));
app.use("/api/orders", require("./routes/order.routes"));

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
