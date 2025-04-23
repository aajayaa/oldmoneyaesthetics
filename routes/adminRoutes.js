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
router.get('/products/edit/:id', adminController.showProductUpdateForm);
router.post('/products/update/:id', adminController.handleProductUpdate);
router.get('/products/delete/:id', adminController.handleProductDeletion);
router.get('/orders', adminController.orders);
router.get('/categories', adminController.viewCategory);
router.get('/categories/create', adminController.createCategory);
router.get('/categories/delete/:id', adminController.handleCategoryDeletion);
router.get('/categories/edit/:id', adminController.showCategoryUpdateForm);
// Update this line to include the upload middleware
router.post('/categories/update/:id', uploadOptions.single('image'), adminController.handleCategoryUpdate);
router.post('/categories/create', uploadOptions.single('image'), adminController.handleCategorySubmit);
router.post('/products/create', uploadOptions.array('images', 10), adminController.handleProductSubmit);
router.get('/sales', function(req, res){
    res.render('admin/salesAnalytics')
})

module.exports = router;