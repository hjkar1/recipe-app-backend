const recipeRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Recipe = require('../models/recipe');
const User = require('../models/user');
const utils = require('../utils/utils');

// Get all the recipes.
recipeRouter.get('/', async (request, response, next) => {
  try {
    const recipes = await Recipe.find({}).populate('author', {
      username: 1,
      _id: 1
    });

    // Remove version keys and reformat ids.
    const formattedResponse = recipes.map(recipe => utils.formatRecipe(recipe));

    response.json(formattedResponse);
  } catch (error) {
    next(error);
  }
});

// Get a recipe.
recipeRouter.get('/:id', async (request, response, next) => {
  try {
    const recipeId = request.params.id;
    const recipe = await Recipe.findById(recipeId).populate('author', {
      username: 1
    });
    if (recipe) {
      // Remove version key and reformat id.
      const formattedResponse = utils.formatRecipe(recipe);

      response.json(formattedResponse);
    } else {
      response.status(404).end();
    }
  } catch (error) {
    next(error);
  }
});

// Create a new recipe with the logged in user as the author.
recipeRouter.post('/', async (request, response, next) => {
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

    // Remove version key and reformat id.
    const formattedResponse = utils.formatRecipe(savedRecipe);

    response.json(formattedResponse);
  } catch (error) {
    next(error);
  }
});

// Update an existing recipe.
recipeRouter.put('/:id', async (request, response, next) => {
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
      return response.status(404).end();
    }

    // The user is not the author of the recipe.
    if (recipe.author.toString() !== userId) {
      return response.status(403).end();
    }

    recipe.title = body.title;
    recipe.ingredients = body.ingredients;
    recipe.instructions = body.instructions;

    const savedRecipe = await recipe.save();

    // Remove version key and reformat id.
    const formattedResponse = utils.formatRecipe(savedRecipe);

    response.json(formattedResponse);
  } catch (error) {
    next(error);
  }
});

// Delete a recipe.
recipeRouter.delete('/:id', async (request, response, next) => {
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

    if (!recipe) {
      return response.status(404).end();
    }

    // The user is not the author of the recipe.
    if (recipe.author.toString() !== userId) {
      return response.status(403).end();
    }

    user.recipes = user.recipes.filter(id => id.toString() !== recipeId);
    await user.save();

    await Recipe.findByIdAndDelete(recipeId);

    response.json(recipeId);
  } catch (error) {
    next(error);
  }
});

module.exports = recipeRouter;
