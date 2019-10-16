// Handle errors from the routers.

const errorHandler = (error, request, response, next) => {
  return response.status(400).json({ error: error.message });
};

module.exports = errorHandler;
