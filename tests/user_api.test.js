const mongoose = require('mongoose');
const supertest = require('supertest');
const utils = require('./test-utils');
const app = require('../app');
const User = require('../models/user');
const Recipe = require('../models/recipe');

const api = supertest(app);

/* Integration tests for user API */

describe('signup', () => {
  beforeEach(async () => {
    // Clear all users from the test database before every signup test.
    await User.deleteMany({});
  });

  test('signs up a new user', async () => {
    const newUser = {
      username: 'testuser',
      password: 'testpassword'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201);

    const createdUser = await User.find({ username: newUser.username });

    expect(createdUser.length).toBe(1);
  });

  test('does not sign up a user with inadequate password', async () => {
    const newUser = {
      username: 'testuser',
      password: 'testing'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400);
  });

  test('does not sign up a user with missing username', async () => {
    const newUser = {
      username: '',
      password: 'testpassword'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400);
  });

  test('does not sign up a user with a username that already exists', async () => {
    // Create a user with the same username.

    const existingUser = new User({
      username: 'testuser',
      password: 'testpassword'
    });

    await existingUser.save();

    const newUser = {
      username: 'testuser',
      password: 'testpassword'
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400);
  });
});

describe('login', () => {
  beforeAll(async () => {
    // Clear all users from the test database before testing login.
    await User.deleteMany({});

    // Create a test user to the test database to test login.
    await utils.createTestUser();
  });

  test('logs user in by returning a token', async () => {
    // Mock request body.
    const requestBody = {
      username: 'testuser',
      password: 'testpassword'
    };

    const {
      body: { token }
    } = await api.post('/api/users/login').send(requestBody);

    expect(token).toBeDefined();
  });

  test('does not log a user in with a username that does not exist', async () => {
    // Mock request body.
    const requestBody = {
      username: 'nonexisting',
      password: 'testpassword'
    };

    await api
      .post('/api/users/login')
      .send(requestBody)
      .expect(401);
  });

  test('does not log a user in with wrong password', async () => {
    // Mock request body.
    const requestBody = {
      username: 'testuser',
      password: 'wrongpassword'
    };

    await api
      .post('/api/users/login')
      .send(requestBody)
      .expect(401);
  });
});

describe('recipes created by the user', () => {
  beforeAll(async () => {
    // Clear the test database before the test.
    await User.deleteMany({});
    await Recipe.deleteMany({});
  });

  test('returns all recipes created by the user', async () => {
    // Create a test user.
    const testUserId = await utils.createTestUser();

    // Save some recipes in the database for the user.
    await utils.createTestRecipes(testUserId);

    // Create a JSON web token for the request.
    const token = await utils.createTestToken(testUserId);

    const { body } = await api
      .get('/api/users/recipes')
      .set('Authorization', `bearer ${token}`)
      .expect('Content-Type', /application\/json/);

    // Get the user's recipes from the database for comparison.
    const testRecipes = await utils.getRecipesFromDatabase();

    expect(body.length).toBe(testRecipes.length);
  });

  test('accessing /api/users/recipes is not allowed without authorization token', async () => {
    await api.get('/api/users/recipes').expect(401);
  });

  test('accessing /api/users/recipes is not allowed with an invalid token', async () => {
    // Create an invalid JSON web token for the request.
    const token = await utils.createInvalidTestToken();

    await api
      .get('/api/users/recipes')
      .set('Authorization', `bearer ${token}`)
      .expect(401);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
