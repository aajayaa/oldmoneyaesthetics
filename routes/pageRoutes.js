const express = require('express');
const router = express.Router();
const { getHome } = require('../controllers/pageController');
const { isAuthenticated } = require('../middlewares/isAuthenticated');

router.get('/', getHome);

module.exports = router;