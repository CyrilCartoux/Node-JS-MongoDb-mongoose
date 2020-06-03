const User = require("./../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
    let message = req.flash("error")
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message
    });
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then(user => {

            if (!user) {
                // key, value
                req.flash('error', 'Invalid email or password')
                console.log('does not exists')
                return res.redirect("/login")
            }
            //bcrypt returns a promise 
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        // password valid
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        // to avoid redirecting while the session is not fully loaded
                        return req.session.save((err) => {
                            console.log("signed in")
                            res.redirect("/")
                        });
                    } else {
                        req.flash('error', 'Invalid email or password')
                        res.redirect("/login")
                    }
                })
                .catch(err => {
                    console.log(err)
                    res.redirect("/login")
                })
        })
        .catch(err => {
            console.log(err)
        })
};

exports.getSignup = (req, res, next) => {
    let message = req.flash("error")
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null;
    }

    res.render("auth/signup", {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message
    })
}
exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User.findOne({ email: email }).then(userData => {
        // user already exists ?
        if (userData) {
            req.flash('error', 'User already exists')
            return res.redirect("/signup");
        }
        // create the user
        return bcrypt.hash(password, 12)
            .then((hashedPassword) => {
                const user = new User({
                    email: email,
                    password: hashedPassword,
                    cart: {
                        items: []
                    }
                })
                return user.save()
            })
            .then(() => {
                console.log("user created!")
                res.redirect("/login")
            })
    }).catch(err => {
        console.log(err)
    })
}

exports.postLogOut = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err)
        res.redirect("/");
    })
}