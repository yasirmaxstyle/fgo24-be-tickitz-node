require("dotenv").config;

const express = require("express");
const { constants: http } = require("http2");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use(morgan("dev"));

const redisClient = require("./src/db/redis");
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    process.exit(1);
  }
})();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", require("./src/routers/index.router"));

app.get("/*splat", (req, res) => {
  return res.status(http.HTTP_STATUS_NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`
  });
});

app.get("/health", (req, res) => {
  res.status(http.HTTP_STATUS_OK).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

const PORT = process.env.APP_PORT || 8080;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});