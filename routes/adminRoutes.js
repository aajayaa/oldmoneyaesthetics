const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middlewares/isauthenticated');
const adminController = require('../controllers/adminController');
const uploadOptions = require('../utils/uploadOptions');

// Apply both authentication and admin check middleware
router.use(isAuthenticated);
router.use(isAdmin);

router.get('/dashboard', adminController.getDashboard);
router.get('/products/create', adminController.createProduct);
router.get('/products', adminController.viewProduct);
router.get('/categories', adminController.viewCategory);
router.get('/categories/create', adminController.createCategory);
router.post('/categories/create', uploadOptions.single('image'), adminController.handleCategorySubmit);
router.post('/products/create', uploadOptions.array('images', 10), adminController.handleProductSubmit);

module.exports = router;