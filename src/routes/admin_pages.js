const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const auth = require('../config/auth');
const {showPageAdmin, getAddPage, postAddPage, getEditPage, postEditPage, deletePage} = require('../controllers/pagecontroller')
var isAdmin = auth.isAdmin;

// Get Page model
var Page = require('../models/page')

/*
 * GET pages index
*/
router.get('/pages',showPageAdmin);

/*
 * GET add page
*/
router.get('/pages/add-page', isAdmin, getAddPage)

/*
 * POST add page
*/
router.post('/pages/add-page', [
    check('title', 'Title must have a value.').notEmpty(),
    check('content', 'Content must have a value.').notEmpty()
], postAddPage);

// Sort pages function
function sortPages(ids) {
    const promises = ids.map(async (id, index) => {
        try {
            const page = await Page.findById(id);
            page.sorting = index + 1;
            await page.save();
        } catch (err) {
            console.error(err);
            throw err;
        }
    });

    return Promise.all(promises);
}

/*
 * POST reorder pages
 */
router.post('/reorder-pages', function (req, res) {
    const ids = req.body['id[]'];

    sortPages(ids)
        .then(() => Page.find({}).sort({ sorting: 1 }).exec())
        .then(pages => {
            req.app.locals.pages = pages;
            res.status(200).send('Reordered successfully');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Server error');
        });
});


/*
 * GET edit page
*/
router.get('/pages/edit-page/:id', isAdmin, getEditPage);

/*
 * POST edit page
*/
router.post('/pages/edit-page/:id', [
    check('title', 'Title must have a value.').notEmpty(),
    check('content', 'Content must have a value.').notEmpty()
], postEditPage);


/*
 * GET delete page
*/
router.get('/pages/delete-page/:id', isAdmin, deletePage);

//Exports
module.exports = router