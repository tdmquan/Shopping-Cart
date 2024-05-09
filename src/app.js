const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const config = require('./config/database')
const bodyParser = require('body-parser')
const session = require('express-session')
const fileUpload = require('express-fileupload')
const expressValidator = require('express-validator')
const passport = require('passport');
require('dotenv').config();

//Connect to db
mongoose.connect(config.database)
    .then(() => console.log('connect Successfully'))
    .catch(error => console.log(error))

//Init app
const app = express()

//View engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//set public folder
app.use(express.static(path.join(__dirname, 'public')))

// set global errors variable
app.locals.errors = null

// Get Page Model
var Page = require('./models/page');

//Get all pages to pass to header.ejs
Page.find({}).sort({ sorting: 1 })
    .then(function (pages) {
        app.locals.pages = pages;
    })
    .catch(function (err) {
        console.error(err);
    });

// Get Category Model
var Category = require('./models/category');

//Get all categories to pass to header.ejs
Category.find()
    .then(function (categories) {
        app.locals.categories = categories;
    })
    .catch(function (err) {
        console.error(err);
    });

// Express fileUpload middleware
app.use(fileUpload());

//Body Parser middleware

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// Express Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
}))

// Passport config
require('./config/passport')(passport);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req,res,next) {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next()
})

// Set Route
const Router = require('./routes/index')
Router(app);
// const pages = require('./routes/pages.js')
// const products = require('./routes/products.js')
// const cart = require('./routes/cart.js')
// const users = require('./routes/users.js')
// const adminPages = require('./routes/admin_pages.js')
// const adminCategories = require('./routes/admin_categories.js')
// const adminProducts = require('./routes/admin_products.js')

// app.use('/admin', adminPages)
// app.use('/admin/categories', adminCategories)
// app.use('/admin/products', adminProducts)
// app.use('/products', products)
// app.use('/cart', cart)
// app.use('/users', users)
// app.use('/', pages)

//static the server
app.listen(process.env.PORT || 3000, function () {
    console.log('Server started on port ' + process.env.PORT)
})