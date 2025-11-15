const router = require('express').Router();
const {
  createJob,
  getJob,
  submitAnswers,
  submitcollabration,
  listCollabrations,
  requestCollabration,
} = require('../controllers/jobController');

router.post('/', createJob);
router.get('/collabrations', listCollabrations);
router.get('/:jobId', getJob);
router.post('/:jobId/answers', submitAnswers);
router.post('/:jobId/collabrations', submitcollabration);
router.post('/collabrations/:collabrationId/request', requestCollabration);

module.exports = router;
