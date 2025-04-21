const express = require('express');
const router = express.Router();
const { getHome, getCollections, getAbout, getContact, getSingleProduct } = require('../controllers/pageController');


router.get('/', getHome);
router.get('/collections', getCollections);
router.get('/about', getAbout);
router.get('/contact', getContact);
router.get('/product/:productid', getSingleProduct);

module.exports = router;