const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign({ 
    email: user.email, 
    userId: user._id,
    roles: user.roles,
    avatar: user.avatar  // Add avatar to token
  }, secret, { expiresIn: '24h' });
};

module.exports = generateToken;