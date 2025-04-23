const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { listenerCount } = require('../models/Category');
const sendEmail = require('../utils/sendEmail');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);




//  controller logic to add items to the cart
const addToCart = async (req, res) => {
    try {
        const { id, name, price, image, size, color, quantity } = req.body;

        const item = {
            productId: id.trim(),
            name,
            price,
            image,
            size,
            color,
            quantity: parseInt(quantity)
        }

        if (req.session.user) {
            const userId = req.session.user._id;
            let cart = await Cart.findOne({ userId });

            if (!cart) {
                cart = new Cart({ userId, items: [item] }); // Create new cart with the first item
            } else {
                // Check if the item already exists based on product ID and size
                const existingItem = cart.items.find(i =>
                    i.productId.toString() === item.productId &&
                    i.size === item.size &&
                    i.color === item.color
                );
                if (existingItem) {
                    existingItem.quantity += item.quantity; // Merge quantities
                } else {
                    cart.items.push(item); // Append new item
                }
            }
            await cart.save();
            req.session.cart = cart.items; // Sync session cart with database
        }
        else {
            if (!req.session.cart) req.session.cart = [];
            req.session.cart.push(item);
        }
        res.redirect('/cart');
    } catch (error) {
        console.error('Cart error:', error);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { productId, color, size } = req.body;

        if (!req.session.cart) req.session.cart = [];

        // Filter out the item to remove
        req.session.cart = req.session.cart.filter(item => {
            return !(
                item.productId == productId &&
                item.color === color &&
                item.size === size
            );
        });

        // If logged in, update DB too
        if (req.session.user?._id) {
            const existingCart = await Cart.findOne({ userId: req.session.user._id });

            if (existingCart) {
                existingCart.items = req.session.cart;
                await existingCart.save();
            }
        }

        res.redirect('/cart'); // or return JSON if using frontend fetch
    } catch (err) {
        console.error("Error removing cart item:", err);
        res.status(500).send("Failed to remove item from cart.");
    }
};

const checkoutSuccess = async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id, {
            expand: ['payment_intent'],
        });

        const shippingDetails = session.customer_details;
        const address = shippingDetails?.address || {};

        const paymentStatus = session.payment_status;
        const paymentIntentStatus = session.payment_intent?.status;
        const orderTotal = session.amount_total;

        const user = req.session.user;
        let cartItems = req.session.cart || [];

        // Fetch cart from DB if logged in
        if (user) {
            const cart = await Cart.findOne({ userId: user._id });
            cartItems = cart ? cart.items : [];
        }

        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Save Order
        const order = new Order({
            user: user ? user._id : null,
            items: cartItems,
            total: total + 50, // Including shipping
            shippingAddress: {
                fullName: shippingDetails?.name || "Guest",
                street: address.line1 || '',
                city: address.city || '',
                postalCode: address.postal_code || '',
                country: address.country || '',
            },
            payment_status: paymentIntentStatus === 'succeeded' ? 'paid' : 'pending'
        });

        await order.save();

        if (user) await Cart.deleteOne({ userId: user._id });

        req.session.cart = [];

        // ✅ Send Email
        const emailHTML = `
    <h2>Thank you for your order, ${shippingDetails.name}!</h2>
    <p>Your order of $${(orderTotal / 100).toFixed(2)} has been placed successfully.</p>
    <p>We’ll ship your order to: ${shippingDetails.address.line1}, ${shippingDetails.address.city}</p>
`;
        await sendEmail(shippingDetails.email, 'Order Confirmation - Striv.enp', emailHTML);

        res.render('success', {order});
    } catch (error) {
        console.error("Checkout Success Error:", error);
        res.status(500).send("Something went wrong!");
    }
};



const checkoutCancel = async (req, res) => {
    res.render('cancel')
};


const getCart = async (req, res) => {
    try {
        const cartItems = req.session.cart || [];

        // Populate each cart item with product details
        const populatedCart = await Promise.all(
            cartItems.map(async item => {
                const product = await Product.findById(item.productId);
                if (!product) return null;

                return {
                    productId: product._id,
                    name: product.name,
                    image: product.images[0], // main product image
                    price: product.price,
                    quantity: item.quantity,
                    color: item.color,
                    colorName: item.colorName,
                    size: item.size,
                    total: item.quantity * product.price
                };
            })
        );

        const finalCart = populatedCart.filter(item => item !== null);
        const cartTotal = finalCart.reduce((sum, item) => sum + item.total, 0);

        res.render('pages/cart', {
            cartItems: finalCart,
            cartTotal,
            user: req.session.user // optional if you want to show user name, etc.
        });

    } catch (err) {
        console.error('Error rendering cart:', err);
        res.status(500).send('Error loading cart');
    }
};
const getCheckout = async (req, res) => {
    try {
        const user = req.session.user;
        let cartItems = req.session.cart || [];

        if (user) {
            const Cart = require('../models/Cart');
            const cart = await Cart.findOne({ userId: user._id });
            cartItems = cart ? cart.items : [];
        }

        let total = 0;
        cartItems.forEach(item => {
            total += item.price * item.quantity;
        });

        res.render('pages/checkout', {
            user,
            cartItems,
            total, stripePublicKey: process.env.STRIPE_PUBLIC_KEY
        });
    } catch (err) {
        console.error('Checkout GET error:', err);
        res.redirect('/cart');
    }
}


const sendOrderNotification = async (order) => {
    // Implement email notification here
    // You'll need to set up an email service (e.g., Nodemailer)
};




// Export the new function
const updateQuantity = async (req, res) => {
    try {
        const { productId, quantity, size, color } = req.body;

        // Update session cart
        if (req.session.cart) {
            const cartItem = req.session.cart.find(item => item.productId.toString() === productId && item.size === size && item.color === color);
            if (cartItem) {
                cartItem.quantity = parseInt(quantity);
            }
        }

        // If user is logged in, update database
        if (req.session.user) {
            const cart = await Cart.findOne({ userId: req.session.user._id });
            if (cart) {
                const cartItem = cart.items.find(item => item.productId.toString() === productId);
                if (cartItem) {
                    cartItem.quantity = quantity;
                    await cart.save();
                }
            }
        }

        // Calculate new totals
        const subtotal = req.session.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const total = subtotal + 50; // Adding shipping cost

        res.json({
            success: true,
            subtotal: subtotal,
            newTotal: total
        });
    } catch (error) {
        console.error('Update quantity error:', error);
        res.status(500).json({ error: 'Failed to update quantity' });
    }
};

const checkout = async (req, res) => {
    const { product_name, unit_amount, quantity } = req.body;
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product_name,
                    },
                    unit_amount: parseInt(unit_amount) * 100,
                },
                quantity: parseInt(quantity),
            },
        ],
        mode: 'payment',
        success_url: "http://localhost:8000/checkout/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "http://localhost:8000/checkout/cancel"
    })
    res.redirect(session.url)
}

module.exports = {
    addToCart,
    getCart,
    getCheckout,
    removeFromCart,
    updateQuantity,
    checkoutSuccess,
    checkoutCancel,
    checkout
};