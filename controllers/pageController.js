const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

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

// const getCollections = async (req, res) => {
//     const perPage = 6; 
//     const page = parseInt(req.query.page) || 1;

//     const totalProducts = await Product.countDocuments();
//     const totalPages = Math.ceil(totalProducts / perPage);

//     const collections = await Product.find()
//         .skip((page - 1) * perPage)
//         .limit(perPage)
//         .populate('category'); 
//     res.render('pages/collections', {
//         user: res.locals.user,  
//         collections,
//         currentPage: page,
//         totalPages,
//         totalProducts
//     });
// }

// const getCollections = async (req, res) => {
//     const perPage = 6;
//     const page = parseInt(req.query.page) || 1;
//     const category = req.query.category || 'all';
//     const sort = req.query.sort || 'newest';

    
//     let filter = {};
//     if (category !== 'all') {
//         filter['category.name'] = category; 
//     }

    
//     let sortOption = {};
//     switch (sort) {
//         case 'price-asc':
//             sortOption.price = 1;
//             break;
//         case 'price-desc':
//             sortOption.price = -1;
//             break;
//         case 'newest':
//             sortOption.createdAt = -1;
//             break;
//         case 'popular':
//             sortOption.popularity = -1; 
//             break;
//         default:
//             sortOption.createdAt = -1;
//     }

//     const totalProducts = await Product.countDocuments(filter);
//     const totalPages = Math.ceil(totalProducts / perPage);

//     const collections = await Product.find(filter)
//         .populate('category') // ensure category is populated to access category.name
//         .sort(sortOption)
//         .skip((page - 1) * perPage)
//         .limit(perPage);

//     res.render('pages/collections', {
//         user: res.locals.user,
//         collections,
//         currentPage: page,
//         totalPages,
//         totalProducts,
//         category,
//         sort
//     });
// };


const getCollections = async (req, res) => {
    const perPage = 6;
    const page = parseInt(req.query.page) || 1;

    // Get filter and sort values from query
    const category = req.query.category || 'all';
    const sort = req.query.sort || 'newest';

    // Build MongoDB query
    let query = {};
    if (category !== 'all') {
        query = { ...query, 'category.name': category };
    }

    // Build sort object
    let sortOption = {};
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'popular') sortOption = { sold: -1 }; // You can customize this
    else sortOption = { createdAt: -1 }; // 'newest' by default

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / perPage);

    const collections = await Product.find(query)
        .populate('category')
        .sort(sortOption)
        .skip((page - 1) * perPage)
        .limit(perPage);

    res.render('pages/collections', {
        user: res.locals.user,
        collections,
        currentPage: page,
        totalPages,
        totalProducts,
        category,
        sort
    });
};




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
        const similarProducts = await Product.find({ category: product.category, _id: { $ne: product._id } })
            .limit(3)
            .populate('category');
        res.render('pages/singleProduct', {
            user: res.locals.user,  // Add this
            product,
            similarProducts
        });
    } catch (error) {
        console.error('Single product error:', error);
        res.status(500).send('Server Error');
    }
}

const profile = async (req, res) => {
    try {
      
        // Render the profile page with user data
        res.render('pages/profile', {
            user: res.locals.user
        });
    } catch (error) {
        console.error('Profile page error:', error);
        res.status(500).send('Server Error');
    }
}

const orders = async (req, res) => {
    try {
        // Get user ID from res.locals.user since that's what you're using in other routes
        const userId = res.locals.user._id;
        const user = await User.findById(userId);
        console.log(userId)
        console.log(user.name)
        
        if (!userId) {
            return res.redirect('/login');
        }

        const orders = await Order.find({ user: userId });
        res.render('pages/orders', {
            user: res.locals.user,
            orders
        });
    } catch (error) {
        console.error('Orders page error:', error);
        res.status(500).send('Server Error');
    }
}

module.exports = {
    getHome,
    getCollections,
    getAbout,
    getContact,
    getSingleProduct,
    profile,
    orders
}