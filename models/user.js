const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: {
    type: String
  },
  password: String,
  recipes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe'
    }
  ]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
