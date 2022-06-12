const taskModel = require('../model/taskModel')

const getScores = async (req, res) => {
  console.log("getScores");
  const { series, episode } = req.params
  const data = await taskModel.getTaskScores(series, episode)
  console.log(data)
  if (data !== null) {
    res.status(200).json({ scores: data })
  } else {
    res.status(404).json({ message: 'Scores not found' })
  }
}

module.exports = {
  getScores
}