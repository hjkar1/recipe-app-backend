const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Recipe = require('../models/recipe');
const User = require('../models/user');
const utils = require('./test-utils');

/* Integration tests for recipe API */

const api = supertest(app);

describe('recipe CRUD API', () => {
  let testUserId;

  beforeAll(async () => {
    // Clear all users from the test database before tests.
    await User.deleteMany({});

    // Create a test user for requests that require authorization.
    testUserId = await utils.createTestUser();
  });

  beforeEach(async () => {
    // Clear all the recipes from the test database.
    await Recipe.deleteMany({});

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

  test('a recipe is updated', async () => {
    const savedRecipes = await utils.getRecipesFromDatabase();

    // Use a recipe from the database in the test.
    const testRecipe = savedRecipes[0];

    const testRequest = {
      title: 'Updated title',
      ingredients: 'Updated ingredients',
      instructions: 'Updated instructions'
    };

    // Create JSON web token for the request.
    const token = await utils.createTestToken(testUserId);

    await api
      .put(`/api/recipes/${testRecipe._id}`)
      .set('Authorization', `bearer ${token}`)
      .send(testRequest)
      .expect('Content-Type', /application\/json/);

    const recipesAfterUpdate = await utils.getRecipesFromDatabase();

    const titles = recipesAfterUpdate.map(recipe => recipe.title);
    expect(titles).toContain(testRequest.title);
  });

  test('update is not allowed without an authorization token', async () => {
    const savedRecipes = await utils.getRecipesFromDatabase();

    // Use a recipe from the database in the test.
    const testRecipe = savedRecipes[0];

    const testRequest = {
      title: 'Updated title',
      ingredients: 'Updated ingredients',
      instructions: 'Updated instructions'
    };

    await api
      .put(`/api/recipes/${testRecipe._id}`)
      .send(testRequest)
      .expect(401);
  });

  test('update is not allowed with an invalid token', async () => {
    const savedRecipes = await utils.getRecipesFromDatabase();

    // Use a recipe from the database in the test.
    const testRecipe = savedRecipes[0];

    const testRequest = {
      title: 'Updated title',
      ingredients: 'Updated ingredients',
      instructions: 'Updated instructions'
    };

    // Create an invalid JSON web token for the request.
    const token = await utils.createInvalidTestToken();

    await api
      .put(`/api/recipes/${testRecipe._id}`)
      .set('Authorization', `bearer ${token}`)
      .send(testRequest)
      .expect(401);
  });

  test('update is not allowed for users other than the author', async () => {
    const savedRecipes = await utils.getRecipesFromDatabase();

    // Use a recipe from the database in the test.
    const testRecipe = savedRecipes[0];

    const testRequest = {
      title: 'Updated title',
      ingredients: 'Updated ingredients',
      instructions: 'Updated instructions'
    };

    // Create a JSON web token with a wrong user for the request.
    const token = await utils.createUnauthorizedUserToken();

    await api
      .put(`/api/recipes/${testRecipe._id}`)
      .set('Authorization', `bearer ${token}`)
      .send(testRequest)
      .expect(403);
  });

  test('return 404 when trying to update a recipe that does not exist', async () => {
    const testRequest = {
      title: 'Updated title',
      ingredients: 'Updated ingredients',
      instructions: 'Updated instructions'
    };

    // Create a JSON web token for the request.
    const token = await utils.createTestToken(testUserId);

    await api
      .put('/api/recipes/123456789012345678901234')
      .set('Authorization', `bearer ${token}`)
      .send(testRequest)
      .expect(404);
  });

  test('a recipe is deleted from the database', async () => {
    const savedRecipesBefore = await utils.getRecipesFromDatabase();

    // Use a recipe from the database in the test.
    const testRecipe = savedRecipesBefore[0];

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

  test('delete request is not allowed without an authorization token', async () => {
    const savedRecipes = await utils.getRecipesFromDatabase();

    // Use a recipe from the database in the test.
    const testRecipe = savedRecipes[0];

    await api.delete(`/api/recipes/${testRecipe._id}`).expect(401);
  });

  test('delete request is not allowed with an invalid token', async () => {
    const savedRecipes = await utils.getRecipesFromDatabase();

    // Use a recipe from the database in the test.
    const testRecipe = savedRecipes[0];

    // Create an invalid JSON web token for the request.
    const token = await utils.createInvalidTestToken();

    await api
      .delete(`/api/recipes/${testRecipe._id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(401);
  });

  test('delete request is not allowed for users other than the author', async () => {
    const savedRecipes = await utils.getRecipesFromDatabase();

    // Use a recipe from the database in the test.
    const testRecipe = savedRecipes[0];

    // Create a JSON web token with a wrong user for the request.
    const token = await utils.createUnauthorizedUserToken();

    await api
      .delete(`/api/recipes/${testRecipe._id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(403);
  });

  test('return 404 when trying to delete a recipe that does not exist', async () => {
    // Create a JSON web token for the request.
    const token = await utils.createTestToken(testUserId);

    await api
      .delete('/api/recipes/123456789012345678901234')
      .set('Authorization', `bearer ${token}`)
      .expect(404);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
