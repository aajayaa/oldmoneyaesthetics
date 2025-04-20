require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const port = process.env.PORT;

// Database Connection
const db = require('./config/connection');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// App Settings
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route Imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const pageRoutes = require('./routes/pageRoutes');
app.use('/', pageRoutes)
app.use('/', authRoutes)
app.use('/admin', adminRoutes)
app.use("/public/images/uploads", express.static(__dirname + "/public/images/uploads"));

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});