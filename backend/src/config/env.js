require("dotenv").config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "addisvenux-super-secret-development-key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
};

module.exports = env;
