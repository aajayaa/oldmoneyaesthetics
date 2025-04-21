const User = require('../models/User'); // Import the User model
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing\'
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for token generation
const validator = require('validator'); // Import validator for email validation
const generateToken = require('../utils/generateToken');
const Cart = require('../models/Cart');

const getLogin = (req, res) => {
    res.render('auth/login', {
        user: null,
        title: 'Login'
    });
}

const getRegister = (req, res) => {
    res.render('auth/register', {
        user: null,
        title: 'Register'
    });
}
const postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        bcrypt.compare(password, user.password, async (err, result) => {
            if (result) {
                const token = generateToken(user)
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 24 * 60 * 60 * 1000 // 24 hours
                })
                
                // Store complete user info in session
                req.session.user = {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    roles: user.roles,
                    role: user.roles.includes('Admin') ? 'Admin' : 'User' // Add explicit role
                }

                // Get user's cart from database if exists
                const userCart = await Cart.findOne({ userId: user._id });
                if (userCart) {
                    req.session.cart = userCart.items;
                }

                // Set session expiry
                req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours

                req.session.save(err => {
                    if (err) {
                        console.error("Session save error: ", err)
                        return res.status(500).json({ message: 'Session save failed' });
                    }
                    if (user.roles.includes('Admin')) {
                        res.redirect('/admin/dashboard');
                    } else {
                        res.redirect('/');
                    }
                });
            } else {
                res.redirect('/login');
            }
        })
    } catch (error) {
        console.log('Login error:', error);
        return res.status(500).json({ message: 'Login failed', success: false, error: error.message });
    }
}
const postRegister = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword } = req.body;
        console.log(req.body)
        const name = `${firstName} ${lastName}`
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        let user = new User({
            name,
            email,
            password: bcrypt.hashSync(password, 10)

        })
        user = await user.save();
        const token = generateToken(user)
        res.cookie('token', token)
        // res.redirect('/admin/dashboard')
        if (user.roles.includes('Admin')) {
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/'); // Redirect regular users to home page
        }
    } catch (error) {
        console.log('Registration error:', error)
        return res.status(500).json({ message: 'Registration failed', success: false, error: error.message });
    }
}

const logout = (req, res) => {
    res.clearCookie('token');
    res.clearCookie('connect.sid');
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destroy error:', err);
        }
        res.redirect('/login');
    });
};


module.exports = {
    getLogin,
    postLogin,
    getRegister,
    postRegister,
    logout,
}