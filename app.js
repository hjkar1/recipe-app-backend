const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const userRouter = require('./controllers/userRouter');
const recipeRouter = require('./controllers/recipeRouter');
const mongoose = require('mongoose');

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch(error => {
    console.log(error.message);
  });

app.use(cors());
app.use(bodyParser.json());

app.use('/api/recipes', recipeRouter);
app.use('/api/users', userRouter);

module.exports = app;
