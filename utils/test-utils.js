const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Recipe = require('../models/recipe');
const User = require('../models/user');

// Save the test user to the database and return the user id.
const createTestUser = async () => {
  const passwordHash = await bcrypt.hash('testpassword', 10);

  const user = new User({
    username: 'testuser',
    password: passwordHash
  });

  await user.save();

  const savedUser = await User.findOne({ username: user.username });

  return savedUser._id;
};

// Save test recipes to the database.
const createTestRecipes = async () => {
  const recipes = [
    {
      title: 'Test title 1',
      ingredients: 'Test ingredients 1',
      instructions: 'Test instructions 1'
    },
    {
      title: 'Test title 2',
      ingredients: 'Test ingredients 2',
      instructions: 'Test instructions 2'
    },
    {
      title: 'Test title 3',
      ingredients: 'Test ingredients 3',
      instructions: 'Test instructions 3'
    }
  ];

  await Recipe.insertMany(recipes);

  return recipes;
};

// Save a test recipe to the database.
const createTestRecipe = async () => {
  const recipe = new Recipe({
    title: 'Test title',
    ingredients: 'Test ingredients',
    instructions: 'Test instructions'
  });

  await recipe.save();

  const testRecipe = await Recipe.findOne({ title: 'Test title' });
  return testRecipe.toJSON();
};

// Creates a valid JSON web token for requests that require authentication.
const createTestToken = async () => {
  const testUserId = await createTestUser();

  const payload = {
    username: 'testuser',
    id: testUserId
  };

  const token = jwt.sign(payload, process.env.SECRET);

  return token;
};

// Creates an invalid JSON web token for requests that require authentication.
// This token does not contain the required user data.
const createInvalidTestToken = async () => {
  const payload = {
    test: 'test'
  };

  const token = jwt.sign(payload, process.env.SECRET);

  return token;
};

module.exports = {
  createTestUser,
  createTestRecipes,
  createTestRecipe,
  createTestToken,
  createInvalidTestToken
};
