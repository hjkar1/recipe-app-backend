// Get the web token from the header.
module.exports.getAuthToken = request => {
  let token = null;
  const authHeader = request.get('Authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer')) {
    token = authHeader.slice(7);
  }
  return token;
};
