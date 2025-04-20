const uploadOptions = require('../utils/uploadOptions');
const Category = require('../models/Category');
const Product = require('../models/Product');

const getDashboard = async (req, res) => {
  try {
    res.render('admin/dashboard', {
      title: 'Dashboard',
      user: req.user,
      isAdmin: req.user.role === 'Admin'
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.redirect('/login');
  }
};

const createProduct = async (req, res) => {
  try {
    const categories = await Category.find({ status: 'published' }).select('name _id');
    res.render('admin/products/create', {
      title: 'Create Product',
      user: req.user,
      isAdmin: req.user.role === 'admin',
      categories: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.render('admin/products/create', {
      title: 'Create Product',
      user: req.user,
      isAdmin: req.user.role === 'admin',
      categories: []
    });
  }


};

const viewProduct = (req, res) => {
  res.render('admin/products/view', {
    title: 'All Products',
    user: req.user,
    isAdmin: req.user.role === 'admin'
  });
};

const createCategory = (req, res) => {
  res.render('admin/categories/create', {
    title: 'Create Category',
    user: req.user,
    isAdmin: req.user.role === 'admin'
  });
};

const viewCategory = (req, res) => {
  res.render('admin/categories/view', {
    title: 'All Categories',
    user: req.user,
    isAdmin: req.user.role === 'admin'
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
    const { categoryName, categoryDescription, categorySlug, seoTitle, seoDescription, status } = req.body;
    const isFeatured = getBooleanValue(req.body.isFeatured);
    const showInNavigation = getBooleanValue(req.body.showInNavigation);
    console.log(isFeatured);

    const file = req.file;
    if (!file) return res.status(400).send("No image in the request");
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

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
      }
      ,
      status
    });
    category = await category.save();

    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Category creation error:', error);
    res.redirect('/admin/categories/create');
  }
};

const handleProductSubmit = async (req, res) => {
  try {
    const { productName, productCategory, productCollection, productDescription, productCurrency, productPrice, productComparePrice, productCost, productBarcode, productQuantity } = req.body;

    const productSKU  =Array.isArray(req.body.productSKU) ? req.body.productSKU[0] : req.body.productSKU;

    // Check if SKU already exists
    const existingSKU = await Product.findOne({ sku: productSKU });
    if (existingSKU) {
      throw new Error('A product with this SKU already exists');
    }


    const sizeDescriptions = req.body.sizeDescription;
    const hexCodes = req.body.hexCode;
    const isFeatured = getBooleanValue(req.body.isFeatured);
    const chargeTaxes = getBooleanValue(req.body.chargeTaxes);
    const trackQuantity = getBooleanValue(req.body.trackQuantity);
    const sizeEnabled = getBooleanValue(req.body.sizeEnabled);
    const colorEnabled = getBooleanValue(req.body.colorEnabled);
    console.log(isFeatured);

    // Process sizes and colors
    const sizes = req.body.sizeName ? req.body.sizeName.map((name, index) => ({
      name,
      description: req.body.sizeDescription[index],
      enabled: req.body.sizeEnabled ? req.body.sizeEnabled[index] === 'true' : true
    })) : [];

    const colors = req.body.colorName ? req.body.colorName.map((name, index) => ({
      name,
      hexCode: req.body.hexCode[index],
      enabled: req.body.colorEnabled ? req.body.colorEnabled[index] === 'true' : true
    })) : [];


    if (!req.files) return res.status(400).send("No image in the request");

    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    const imagesPaths = req.files.map((file) => `${basePath}${file.filename}`);

    let product = new Product({
      name: productName,
      description: productDescription,
      category: productCategory,
      collection: productCollection,
      price: productPrice,
      originalPrice: productComparePrice,
      costPrice: productCost,
      currency: productCurrency,
      chargeTaxes: chargeTaxes,
      sku: productSKU,
      barcode: productBarcode,
      trackQuantity: trackQuantity,
      stock: productQuantity,
      isFeatured: isFeatured,
      sizes: sizes,
      colors: colors,
      image: imagesPaths[0] || '', // First image as main image
      images: imagesPaths, // All images
      createdBy: req.user._id,
      updatedBy: req.user._id
    });
    product = await product.save();

    res.redirect('/admin/products');
  } catch (error) {
    console.error('Category creation error:', error);
    res.redirect('/admin/products/create');
  }
}

module.exports = {
  getDashboard,
  createProduct,
  viewProduct,
  createCategory,
  viewCategory,
  handleCategorySubmit,
  handleProductSubmit
};