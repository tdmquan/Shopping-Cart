const express = require('express')
const router = express.Router()
const {showHomePageUser, showAPageUser} = require('../controllers/pagecontroller')

// Get Page model
var Page = require('../models/page')

/*
 * GET /
 */

router.get('/', showHomePageUser)

/*
 * GET a page
 */

router.get('/:slug', showAPageUser)

//Exports
module.exports = router

