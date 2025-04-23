require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const port = process.env.PORT;

// Database Connection
const db = require('./config/connection');

// App Settings (move these up)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DB_URI
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(flash());

// Add flash messages to response locals
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Make user available to all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use("/public/images/uploads", express.static(__dirname + "/public/images/uploads"));

// Route Imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const pageRoutes = require('./routes/pageRoutes');
const cartRoutes = require('./routes/cartRoutes');
const searchRoutes = require('./routes/searchRoutes');

// Routes
app.use('/', pageRoutes);
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', cartRoutes);
app.use('/search', searchRoutes);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});