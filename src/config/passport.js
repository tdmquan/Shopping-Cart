var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var bcrypt = require('bcryptjs');

module.exports = function(passport) {
    passport.use(new LocalStrategy(function (username, password, done){

        User.findOne({username: username})
            .then(user => {
                if(!user) {
                    return done(null, false, {message: 'No user found'});
                }
    
                bcrypt.compare(password, user.password, function(err, isMatch) {
                    if(err) console.log(err);
    
                    if(isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, {message: 'Wrong password.'})
                    }
                })
            })
            .catch(err =>{
                console.log(err);
            })
        }))
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    })

    passport.deserializeUser(function(id, done) {
        User.findById(id)
            .then(user => {
                done(null, user);
            })
            .catch(err => {
                done(err, null);
            });
    });    

}


