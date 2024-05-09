// Get Page model
const { check, validationResult } = require('express-validator');
const Category = require('../models/category');

const showCategories = async (req, res, next) => {
    Category.find({}).sort({ sorting: 1 })
        .then(function (categories) {
            res.render('admin/categories', {
                categories: categories
            });
        })
        .catch(function (err) {
            console.error(err);
            res.status(500).send('Lỗi server');
        });
}
const getAddCategory = async (req, res, next) => {
    var title = ""

    res.render('admin/add_category', {
        title: title
    })
}
const postAddCategory = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('admin/add_category', {
            errors: errors.array(),
            title: req.body.title
        });
    } else {
        const title = req.body.title;
        const slug = title.replace(/\s+/g, '-').toLowerCase();

        Category.findOne({ slug: slug })
            .then(category => {
                if (category) {
                    // alert('danger', 'Category slug exists, choose another.');
                    res.render('admin/add_category', {
                        title: title
                    });
                } else {
                    var newCategory = new Category({
                        title: title,
                        slug: slug
                    });

                    return newCategory.save();
                }
            })
            .then(() => {
                Category.find()
                    .then(function (categories) {
                        req.app.locals.categories = categories;
                    })
                    .catch(function (err) {
                        console.error(err);
                        res.status(500).send('Lỗi server');
                    });
                // alert('success', 'Page added');
                res.redirect('/admin/categories');
            })
            .catch(err => {
                console.log(err);
            });
    }
}
const getEditCategory = async (req, res, next) => {
    Category.findById(req.params.id)
        .then(category => {
            res.render('admin/edit_category', {
                title: category.title,
                slug: category.slug,
                id: category._id
            });
        })
        .catch(err => {
            console.log(err);
        });
}
const postEditCategory = async (req, res, next) => {
    const title = req.body.title;
    let slug = title.replace(/\s+/g, '-').toLowerCase();
    const id = req.params.id;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('admin/edit_category', {
            errors: errors.array(),
            title: title,
            id: id
        });
    } else {
        Category.findOne({ slug: slug, _id: { $ne: id } })
            .then(category => {
                if (category) {
                    res.render('admin/edit_category', {
                        title: title,
                        id: id
                    });
                } else {
                    return Category.findById(id);
                }
            })
            .then(category => {
                if (!category) {
                    throw new Error('Category not found');
                }
                category.title = title;
                category.slug = slug;
                return category.save();
            })
            .then(() => {
                Category.find()
                    .then(function (categories) {
                        req.app.locals.categories = categories;
                    })
                    .catch(function (err) {
                        console.error(err);
                        res.status(500).send('Lỗi server');
                    });
                res.redirect('/admin/categories/edit-category/' + id);
            })
            .catch(err => {
                console.log(err);
            });
    }
}
const deleteCategory = async (req, res, next) => {
    Category.findByIdAndDelete(req.params.id)
        .then(() => {
            Category.find()
                .then(function (categories) {
                    req.app.locals.categories = categories;
                })
                .catch(function (err) {
                    console.error(err);
                    res.status(500).send('Lỗi server');
                });
            res.redirect('/admin/categories/');
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports = {
    showCategories,
    getAddCategory,
    postAddCategory, 
    getEditCategory, 
    postEditCategory, 
    deleteCategory
}