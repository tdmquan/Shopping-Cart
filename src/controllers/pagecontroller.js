// Get Page model
const { check, validationResult } = require('express-validator');
var Page = require('../models/page')

const showHomePageUser = async (req, res, next) => {
    Page.findOne({ slug: 'home' })
        .then(page => {
            res.render('index', {

                title: page.title,
                content: page.content
            })
        })
        .catch(err => {
            console.log(err)
        })
}
const showAPageUser = async (req, res, next) => {
    var slug = req.params.slug;

    Page.findOne({ slug: slug })
        .then(page => {
            if (!page) {
                res.redirect('/');
            } else {
                res.render('index', {
                    title: page.title,
                    content: page.content
                });
            }
        })
        .catch(err => {
            console.log(err);
        });
}
const showPageAdmin = async (req, res, next) => {
    Page.find({}).sort({ sorting: 1 })
        .then(function (pages) {
            res.render('admin/pages', {
                pages: pages
            });
        })
        .catch(function (err) {
            console.error(err);
            res.status(500).send('Lỗi server');
        });
}
const getAddPage = async (req, res, next) => {
    var title = ""
    var slug = ""
    var content = ""

    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    })
}
const postAddPage = async (req, res, next) => {
    const title = req.body.title;
    const slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug === "") slug = title.replace(/\s+/g, '-').toLowerCase();
    const content = req.body.content;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('admin/add_page', {
            errors: errors.array(),
            title: title,
            slug: slug,
            content: content
        });
    } else {
        Page.findOne({ slug: slug })
            .then(page => {
                if (page) {
                    res.render('admin/add_page', {
                        title: title,
                        slug: slug,
                        content: content
                    });
                } else {
                    var newPage = new Page({
                        title: title,
                        slug: slug,
                        content: content,
                        sorting: 100
                    });

                    return newPage.save();
                }
            })
            .then(() => {
                Page.find({}).sort({ sorting: 1 })
                    .then(function (pages) {
                        req.app.locals.pages = pages;
                    })
                    .catch(function (err) {
                        console.error(err);
                        res.status(500).send('Lỗi server');
                    });
                res.redirect('/admin/pages');
            })
            .catch(err => {
                console.log(err);
            });
    }
}
const getEditPage = async (req, res, next) => {
    Page.findById(req.params.id)
        .then(page => {
            res.render('admin/edit_page', {
                title: page.title,
                slug: page.slug,
                content: page.content,
                id: page._id
            });
        })
        .catch(err => {
            console.log(err);
        });
}
const postEditPage = async (req, res, next) => {
    const title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug === "") slug = title.replace(/\s+/g, '-').toLowerCase();
    const content = req.body.content;
    const id = req.params.id;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('admin/edit_page', {
            errors: errors.array(),
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else {
        Page.findOne({ slug: slug, _id: { $ne: id } })
            .then(page => {
                if (page) {
                    res.render('admin/edit_page', {
                        title: title,
                        slug: slug,
                        content: content,
                        id: id
                    });
                } else {
                    return Page.findById(id);
                }
            })
            .then(page => {
                if (!page) {
                    throw new Error('Page not found');
                }
                page.title = title;
                page.slug = slug;
                page.content = content;
                return page.save();
            })
            .then(() => {
                Page.find({}).sort({ sorting: 1 })
                    .then(function (pages) {
                        req.app.locals.pages = pages;
                    })
                    .catch(function (err) {
                        console.error(err);
                        res.status(500).send('Lỗi server');
                    });
                res.redirect('/admin/pages/edit-page/' + id);
            })
            .catch(err => {
                console.log(err);
            });
    }
}
const deletePage = async (req, res, next) => {
    Page.findByIdAndDelete(req.params.id)
        .then(() => {
            Page.find({}).sort({ sorting: 1 })
                .then(function (pages) {
                    req.app.locals.pages = pages;
                })
                .catch(function (err) {
                    console.error(err);
                    res.status(500).send('Lỗi server');
                });
            res.redirect('/admin/pages/');
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports = {
    showHomePageUser,
    showAPageUser,
    showPageAdmin,
    getAddPage,
    postAddPage, 
    getEditPage, 
    postEditPage, 
    deletePage
}