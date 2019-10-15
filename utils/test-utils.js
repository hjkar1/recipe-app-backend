const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Recipe = require('../models/recipe');
const User = require('../models/user');

/* Helper functions for integration testing. */

// Save the test user to the database and return the user id.
const createTestUser = async () => {
  const passwordHash = await bcrypt.hash('testpassword', 10);

  const user = new User({
    username: 'testuser',
    password: passwordHash
  });

  const savedUser = await user.save();

  return savedUser._id;
};

// Save a defined amount of test recipes to the database.
// If the amount is not defined, 3 recipes will be created.
const createTestRecipes = async (userId, numberOfTestRecipes = 3) => {
  for (let i = 0; i < numberOfTestRecipes; i++) {
    const recipe = new Recipe({
      title: 'Test title ' + i,
      ingredients: 'Test ingredients ' + i,
      instructions: 'Test instructions ' + i,
      author: userId
    });

    const savedRecipe = await recipe.save();

    // Add the recipe to the user's recipe list.

    const user = await User.findById(userId);
    user.recipes = user.recipes.concat(savedRecipe._id);
    await user.save();
  }
};

// Return all recipes in the database.
const getRecipesFromDatabase = async () => {
  const recipes = await Recipe.find({});

  return recipes.map(recipe => recipe.toJSON());
};

// Create a valid JSON web token for requests that require authentication.
const createTestToken = async userId => {
  const payload = {
    username: 'testuser',
    id: userId
  };

  const token = jwt.sign(payload, process.env.SECRET);

  return token;
};

// Create an invalid JSON web token for requests that require authentication.
// This token does not contain the required user data.
const createInvalidTestToken = async () => {
  const payload = {
    test: 'test'
  };

  const token = jwt.sign(payload, process.env.SECRET);

  return token;
};

// Create JSON web token for a user not authorized to update/delete the recipe.
const createUnauthorizedUserToken = async () => {
  const user = new User({
    username: 'unauthorized',
    password: 'unauthorized'
  });

  const unauthorizedUser = await user.save();

  const payload = {
    username: unauthorizedUser.username,
    id: unauthorizedUser._id
  };

  const token = jwt.sign(payload, process.env.SECRET);

  return token;
};

module.exports = {
  createTestUser,
  createTestRecipes,
  getRecipesFromDatabase,
  createTestToken,
  createInvalidTestToken,
  createUnauthorizedUserToken
};
