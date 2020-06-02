const User = require("./../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
    console.log(req.session)
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: req.session.isLoggedIn
    });
}

exports.postLogin = (req, res, next) => {
    User.findById('5ed0dff41f49081c9c3d7872')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            // to avoid redirecting while the session is not fully loaded
            req.session.save((err) => {
                console.log(err)
                res.redirect("/")
            });

        })
        .catch(err => {
            console.log(err)
        })
};

exports.getSignup = (req, res, next) => {
    res.render("auth/signup", {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false
    })
}
exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    
    User.findOne({ email: email }).then(userData => {
        // user already exists ?
        if (userData) {
            console.log('already exists')
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
            res.redirect("/")
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