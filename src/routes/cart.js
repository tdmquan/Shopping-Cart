const express = require('express')
const router = express.Router()

// Get Product model
var Product = require('../models/product')

/*
 * GET add product to cart
 */
router.get('/cart/add/:product', function (req, res) {

    var slug = req.params.product;

    Product.findOne({ slug: slug })
        .then((p) => {
            if (!p) {
                throw new Error('Product not found');
            }

            if (typeof req.session.cart === 'undefined') {
                req.session.cart = [];
                req.session.cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image
                });
            } else {
                var cart = req.session.cart;
                var newItem = true;

                for (var i = 0; i < cart.length; i++) {
                    if (cart[i].title === slug) {
                        cart[i].qty++;
                        newItem = false;
                        break;
                    }
                }

                if (newItem) {
                    cart.push({
                        title: slug,
                        qty: 1,
                        price: parseFloat(p.price).toFixed(2),
                        image: '/product_images/' + p._id + '/' + p.image
                    });
                }
            }
            res.redirect('back');
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
})

/*
 * GET checkout page
 */
router.get('/cart/checkout', function (req, res) {

    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout')
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart
        })
    }
});

/*
 * GET update product
 */
router.get('/cart/update/:product', function (req, res) {

    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty < 1) cart.splice(i, 1);
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0) delete req.session.cart;
                    break;
                default:
                    console.log('update problem')
                    break;
            }
            break;
        }
    }

    res.redirect('/cart/checkout')

});

/*
 * GET clear cart
 */
router.get('/cart/clear', function (req, res) {

    delete req.session.cart;
    res.redirect('/cart/checkout')
});

/*
 * GET buy now
 */
router.get('/cart/buynow', function (req, res) {

    delete req.session.cart;

    res.sendStatus(200)
});

//Exports
module.exports = router