const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const logger = require("./config/logger");
const logRoutes = require("./routes/logRoutes");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // Create HTTP server

// Initialize database connection
connectDB();

// Middleware setup
app.use(cors());
app.use(express.json());

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Update this to match your frontend's address
    methods: ["GET", "POST"],
  },
});

// WebSocket connection event
io.on("connection", (socket) => {
  logger.info("New WebSocket client connected");

  socket.on("disconnect", () => {
    logger.info("WebSocket client disconnected");
  });
});

// Pass `io` to the route handlers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Route handlers
app.use("/api", logRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Hello from the Calculator Log API!");
  logger.info("Served root endpoint");
});

// Server configuration
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  logger.info(`Server started on port ${PORT}`);
});
