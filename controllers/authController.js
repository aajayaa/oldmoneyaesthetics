const User = require('../models/User'); // Import the User model
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing\'
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for token generation
const validator = require('validator'); // Import validator for email validation
const generateToken = require('../utils/generateToken');

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
      bcrypt.compare(password, user.password, (err, result) => {
         if(result){
            const token = generateToken(user)
            res.cookie('token', token)
            // Check user role and redirect accordingly
            if (user.roles.includes('Admin')) {
                res.redirect('/admin/dashboard');
            } else {
                res.redirect('/'); // Redirect regular users to home page
            }
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
        if(!validator.isEmail(email)){
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
        console.log('Registration error:',error)
        return res.status(500).json({ message: 'Registration failed',success: false, error: error.message });
    }
}

const logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/login'); 
}


module.exports = {
    getLogin,
    postLogin,
    getRegister,
    postRegister,
    logout,
}