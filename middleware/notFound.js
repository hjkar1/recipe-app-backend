// Handle the requests to undefined endpoints.

const notFound = (request, response) => {
  response.status(404).json({ error: 'page not found' });
};

module.exports = notFound;
