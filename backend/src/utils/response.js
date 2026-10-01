/**
 * Standardized API Response Helpers
 */

/**
 * Send standard success response (200 OK)
 */
const sendSuccess = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send standard created response (201 Created)
 */
const sendCreated = (res, data, message = "Created successfully") => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Send standard paginated response (200 OK)
 */
const sendPaginated = (res, items, pagination, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data: items,
    pagination: {
      currentPage: pagination.page,
      pageSize: pagination.limit,
      totalItems: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendPaginated,
};
