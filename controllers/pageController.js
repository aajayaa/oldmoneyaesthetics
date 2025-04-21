const Product = require('../models/Product');

const getHome = async (req, res) => {
    try {
        const products = await Product.find();
        res.render('pages/home', {
            user: res.locals.user,  // Using res.locals.user instead of req.user
            products
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.status(500).send('Server Error');
    }
}

const getCollections = (req, res) => {
    res.render('pages/collections', {
        user: res.locals.user  // Add this
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

module.exports = {
    getHome,
    getCollections,
    getAbout,
    getContact,
    getSingleProduct
}