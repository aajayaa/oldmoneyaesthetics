const uploadOptions = require('../utils/uploadOptions');
const Category = require('../models/Category');
const Product = require('../models/Product');

const getDashboard = async (req, res) => {
  try {
    // Add null check for req.user
    if (!req.user) {
      return res.redirect('/login');
    }
    
    res.render('admin/dashboard', {
      title: 'Dashboard',
      user: req.user,
      isAdmin: req.user.role === 'Admin' // Note: Case sensitivity - 'Admin' vs 'admin'
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.redirect('/login');
  }
};

const createProduct = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.redirect('/login');
    }

    const categories = await Category.find({ status: 'published' }).select('name _id');
    res.render('admin/products/create', {
      title: 'Create Product',
      user: req.user,
      isAdmin: req.user?.role?.toLowerCase() === 'admin', // Safe navigation operator
      categories: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.redirect('/login'); // Redirect to login on error
  }
};

const viewProduct = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.redirect('/login');
    }

    const products = await Product.find().populate('category');
    
    res.render('admin/products/view', {
      title: 'All Products',
      user: req.user,
      isAdmin: req.user?.role?.toLowerCase() === 'admin', // Safe navigation
      products: products || []
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.redirect('/login');
  }
};

const createCategory = (req, res) => {
  // Add null check for req.user
  if (!req.user) {
    return res.redirect('/login');
  }
  
  res.render('admin/categories/create', {
    title: 'Create Category',
    user: req.user,
    isAdmin: req.user.role.toLowerCase() === 'admin' // Standardize role check
  });
};

const viewCategory = (req, res) => {
  // Add null check for req.user
  if (!req.user) {
    return res.redirect('/login');
  }
  
  res.render('admin/categories/view', {
    title: 'All Categories',
    user: req.user,
    isAdmin: req.user.role.toLowerCase() === 'admin' // Standardize role check
  });
};

const getBooleanValue = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return Boolean(value);
};

const handleCategorySubmit = async (req, res) => {
  try {

    console.log(req.user);
    // Add null check for req.user
    if (!req.user) {
      return res.redirect('/login');
    }
    
    const { categoryName, categoryDescription, categorySlug, seoTitle, seoDescription, status } = req.body;
    
    // Validate required fields
    if (!categoryName || !categorySlug) {
      return res.status(400).send("Category name and slug are required");
    }
    
    const isFeatured = getBooleanValue(req.body.isFeatured);
    const showInNavigation = getBooleanValue(req.body.showInNavigation);

    const file = req.file;
    if (!file) return res.status(400).send("No image in the request");
    
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/images/uploads/`;

    let category = new Category({
      name: categoryName,
      description: categoryDescription,
      slug: categorySlug,
      image: `${basePath}${fileName}`,
      seoTitle,
      seoDescription,
      createdBy: req.user._id,
      updatedBy: req.user._id,
      displaySettings: {
        isFeatured,
        showInNavigation,
      },
      status: status || 'draft' // Default status if not provided
    });
    
    category = await category.save();
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Category creation error:', error);
    // Flash error message to user
    req.flash('error', error.message || 'Failed to create category');
    res.redirect('/admin/categories/create');
  }
};

const handleProductSubmit = async (req, res) => {
  try {
    // Add null check for req.user
    if (!req.user) {
      return res.redirect('/login');
    }
    
    const { 
      productName, 
      productCategory, 
      productCollection, 
      productDescription, 
      productCurrency, 
      productPrice, 
      productComparePrice, 
      productCost, 
      productBarcode, 
      productQuantity 
    } = req.body;

    // Validate required fields
    if (!productName || !productCategory || !productPrice) {
      return res.status(400).send("Product name, category and price are required");
    }

    const productSKU = Array.isArray(req.body.productSKU) ? req.body.productSKU[0] : req.body.productSKU;

    // Check if SKU already exists
    if (productSKU) {
      const existingSKU = await Product.findOne({ sku: productSKU });
      if (existingSKU) {
        throw new Error('A product with this SKU already exists');
      }
    }

    const isFeatured = getBooleanValue(req.body.isFeatured);
    const chargeTaxes = getBooleanValue(req.body.chargeTaxes);
    const trackQuantity = getBooleanValue(req.body.trackQuantity);
    const sizeEnabled = getBooleanValue(req.body.sizeEnabled);
    const colorEnabled = getBooleanValue(req.body.colorEnabled);

    // Process sizes and colors
    const sizes = req.body.sizeName ? req.body.sizeName.map((name, index) => ({
      name,
      description: req.body.sizeDescription?.[index] || '',
      enabled: req.body.sizeEnabled ? getBooleanValue(req.body.sizeEnabled[index]) : true
    })) : [];

    const colors = req.body.colorName ? req.body.colorName.map((name, index) => ({
      name,
      hexCode: req.body.hexCode?.[index] || '#000000', // Default color
      enabled: req.body.colorEnabled ? getBooleanValue(req.body.colorEnabled[index]) : true
    })) : [];

    if (!req.files || req.files.length === 0) {
      return res.status(400).send("At least one image is required");
    }

    const basePath = `${req.protocol}://${req.get("host")}/public/images/uploads/`;
    const imagesPaths = req.files.map((file) => `${basePath}${file.filename}`);

    let product = new Product({
      name: productName,
      description: productDescription,
      category: productCategory,
      productCollection: productCollection,
      price: parseFloat(productPrice), // Ensure number type
      originalPrice: productComparePrice ? parseFloat(productComparePrice) : null,
      costPrice: productCost ? parseFloat(productCost) : null,
      currency: productCurrency || 'USD', // Default currency
      chargeTaxes,
      sku: productSKU,
      barcode: productBarcode,
      trackQuantity,
      stock: parseInt(productQuantity) || 0, // Default to 0
      isFeatured,
      sizes,
      colors,
      image: imagesPaths[0], // First image as main image
      images: imagesPaths,
      createdBy: req.user._id,
      updatedBy: req.user._id,
      status: 'draft' // Default status
    });
    
    product = await product.save();
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Product creation error:', error);
    // Flash error message to user
    req.flash('error', error.message || 'Failed to create product');
    res.redirect('/admin/products/create');
  }
};

module.exports = {
  getDashboard,
  createProduct,
  viewProduct,
  createCategory,
  viewCategory,
  handleCategorySubmit,
  handleProductSubmit
};