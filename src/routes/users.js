const express = require('express')
const router = express.Router()
const passport = require('passport');
var bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const flash = require("connect-flash")
const { getRegister, postRegister, getLogin, postLogin, getLogout } = require('../controllers/usercontroller')

// Get Users model
var Users = require('../models/user')

/*
 * GET register
 */
router.get('/users/register', getRegister)

/*
 * POST register
 */
router.post('/users/register', postRegister);

/*
 * GET login
 */
router.get('/users/login', getLogin)

/*
 * POST login
 */
router.use(flash());
router.post('/users/login', postLogin)

/*
 * GET logout
 */
router.get('/users/logout', getLogout);

//Exports
module.exports = router

