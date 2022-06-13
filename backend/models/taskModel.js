const mongoose = require('mongoose');

const taskScoreSchema = new mongoose.Schema({
  series: Number,
  episode: Number,
  task: Number,
  description: String,
  type: String,
  contestantOne: Number,
  contestantTwo: Number,
  contestantThree: Number,
  contestantFour: Number,
  contestantFive: Number
});

// const getTaskScores = (series, episode) => {
//   // TODO insert db query
//   return {"ardal": 1, "bridget": 3, "chris": 4, "judi": 2, "sophie": 5};
// }


module.exports = mongoose.model('TaskScore', taskScoreSchema)
