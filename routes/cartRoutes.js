const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { isAuthenticated } = require('../middlewares/isauthenticated');


router.post('/add-to-cart', cartController.addToCart);
router.post('/remove-from-cart', cartController.removeFromCart);
router.get('/cart', cartController.getCart);
router.post('/cart/update-quantity', cartController.updateQuantity);
router.get('/checkout', isAuthenticated, cartController.getCheckout);
router.post('/checkout', cartController.checkout);
router.get('/checkout/success', cartController.checkoutSuccess);
router.get('/checkout/camcel', cartController.checkoutCancel);


module.exports = router;