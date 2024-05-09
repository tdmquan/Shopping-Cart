const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const { mkdirp } = require('mkdirp')
const fs = require('fs-extra')
const resizeImg = require('resize-img')
const auth = require('../config/auth');
var isAdmin = auth.isAdmin;
const path = require('path');
const { showProductsAdmin, getAddProduct, postAddProduct, getEditProduct, postEditProduct, postProductGallery, deleteImage, deleteProduct } = require('../controllers/productcontroller')

// Get Product model
var Product = require('../models/product')

// Get Category model
const Category = require('../models/category');
/*
 * GET products index
*/
router.get('/products', isAdmin, showProductsAdmin);

/*
 * GET add product
*/
router.get('/products/add-product', isAdmin, getAddProduct)


/*
 * POST add product
*/
router.post('/products/add-product', [
    check('title', 'Title must have a value.').notEmpty(),
    check('desc', 'Description must have a value.').notEmpty(),
    check('price', 'Price must have a value.').isDecimal(),
    check('image', 'You must upload an image')
        .custom((value, { req }) => {
            const extension = path.extname(req.files.image.name).toUpperCase();
            switch (extension) {
                case '.JPG':
                case '.JPEG':
                case '.PNG':
                    return true;
                default:
                    return false;
            }
        })
], postAddProduct);

/*
 * GET edit product
*/
router.get('/products/edit-product/:id', isAdmin, getEditProduct);


/*
 * POST edit product
*/
router.post('/products/edit-product/:id', [
    check('title', 'Title must have a value.').notEmpty(),
    check('desc', 'Description must have a value.').notEmpty(),
    check('price', 'Price must have a value.').isDecimal(),
    check('image', 'You must upload an image')
        .custom((value, { req }) => {
            const extension = path.extname(req.files.image.name).toUpperCase();
            switch (extension) {
                case '.JPG':
                case '.JPEG':
                case '.PNG':
                    return true;
                default:
                    return false;
            }
        })
], postEditProduct);

/*
 * POST product gallery
*/
router.post('/products/product-gallery/:id', postProductGallery);

/*
 * GET delete image
*/
router.get('/products/delete-image/:image', isAdmin, deleteImage);

/*
 * GET delete product
*/
router.get('/products/delete-product/:id', isAdmin, deleteProduct);

//Exports
module.exports = router