const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { isAuthenticated } = require('../middlewares/isauthenticated');

router.post('/add', cartController.addToCart);
router.get('/', cartController.getCart);
router.get('/checkout', isAuthenticated, cartController.getCheckout);
router.post('/checkout', isAuthenticated, cartController.checkout);


module.exports = router;