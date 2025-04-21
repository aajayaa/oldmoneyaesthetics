const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

const addToCart = async (req, res) => {
    try {
        const { productId, size, color, quantity } = req.body;
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Initialize cart in session
        if (!req.session.cart) {
            req.session.cart = [];
        }

        // Add to session cart
        req.session.cart.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            size,
            color,
            quantity
        });

        // If user is logged in, save to database
        if (req.session.user) {
            let cart = await Cart.findOne({ userId: req.session.user._id });
            if (!cart) {
                cart = new Cart({ userId: req.session.user._id, items: [] });
            }
            cart.items = req.session.cart;
            await cart.save();
        }

        res.status(200).json({ message: 'Product added to cart' });
    } catch (error) {
        console.error('Cart error:', error);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
};

const getCart = (req, res) => {
    const cart = req.session.cart || [];
    res.render('pages/cart', {
        user: res.locals.user,  // Changed from req.user to res.locals.user
        cart: cart
    });
};
const getCheckout = (req, res) => {
    const cart = req.session.cart || [];
    res.render('pages/checkout', {
        user: res.locals.user,  // Changed from req.user to res.locals.user
        cart: cart
    });
};

const checkout = async (req, res) => {
    try {
        if (!res.locals.user) {
            return res.status(401).json({ error: 'Please login to checkout' });
        }

        const cart = req.session.cart || [];
        if (cart.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        const { address, city, state, postalCode, country } = req.body;
        
        // Validate shipping details
        if (!address || !city || !state || !postalCode || !country) {
            return res.status(400).json({ error: 'All shipping details are required' });
        }

        const totalAmount = cart.reduce((total, item) => 
            total + (item.price * item.quantity), 0);

        const order = new Order({
            user: res.locals.user._id,
            items: cart,
            totalAmount,
            shippingAddress: {
                street: address,
                city,
                state,
                postalCode,
                country
            },
            status: 'pending'
        });

        await order.save();

        // Clear cart from both session and database
        req.session.cart = [];
        await Cart.findOneAndUpdate(
            { userId: res.locals.user._id },
            { items: [] }
        );

        res.status(200).json({ 
            success: true,
            message: 'Order placed successfully', 
            orderId: order._id 
        });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Failed to process checkout' });
    }
};

const sendOrderNotification = async (order) => {
    // Implement email notification here
    // You'll need to set up an email service (e.g., Nodemailer)
};



// Export the new function
module.exports = {
    addToCart,
    getCart,
    getCheckout,
    checkout
};