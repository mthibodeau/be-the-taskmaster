const TaskScore = require('../models/taskModel')
const mongoose = require("mongoose");

const getScores = async (req, res, next) => {
  console.log("getScores");
  const { series, episode } = req.params
  const data = await TaskScore.getTaskScores(series, episode)
  console.log(data)
  if (data !== null) {
    res.status(200).json({ scores: data })
  } else {
    res.status(404).json({ message: 'Scores not found' })
  }
}

const getUserScores = async (req, res, next) => {
  console.log("getUserScores");
  const { series, episode } = req.params
  //const data = await TaskScore.getUserScores(series, episode)
  console.log(req.params.user)
  res.status(200).json({message: "test"});
  // if (data !== null) {
  //   res.status(200).json({ scores: data })
  // } else {
  //   res.status(404).json({ message: 'Scores not found' })
  // }
}

const createScore = async (req, res, next) => {
  const score = new TaskScore({
    _id: new mongoose.Types.ObjectId(),
    user: req.params.user,
    series: req.params.series,
    episode: req.params.episode,
    task: req.params.task,
    description: req.params.description,
    contestantOne: req.params.contestantOneScore,
    contestantTwo: req.params.contestantTwoScore,
    contestantThree: req.params.contestantThreeScore,
    contestantFour: req.params.contestantFourScore,
    contestantFive: req.params.contestantFiveScore
  });

  score.save().then(data => {
    console.log(data);
  }).catch(err => console.log(err));

  res.status(200).json({message: "success?"});

  // console.log("getUserScores");
  // const { series, episode } = req.params
  // const data = await taskModel.getTaskScores(series, episode)
  // console.log(data)
  // if (data !== null) {
  //   res.status(200).json({ scores: data })
  // } else {
  //   res.status(404).json({ message: 'Scores not found' })
  // }
}

module.exports = {
  getScores,
  getUserScores,
  createScore
}