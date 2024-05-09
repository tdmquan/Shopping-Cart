const passport = require('passport');
var bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

// Get Users model
var Users = require('../models/user')

const getRegister =  async (req, res, next) => {
    res.render('register', {
        title: 'Register'
    })
}

const postRegister = async (req, res, next) => {
    const { name, email, username, password, password2 } = req.body;

    Promise.all([
        body('name').notEmpty().withMessage('Name is required!').run(req),
        body('email').isEmail().withMessage('Email is required!').run(req),
        body('username').notEmpty().withMessage('Username is required!').run(req),
        body('password').notEmpty().withMessage('Password is required!').run(req),
        body('password2').equals(password).withMessage('Passwords do not match!').run(req),
    ])
        .then(() => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                res.render('register', {
                    errors: errors.array(),
                    user: null,
                    title: 'Register',
                });
            } else {
                Users.findOne({ username })
                    .then((user) => {
                        if (user) {
                            res.redirect('/users/register');
                        } else {
                            const newUser = new Users({
                                name,
                                email,
                                username,
                                password,
                                admin: 0,
                            });

                            bcrypt.genSalt(10)
                                .then((salt) => bcrypt.hash(newUser.password, salt))
                                .then((hash) => {
                                    newUser.password = hash;
                                    return newUser.save();
                                })
                                .then(() => {
                                    res.redirect('/users/login');
                                })
                                .catch((err) => {
                                    console.error(err);
                                });
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
}

const getLogin = async (req, res, next) => {
    if (res.locals.user) res.redirect('/');
    
    res.render('login', {
        title: 'Login'
    })
}

const postLogin = async (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: 'login',
        failureFlash: true
    })(req, res, next);
}

const getLogout = async (req, res, next) => {
    req.logout(function(err) {
        if(err) {
            console.error(err);
            return res.redirect('/');
        }
        res.redirect('/users/login');
    });
}

module.exports = {
    getRegister,
    postRegister,
    getLogin,
    postLogin,
    getLogout
}