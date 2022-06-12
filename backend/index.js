const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors')


const taskController = require('./controller/taskController');

const PORT = process.env.PORT || 3001

const app = express();

app.use(cors())

// app.get("/abc", (req, res) => {
//   res.json({ message: "55" });
// });

app.use(`/:series/:episode/:task`, taskController.getScores);

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