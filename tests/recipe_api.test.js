const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Recipe = require('../models/recipe');
const User = require('../models/user');
const utils = require('../utils/test-utils');

/* Integration tests for recipe API */

const api = supertest(app);

describe('recipe CRUD api', () => {
  beforeEach(async () => {
    // Clear the test database before every test.
    await Recipe.deleteMany({});
    await User.deleteMany({});
  });

  test('all recipes are returned', async () => {
    // Create test recipes to the database.
    const recipes = await utils.createTestRecipes();

    const { body } = await api
      .get('/api/recipes')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(body.length).toBe(recipes.length);

    const returnedRecipes = body.map(recipe => {
      return {
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions
      };
    });

    expect(returnedRecipes).toEqual(recipes);
  });

  test('a recipe is returned', async () => {
    // Create test recipe to the database.
    const testRecipe = await utils.createTestRecipe();

    const { body } = await api
      .get(`/api/recipes/${testRecipe._id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(body.title).toEqual(testRecipe.title);
    expect(body.ingredients).toEqual(testRecipe.ingredients);
    expect(body.instructions).toEqual(testRecipe.instructions);
  });

  test('returns 404 if recipe is not found', async () => {
    // Create test recipes to the database.
    await utils.createTestRecipes();

    await api.get('/api/recipes/123456789012345678901234').expect(404);
  });

  test('a new recipe is created', async () => {
    // Create a JSON web token for the request.
    const token = await utils.createTestToken();

    const testRequest = {
      title: 'New title',
      ingredients: 'New ingredients',
      instructions: 'New instructions'
    };

    const { body } = await api
      .post('/api/recipes')
      .set('Authorization', `bearer ${token}`)
      .send(testRequest)
      .expect('Content-Type', /application\/json/);

    expect(body.title).toEqual(testRequest.title);
    expect(body.ingredients).toEqual(testRequest.ingredients);
    expect(body.instructions).toEqual(testRequest.instructions);
  });

  test('a new recipe is not allowed without an authorization token', async () => {
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

  test('a new recipe is not allowed with an invalid token', async () => {
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
});

afterAll(() => {
  mongoose.connection.close();
});