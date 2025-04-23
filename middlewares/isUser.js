const jwt = require('jsonwebtoken');

const isUserAuth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
}

const isUser = (req, res, next) => {
    if (req.user && req.user.roles.includes('User')) {
        next();
    } else {
        res.clearCookie('token');
        return res.redirect('/login?error=unauthorized');
    }
}

module.exports = { isUserAuth, isUser };