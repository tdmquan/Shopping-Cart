const express = require('express')
const products = require('./products.js')
const cart = require('./cart.js')
const users = require('./users.js')
const adminPages = require('./admin_pages.js')
const adminCategories = require('./admin_categories.js')
const adminProducts = require('./admin_products.js')
const pages = require('./pages.js')
const Route = express.Router()
function Router(app) {
    Route.use('/admin',adminPages)
    Route.use('/admin', adminCategories)
    Route.use('/admin', adminProducts)
    Route.use('/', products)
    Route.use('/', cart)
    Route.use('/', users)
    Route.use('/', pages)
    app.use(Route)
}

module.exports = Router