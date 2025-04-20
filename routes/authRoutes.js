const express = require('express');
const router = express.Router();
const { getLogin, getRegister, postRegister, postLogin, logout } = require('../controllers/authController');


router.get('/login', getLogin);
router.get('/register', getRegister);
router.post('/login', postLogin);
router.post('/register', postRegister);
router.get('/logout', logout);

module.exports = router;