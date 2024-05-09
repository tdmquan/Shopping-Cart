const { check, validationResult } = require('express-validator');
const fs = require('fs-extra')
const path = require('path')
const { mkdirp } = require('mkdirp')
const resizeImg = require('resize-img')

// Get Product model
var Product = require('../models/product')

// Get Category model
const Category = require('../models/category');

const showAllProducts = async (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('all_products', {
                title: 'All products',
                products: products
            })
        })
        .catch(err => {
            console.log(err)
        })
}
const getProductsByCategory = async (req, res, next) => {
    var categorySlug = req.params.category;

    Category.findOne({ slug: categorySlug })
        .then(c => {
            Product.find({ category: categorySlug })
                .then(products => {
                    res.render('cat_products', {
                        title: c.title,
                        products: products
                    })
                })
                .catch(err => {
                    console.log(err)
                })
        })
        .catch(err => {
            console.log(err)
        })
}
const getProductDetails = async (req, res, next) => {
    var galleryImages = null;
    var loggedIn = (req.isAuthenticated()) ? true : false;

    Product.findOne({ slug: req.params.products })
        .then(product => {
            const galleryDir = path.join(__dirname,'..','public/product_images/' + product._id + '/gallery');
            fs.readdir(galleryDir, function (err, files) {
                if (err) {
                    console.log(err)
                } else {
                    galleryImages = files;

                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages,
                        loggedIn: loggedIn
                    })
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Internal Server Error');
        });
}
const showProductsAdmin = async (req, res, next) => {
    var count;

    Promise.all([
        Product.countDocuments(),
        Product.find()
    ])
        .then(([c, products]) => {
            count = c;

            res.render('admin/products', {
                products: products,
                count: count
            });
        })
        .catch(err => {
            console.log(err);
        });
}
const getAddProduct = async (req, res, next) => {
    var title = ""
    var desc = ""
    var price = ""

    Category.find()
        .then(categories => {
            res.render('admin/add_product', {
                title: title,
                desc: desc,
                categories: categories,
                price: price
            })
        })
        .catch(err => {
            console.log(err)
        })
}
const postAddProduct = async (req, res, next) => {
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        Category.find()
            .then((categories) => {
                res.render('admin/add_product', {
                    errors: errors.array(),
                    title: title,
                    desc: desc,
                    categories: categories,
                    price: price
                });
            })
            .catch((err) => console.error(err));
    } else {
        Product.findOne({ slug: slug })
            .then((product) => {
                if (product) {
                    return Category.find();
                } else {
                    var price2 = parseFloat(price).toFixed(2);
                    var newProduct = new Product({
                        title: title,
                        slug: slug,
                        desc: desc,
                        price: price2,
                        category: category,
                        image: imageFile
                    });

                    return newProduct.save();
                }
            })
            .then((savedProduct) => {
                if (imageFile !== "") {
                    var productImage = req.files.image;
                    var imagePath = path.join(__dirname, '..', 'public/product_images/' + savedProduct._id + '/' + imageFile);

                    return mkdirp(path.join(__dirname, '..', 'public/product_images/' + savedProduct._id))
                        .then(() => mkdirp(path.join(__dirname, '..', 'public/product_images/' + savedProduct._id + '/gallery')))
                        .then(() => mkdirp(path.join(__dirname, '..', 'public/product_images/' + savedProduct._id + '/gallery/thumbs')))
                        .then(() => productImage.mv(imagePath))
                        .catch((err) => console.error(err));
                } else {
                    return Promise.resolve();
                }
            })
            .then(() => {
                res.redirect('/admin/products');
            })
            .catch((err) => console.error(err));
    }
}
const getEditProduct = async (req, res, next) => {
    let errors;

    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;

    let categories;

    Category.find()
        .then((result) => {
            categories = result;

            return Product.findById(req.params.id);
        })
        .then((p) => {
            const galleryDir = path.join(__dirname, '..', 'public/product_images/' + p._id + '/gallery');

            return fs.promises.readdir(galleryDir)
                .then((files) => {
                    const galleryImages = files;

                    res.render('admin/edit_product', {
                        title: p.title,
                        errors: errors,
                        desc: p.desc,
                        categories: categories,
                        category: p.category.replace(/\s+/g, '-').toLowerCase(),
                        price: p.price,
                        image: p.image,
                        galleryImages: galleryImages,
                        id: p._id
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.redirect('/admin/products');
                });
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/admin/products');
        });
}
const postEditProduct = async (req, res, next) => {
    const imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    const title = req.body.title;
    const slug = title.replace(/\s+/g, '-').toLowerCase();
    const desc = req.body.desc;
    const price = req.body.price;
    const category = req.body.category;
    const pimage = req.body.pimage;
    const id = req.params.id;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.session.errors = errors.array();
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({ slug: slug, _id: { '$ne': id } })
            .then((p) => {
                if (p) {
                    res.redirect('/admin/products/edit-product/' + id);
                } else {
                    return Product.findById(id);
                }
            })
            .then((p) => {
                p.title = title;
                p.slug = slug;
                p.desc = desc;
                p.price = parseFloat(price).toFixed(2);
                p.category = category;
                if (imageFile !== "") {
                    p.image = imageFile;
                }

                return p.save();
            })
            .then(() => {
                if (imageFile !== "" && pimage !== "") {
                    return fs.remove(path.join(__dirname, '..', 'public/product_images/' + id + '/' + pimage));
                } else {
                    return Promise.resolve();
                }
            })
            .then(() => {
                if (imageFile !== "") {
                    const productImage = req.files.image;
                    const imagePath = path.join(__dirname, '..', 'public/product_images/' + id + '/' + imageFile);

                    return productImage.mv(imagePath);
                } else {
                    return Promise.resolve();
                }
            })
            .then(() => {
                res.redirect('/admin/products/edit-product/' + id);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Internal Server Error');
            });
    }
}
const postProductGallery = async (req, res, next) => {
    var productImage = req.files.file;
    var id = req.params.id;
    var pathGallery = path.join(__dirname, '..', 'public/product_images/' + id + '/gallery/' + req.files.file.name);
    var thumbsPath = path.join(__dirname, '..', 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name);
    productImage.mv(pathGallery, function (err) {
        if (err)
            console.log(err);

        resizeImg(fs.readFileSync(pathGallery), { width: 100, height: 100 })
            .then(buf => {
                fs.writeFileSync(thumbsPath, buf);
            })
            .catch(err => {
                console.log(err);
            })
    })

    res.sendStatus(200)
}
const deleteImage = async (req, res, next) => {
    var originalImage = path.join(__dirname, '..', 'public/product_images/' + req.query.id + '/gallery/' + req.params.image);
    var thumbsImage = path.join(__dirname, '..', 'public/product_images/' + req.query.id + '/gallery/thumbs' + req.params.image);

    fs.remove(originalImage, function (err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbsImage, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect('/admin/products/edit-product/' + req.query.id)
                }
            })
        }
    })
}
const deleteProduct = async (req, res, next) => {
    const id = req.params.id;
    const path = 'public/product_images/' + id;

    fs.remove(path)
        .then(() => {
            return Product.findByIdAndDelete(id);
        })
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
}

module.exports = {
    showAllProducts,
    getProductsByCategory,
    getProductDetails,
    showProductsAdmin,
    getAddProduct,
    postAddProduct,
    getEditProduct,
    postEditProduct,
    postProductGallery,
    deleteImage,
    deleteProduct
}