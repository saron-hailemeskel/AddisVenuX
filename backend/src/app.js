const express = require("express");
const cors = require("cors");
const apiRouter = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const AppError = require("./utils/appError");

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount Central API Routes
app.use("/api", apiRouter);

// Unhandled Route Handler (404)
app.use((req, res, next) => {
  next(new AppError(`Cannot find endpoint ${req.method} ${req.originalUrl} on this server`, 404));
});

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;