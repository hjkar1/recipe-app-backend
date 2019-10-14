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

// Save test recipes to the database.
const createTestRecipes = async userId => {
  const recipe1 = new Recipe({
    title: 'Test title 1',
    ingredients: 'Test ingredients 1',
    instructions: 'Test instructions 1',
    author: userId
  });

  const recipe2 = new Recipe({
    title: 'Test title 2',
    ingredients: 'Test ingredients 2',
    instructions: 'Test instructions 2',
    author: userId
  });

  const recipe3 = new Recipe({
    title: 'Test title 3',
    ingredients: 'Test ingredients 3',
    instructions: 'Test instructions 3',
    author: userId
  });

  const savedRecipe1 = await recipe1.save();
  const savedRecipe2 = await recipe2.save();
  const savedRecipe3 = await recipe3.save();

  // Add the recipes to the user's recipe list.

  const user = await User.findById(userId);
  user.recipes = user.recipes.concat(
    savedRecipe1._id,
    savedRecipe2._id,
    savedRecipe3._id
  );
  await user.save();
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
