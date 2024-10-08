const express = require("express");
const math = require("mathjs");
const CalculatorLog = require("../models/CalculatorLog");
const logger = require("../config/logger");

const router = express.Router();

// Array to keep track of clients waiting for new data
let waitingClients = [];
let evaluationCount = 0; // To track how many calculations have been done

// Middleware to handle database operations
const handleDbOperation = (operation) => async (req, res, next) => {
  try {
    await operation(req, res);
  } catch (error) {
    logger.error(`Database operation error: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Route to log a new calculator expression
router.post(
  "/logs",
  handleDbOperation(async (req, res) => {
    const { expression } = req.body;

    if (!expression) {
      logger.info("Received an empty expression");
      return res.status(400).json({ message: "Expression is empty" });
    }

    let output = null;
    let isValid = true;

    try {
      // Evaluate the expression
      output = math.evaluate(expression);
      output = parseFloat(output.toFixed(2)); // Format to 2 decimal places
    } catch (err) {
      isValid = false;
      logger.warn(`Invalid expression attempted: ${expression}`);
    }

    // Create a new log entry
    const calculatorLog = new CalculatorLog({ expression, isValid, output });
    await calculatorLog.save();
    logger.info(`Expression logged: ${expression} | Valid: ${isValid}`);

    evaluationCount++;

    // Notify waiting clients (short/long polling)
    if (evaluationCount >= 5) {
      const logs = await CalculatorLog.find()
        .sort({ createdOn: -1 })
        .limit(5)
        .exec();

      waitingClients.forEach((client) => {
        let index = 0;
        const intervalId = setInterval(() => {
          if (index < logs.length) {
            client.res.write(JSON.stringify(logs[index]) + "\n");
            index++;
          } else {
            clearInterval(intervalId);
            client.res.end();
            evaluationCount = 0; // Reset after streaming
          }
        }, 1000); // Send each log after 1 second
      });

      waitingClients = []; // Clear the waiting clients
      req.io.emit("log", calculatorLog);
    }

    // Emit the new log to all connected WebSocket clients
    req.io.emit("log", calculatorLog);

    return res.json({
      message: isValid
        ? `Expression evaluated to ${output}`
        : "Invalid expression",
      output: isValid ? output : null,
      isValid,
    });
  })
);

// Route for long polling
router.get(
  "/logs/long-poll",
  handleDbOperation(async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    waitingClients.push({ req, res });
    // If the request is open for too long, close it to avoid resource leaks
    req.on("close", () => {
      waitingClients = waitingClients.filter((client) => client.req !== req);
    });
  })
);

// Route to fetch the latest 10 calculator logs
router.get(
  "/logs",
  handleDbOperation(async (req, res) => {
    const logs = await CalculatorLog.find()
      .sort({ createdOn: -1 })
      .limit(10)
      .exec();

    logger.info("Successfully retrieved logs");
    res.json(logs);
  })
);

module.exports = router;
