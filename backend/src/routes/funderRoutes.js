const router = require('express').Router();
const { createFunder, listFunders, searchFunders } = require('../controllers/funderController');

router.get('/', listFunders);
router.post('/', createFunder);
router.get('/search', searchFunders);

module.exports = router;
