const express = require('express');
const router = express.Router();

const taskController = require('../controller/taskController');

router.get('/:series/:episode/:task', taskController.getScores);

module.exports = router;