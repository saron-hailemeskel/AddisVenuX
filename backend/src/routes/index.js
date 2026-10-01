const express = require("express");
const { sendSuccess } = require("../utils/response");

const router = express.Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get("/health", (req, res) => {
  return sendSuccess(res, {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }, "AddisVenuX API is healthy and operational");
});

// Future sub-routers will be mounted here:
// router.use("/auth", authRoutes);
// router.use("/organizations", organizationRoutes);
// router.use("/events", eventRoutes);
// router.use("/orders", orderRoutes);
// router.use("/tickets", ticketRoutes);

module.exports = router;
