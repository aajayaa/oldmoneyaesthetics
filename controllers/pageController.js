const Product = require('../models/Product');

const getHome = async (req, res) => {
    try {
        const products = await Product.find();
        const featuredProducts = await Product.find({ isFeatured: true }).limit(3);
        res.render('pages/home', {
            user: res.locals.user,  // Using res.locals.user instead of req.user
            products,
            featuredProducts
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.status(500).send('Server Error');
    }
}

const getCollections = async (req, res) => {
    const perPage = 6; // Number of products per page
    const page = parseInt(req.query.page) || 1;

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / perPage);

    const collections = await Product.find()
        .skip((page - 1) * perPage)
        .limit(perPage)
        .populate('category'); // if using Mongoose population
    // const collections = await Product.find().populate('category');
    res.render('pages/collections', {
        user: res.locals.user,  // Add this
        collections,
        currentPage: page,
        totalPages,
        totalProducts
    });
}

const getAbout = (req, res) => {
    res.render('pages/about', {
        user: res.locals.user  // Add this
    });
}

const getContact = (req, res) => {
    res.render('pages/contact', {
        user: res.locals.user  // Add this
    });
}

const getSingleProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productid);
        res.render('pages/singleProduct', {
            user: res.locals.user,  // Add this
            product
        });
    } catch (error) {
        console.error('Single product error:', error);
        res.status(500).send('Server Error');
    }
}


const pagination = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;

    const skip = (page - 1) * limit;

    const collections = await Product.find()
        .skip(skip)
        .limit(limit)
        .populate("category"); // if category is referenced

    const totalCount = await Product.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    res.render("products/index", {
        collections,
        currentPage: page,
        totalPages,
    });
}
module.exports = {
    getHome,
    getCollections,
    getAbout,
    getContact,
    getSingleProduct
}