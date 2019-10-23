// Get the web token from the header.
module.exports.getAuthToken = request => {
  let token = null;
  const authHeader = request.get('Authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer')) {
    token = authHeader.slice(7);
  }
  return token;
};

// Remove the version key field and underscore from id field in the recipe.
module.exports.formatRecipe = recipe => {
  const formattedAuthor = {
    id: recipe.author._id.toString(),
    username: recipe.author.username
  };

  const formattedRecipe = {
    id: recipe._id.toString(),
    title: recipe.title,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    author: formattedAuthor
  };

  return formattedRecipe;
};
