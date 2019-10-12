const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userRouter = require('express').Router();
const User = require('../models/user');
const Recipe = require('../models/recipe');
const utils = require('../utils/utils');

// create a new user
userRouter.post('/', async (request, response) => {
  try {
    const { username, password } = request.body;

    if (username.length < 1) {
      return response.status(400).json({ error: 'Missing username' });
    }

    const existingUserName = await User.find({ username });

    if (existingUserName.length > 0) {
      return response.status(400).json({ error: 'Username already exists' });
    }
    if (password.length < 8) {
      return response.status(400).json({ error: 'Too short password' });
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = new User({
      username,
      password: passwordHash
    });
    await user.save();
    response.status(201).end();
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

// sign in a user
userRouter.post('/login', async (request, response) => {
  const body = request.body;

  const user = await User.findOne({ username: body.username });

  if (!user) {
    return response.status(401).json({ error: 'Wrong username or password' });
  }

  const passwordOK = await bcrypt.compare(body.password, user.password);

  if (!passwordOK) {
    return response.status(401).json({ error: 'Wrong username or password' });
  }

  const payload = {
    username: user.username,
    id: user._id
  };

  const token = jwt.sign(payload, process.env.SECRET);

  response.status(200).send({ token, username: user.username });
});

// get ids of all recipes created by the user
userRouter.get('/recipes', async (request, response) => {
  try {
    const token = utils.getAuthToken(request);

    if (!token) {
      return response.status(401).json({ error: 'Not logged in' });
    }

    const decodedToken = jwt.verify(token, process.env.SECRET);
    const userId = decodedToken.id;

    if (!userId) {
      return response.status(401).json({ error: 'Not logged in' });
    }

    const recipes = await Recipe.find({ author: userId });

    response.json(recipes.map(recipe => recipe._id));
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

module.exports = userRouter;
