const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Recipe = require('../models/recipe');
const User = require('../models/user');
const utils = require('../utils/test-utils');

/* Integration tests for recipe API */

const api = supertest(app);

describe('recipe CRUD api', () => {
  let testUserId;
  beforeAll(async () => {
    // Clear the test database before tests.
    await Recipe.deleteMany({});
    await User.deleteMany({});

    // Create a test user for requests that require authorization.
    testUserId = await utils.createTestUser();

    // Initialize the database with some test data.
    await utils.createTestRecipes(testUserId);
  });

  test('all recipes are returned', async () => {
    const savedRecipes = await utils.getRecipesFromDatabase();

    const { body } = await api
      .get('/api/recipes')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(body.length).toBe(savedRecipes.length);
  });

  test('a recipe is returned', async () => {
    const savedRecipes = await utils.getRecipesFromDatabase();

    // Use a recipe from the database in the test.
    const testRecipe = savedRecipes[0];

    const { body } = await api
      .get(`/api/recipes/${testRecipe._id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(testRecipe.title).toEqual(body.title);
  });

  test('return 404 if recipe is not found', async () => {
    await api.get('/api/recipes/123456789012345678901234').expect(404);
  });

  test('a new recipe is created and saved to the database', async () => {
    // Create a JSON web token for the request.
    const token = await utils.createTestToken(testUserId);

    const testRequest = {
      title: 'New title',
      ingredients: 'New ingredients',
      instructions: 'New instructions'
    };

    await api
      .post('/api/recipes')
      .set('Authorization', `bearer ${token}`)
      .send(testRequest)
      .expect('Content-Type', /application\/json/);

    const savedRecipes = await utils.getRecipesFromDatabase();

    const titles = savedRecipes.map(recipe => recipe.title);
    expect(titles).toContain(testRequest.title);
  });

  test('post request is not allowed without an authorization token', async () => {
    const testRequest = {
      title: 'New title',
      ingredients: 'New ingredients',
      instructions: 'New instructions'
    };

    await api
      .post('/api/recipes')
      .send(testRequest)
      .expect(401);
  });

  test('post request is not allowed with an invalid token', async () => {
    const testRequest = {
      title: 'New title',
      ingredients: 'New ingredients',
      instructions: 'New instructions'
    };

    // Create an invalid JSON web token for the request.
    const token = await utils.createInvalidTestToken();

    await api
      .post('/api/recipes')
      .set('Authorization', `bearer ${token}`)
      .send(testRequest)
      .expect(401);
  });

  test('a recipe is deleted from the database', async () => {
    const savedRecipesBefore = await utils.getRecipesFromDatabase();

    // Use a recipe from the database in the test.
    const testRecipe = savedRecipesBefore[2];

    // Create a JSON web token for the request.
    const token = await utils.createTestToken(testUserId);

    await api
      .delete(`/api/recipes/${testRecipe._id}`)
      .set('Authorization', `bearer ${token}`);

    const savedRecipesAfter = await utils.getRecipesFromDatabase();

    expect(savedRecipesAfter.length).toBe(savedRecipesBefore.length - 1);

    const titles = savedRecipesAfter.map(recipe => recipe.title);
    expect(titles).not.toContain(testRecipe.title);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
