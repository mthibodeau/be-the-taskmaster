const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

const scoreRoutes = require('./routes/scores');

const PORT = process.env.PORT || 3001

// Connect to the mongodb
mongoose.connect(`mongodb+srv://${process.env.MONGO_ATLAS_USERNAME}:${process.env.MONGO_ATLAS_PASSWORD}@tmcluster.izhw5.mongodb.net/?retryWrites=true&w=majority\n`);

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

app.use('/scores', scoreRoutes);

app.use((req, res, next) => {
  const err = new Error('Not found');
  err.status(404);
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}...`);
});