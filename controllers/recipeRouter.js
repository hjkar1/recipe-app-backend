const recipeRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Recipe = require('../models/recipe');
const User = require('../models/user');
const utils = require('../utils/utils');

// get all recipes
recipeRouter.get('/', async (request, response) => {
  const recipes = await Recipe.find({}).populate('author', { username: 1, _id: 1 });
  response.json(recipes);
});

// get a recipe
recipeRouter.get('/:id', async (request, response) => {
  try {
    const recipeId = request.params.id;
    const recipe = await Recipe.findById(recipeId).populate('author', {
      username: 1
    });
    if (recipe) {
      response.json(recipe);
    } else {
      response.status(404).end();
    }
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

// create a new recipe
recipeRouter.post('/', async (request, response) => {
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

    const user = await User.findById(userId);

    const body = request.body;

    const recipe = new Recipe({
      title: body.title,
      ingredients: body.ingredients,
      instructions: body.instructions,
      author: user._id
    });

    const savedRecipe = await recipe.save();
    user.recipes = user.recipes.concat(savedRecipe._id);
    await user.save();

    response.json(savedRecipe);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

// update an existing recipe
recipeRouter.put('/:id', async (request, response) => {
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

    const recipeId = request.params.id;
    const body = request.body;

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      response.status(404).end();
    }

    // the user is not the author of the recipe
    if (recipe.author.toString() !== userId) {
      return response.status(403).end();
    }

    recipe.title = body.title;
    recipe.ingredients = body.ingredients;
    recipe.instructions = body.instructions;

    const savedRecipe = await recipe.save();

    response.json(savedRecipe);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

// delete a recipe
recipeRouter.delete('/:id', async (request, response) => {
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

    const recipeId = request.params.id;

    const user = await User.findById(userId);

    const recipe = await Recipe.findById(recipeId);

    // the user is not the author of the recipe
    if (recipe.author.toString() !== userId) {
      return response.status(403).end();
    }

    user.recipes = user.recipes.filter(id => id.toString() !== recipeId);
    await user.save();

    await Recipe.findByIdAndDelete(recipeId);

    response.json(recipeId);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
});

module.exports = recipeRouter;
