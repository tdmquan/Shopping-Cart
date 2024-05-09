const express = require('express')
const router = express.Router()
const fs = require('fs-extra')
const path = require('path')
const auth = require('../config/auth');
const { showAllProducts, getProductsByCategory, getProductDetails } = require('../controllers/productcontroller')
var isUser = auth.isUser;

// Get Product model
var Product = require('../models/product')

// Get Category model
const Category = require('../models/category');

/*
 * GET all products
 */

router.get('/products', showAllProducts)

/*
 * GET products by category
 */

router.get('/products/:category', getProductsByCategory)

/*
 * GET  products details
 */

router.get('/products/:category/:products', getProductDetails);

//Exports
module.exports = router

