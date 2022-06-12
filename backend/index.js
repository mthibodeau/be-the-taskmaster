const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const scoreRoutes = require('./routes/scores');

const PORT = process.env.PORT || 3001

// Connect to the mongodb
mongoose.connect(`mongodb+srv://${process.env.MONGO_ATLAS_USERNAME}:${process.env.MONGO_ATLAS_PASSWORD}@tmcluster.izhw5.mongodb.net/?retryWrites=true&w=majority\n`);

const app = express();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())

// app.get("/abc", (req, res) => {
//   res.json({ message: "55" });
// });

app.use('/scores', scoreRoutes);

// catch 404 and forward to error handler
app.use(function(err, res, next) {
  res.status(err.status || 404).json({
    message: "No such route exists"
  })
});

// error handler
app.use(function(req, res, next) {
  res.status(res.status || 500).json({
    message: "Error Message"
  })
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}...`);
});