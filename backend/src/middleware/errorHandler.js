/**
 * Global API Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors || [];

  // Handle JSON parse error (malformed request body)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Malformed JSON payload";
  }

  // Handle Prisma unique constraint violation (code P2002)
  if (err.code === "P2002") {
    statusCode = 409;
    const target = err.meta?.target ? err.meta.target.join(", ") : "field";
    message = `Duplicate value error: A record with that ${target} already exists`;
  }

  // Handle Prisma record not found (code P2025)
  if (err.code === "P2025") {
    statusCode = 404;
    message = "The requested resource was not found";
  }

  // Handle JWT invalid or expired tokens
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please authenticate again.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your session token has expired. Please log in again.";
  }

  // In development, log the stack trace for easy debugging
  if (process.env.NODE_ENV !== "production" && statusCode === 500) {
    console.error("Unhandled Error:", err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
