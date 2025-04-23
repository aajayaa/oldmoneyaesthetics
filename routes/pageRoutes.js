const express = require('express');
const router = express.Router();
const { getHome, getCollections, getAbout, getContact, getSingleProduct, profile,orders } = require('../controllers/pageController');
const { isUser, isUserAuth } = require('../middlewares/isUser');


router.get('/', getHome);
router.get('/collections', getCollections);
router.get('/about', getAbout);
router.get('/contact', getContact);
router.get('/product/:productid', getSingleProduct);
router.get('/profile', isUserAuth, isUser, profile);
router.get('/orders', isUserAuth, isUser, orders);

module.exports = router;