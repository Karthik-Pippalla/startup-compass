const router = require('express').Router();
const { createJob, getJob, submitAnswers } = require('../controllers/jobController');

router.post('/', createJob);
router.get('/:jobId', getJob);
router.post('/:jobId/answers', submitAnswers);

module.exports = router;
