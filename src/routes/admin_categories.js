const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const auth = require('../config/auth');
var isAdmin = auth.isAdmin;
const { showCategories, getAddCategory, postAddCategory, getEditCategory, postEditCategory, deleteCategory } = require('../controllers/categorycontroller')

// Get Category model
const Category = require('../models/category');

/*
 * GET categories index
*/
router.get('/categories', isAdmin, showCategories);

/*
 * GET add category
*/
router.get('/categories/add-category', isAdmin, getAddCategory)

/*
 * POST add category
*/
router.post('/categories/add-category', [
    check('title').notEmpty().withMessage('Title must have a value')
], postAddCategory);

/*
 * GET edit category
*/
router.get('/categories/edit-category/:id', isAdmin, getEditCategory);

/*
 * POST edit category
*/
router.post('/categories/edit-category/:id', [
    check('title').notEmpty().withMessage('Title must have a value')
], postEditCategory);


/*
 * GET delete page
*/
router.get('/categories/delete-category/:id', isAdmin, deleteCategory);

//Exports
module.exports = router