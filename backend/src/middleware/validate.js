const AppError = require("../utils/appError");

/**
 * Reusable Zod validation middleware.
 * @param {import("zod").ZodSchema} schema - Zod schema (supports body, query, params)
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Replace request data with parsed/sanitized versions if specified in schema
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  } catch (error) {
    if (error.name === "ZodError" || error.issues) {
      const formattedErrors = error.issues.map((issue) => ({
        field: issue.path.slice(1).join("."), // removes 'body' or 'query' prefix from path
        message: issue.message,
      }));

      return next(new AppError("Validation failed", 422, formattedErrors));
    }
    next(error);
  }
};

module.exports = validate;
