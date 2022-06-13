const express = require('express');
const router = express.Router();

const taskController = require('../controller/taskController');
const TaskScore = require('../models/taskModel')


router.get('/:user/:series/:episode/:task', taskController.getUserScores);

router.put('/:user/:series/:episode/:task', taskController.createScore);
//


module.exports = router;