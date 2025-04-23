const uploadOptions = require('../utils/uploadOptions');
const Category = require('../models/Category');
const Product = require('../models/Product');
// const flash = require('connect-flash');

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
    isAdmin: req.user?.role?.toLowerCase() === 'admin' // Standardize role check
  });
};

const viewCategory = async (req, res) => {
  try {
    // Add null check for req.user
    if (!req.user) {
      return res.redirect('/login');
    }

    // Get categories and count products for each category
    const categories = await Category.find();

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(categories.map(async (category) => {
      const productCount = await Product.countDocuments({ category: category._id });
      return {
        ...category.toObject(),
        productCount
      };
    }));

    res.render('admin/categories/view', {
      title: 'All Categories',
      user: req.user,
      isAdmin: req.user?.role?.toLowerCase() === 'admin',
      categories: categoriesWithCounts || []
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    req.flash('error', 'Error fetching categories');
    res.redirect('/admin/categories');
  }
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

    // Validate image file
    if (!req.file) {
      req.flash('error', 'Image is required');
      return res.redirect('/admin/categories/create');
    }

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/images/uploads/`;

    let category = new Category({
      name: categoryName,
      description: categoryDescription,
      slug: categorySlug,
      image: `${basePath}${fileName}`,
      seoTitle,
      seoDescription,
      createdBy: req.user._id, // Ensure this is populated
      updatedBy: req.user._id, // Ensure this is populated
      displaySettings: {
        isFeatured,
        showInNavigation,
      },
      status: status || 'draft' // Default status if not provided
    });



    category = await category.save();

    // Flash success message
    req.flash('success', 'Category created successfully');
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Category creation error:', error);
    // Flash error message to user with more details
    req.flash('error', `Failed to create category`);
    res.redirect('/admin/categories/create');
  }
};

// category deletion

const handleCategoryDeletion = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id); // Changed to findByIdAndDelete

    if (!category) {
      req.falsh('error', 'Category not found');
      // return res.status(404).json({
      //   success: false,
      //   message: "Category not found",
      // });
    }

    // return res.status(200).json({
    //   success: true,
    //   message: "Category deleted successfully",
    //   data: category,
    // });
    req.flash('success', 'Category deleted successfully');
    res.redirect('/admin/categories');
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
}

// Show category update form
const showCategoryUpdateForm = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/admin/categories');
    }

    res.render('admin/categories/edit', {
      title: 'Update Category',
      user: req.user,
      isAdmin: req.user?.role?.toLowerCase() === 'admin',
      category: category,
      uploadOptions: uploadOptions,
    })
  }catch (error) {
    console.error('Error fetching category for update:', error);
    req.flash('error', 'Error fetching category for update');
    res.redirect('/admin/categories');
  }
}

// category update
const handleCategoryUpdate = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      categoryName,
      categoryDescription,
      categorySlug,
      seoTitle,
      seoDescription,
      status,
    } = req.body;

    if (!categoryName || !categorySlug) {
      return res.status(400).send("Category name and slug are required");
    }

    const isFeatured = getBooleanValue(req.body.isFeatured);
    const showInNavigation = getBooleanValue(req.body.showInNavigation);

    const basePath = `${req.protocol}://${req.get('host')}/public/images/uploads/`;

    const category = await Category.findById(id);
    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/admin/categories');
    }

    let updatedFields = {
      name: categoryName,
      description: categoryDescription,
      slug: categorySlug,
      seoTitle,
      seoDescription,
      status: status || 'draft',
      displaySettings: {
        isFeatured,
        showInNavigation,
      },
      image: category.image, // fallback to existing image
    };

    if (req.file) {
      updatedFields.image = `${basePath}${req.file.filename}`;
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    if (!updatedCategory) {
      req.flash('error', 'Category update failed');
      return res.redirect(`/admin/categories/edit/${id}`);
    }

    req.flash('success', 'Category updated successfully');
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Update error:', error);
    req.flash('error', 'Error while updating category');
    res.redirect('/admin/categories');
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
      productRichDescription,
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
      richDescription: productRichDescription,
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
// handle the product update

const handleProductUpdate = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      categoryName,
      categoryDescription,
      categorySlug,
      seoTitle,
      seoDescription,
      status,
    } = req.body;

    if (!categoryName || !categorySlug) {
      return res.status(400).send("Category name and slug are required");
    }

    const isFeatured = getBooleanValue(req.body.isFeatured);
    const showInNavigation = getBooleanValue(req.body.showInNavigation);

    const basePath = `${req.protocol}://${req.get('host')}/public/images/uploads/`;

    const category = await Category.findById(id);
    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/admin/categories');
    }

    let updatedFields = {
      name: categoryName,
      description: categoryDescription,
      slug: categorySlug,
      seoTitle,
      seoDescription,
      status: status || 'draft',
      displaySettings: {
        isFeatured,
        showInNavigation,
      },
      image: category.image, // fallback to existing image
    };

    if (req.file) {
      updatedFields.image = `${basePath}${req.file.filename}`;
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    if (!updatedCategory) {
      req.flash('error', 'Category update failed');
      return res.redirect(`/admin/categories/edit/${id}`);
    }

    req.flash('success', 'Category updated successfully');
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Update error:', error);
    req.flash('error', 'Error while updating category');
    res.redirect('/admin/categories');
  }
};

// show product update form

const showProductUpdateForm = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
const categories = await Category.find();
    if (!product) {
      req.flash('error', 'Category not found');
      return res.redirect('/admin/products');
    }

    res.render('admin/products/edit', {
      title: 'Update Product',
      user: req.user,
      isAdmin: req.user?.role?.toLowerCase() === 'admin',
      product: product,
      categories: categories,
      uploadOptions: uploadOptions,
    })
  }catch (error) {
    console.error('Error fetching category for update:', error);
    req.flash('error', 'Error fetching product for update');
    res.redirect('/admin/products');
  }
}

const orders = (req, res) => {
  res.render('admin/orders');
};

module.exports = {
  getDashboard,
  createProduct,
  viewProduct,
  createCategory,
  viewCategory,
  handleCategorySubmit,
  handleProductSubmit,
  handleCategoryDeletion,
  orders,
  showCategoryUpdateForm,
  handleCategoryUpdate,
  handleProductUpdate,
  showProductUpdateForm
};