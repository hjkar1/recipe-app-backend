const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema({
  title: String,
  ingredients: String,
  instructions: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
