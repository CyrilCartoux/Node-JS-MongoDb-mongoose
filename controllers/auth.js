const User = require("./../models/user");
const bcrypt = require("bcryptjs");
const transporter = require("./../util/database").transporter;
const crypto = require("crypto")
const { validationResult } = require("express-validator/check")

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message,
        oldInput: {
            email: ''
        },
        validationErrors: []
    });
};


exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).render("auth/login", {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email
            },
            validationErrors: errors.array()
        })
    }

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(422).render("auth/login", {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password.',
                    oldInput: {
                        email: email
                    },
                    validationErrors: []
                })
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    return res.status(422).render("auth/login", {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Invalid email or password.',
                        oldInput: {
                            email: email
                        },
                        validationErrors: []
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
        })
        .catch(err => console.log(err));
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message,
        oldInput: {
            email: null,
            password: null
        },
        validationErrors: []
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("auth/signup", {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        })
    }


    bcrypt.hash(password, 12)
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
            //send mail : 
            var mailOptions = {
                from: 'shop@nodejs-shop.com',
                to: email,
                subject: 'Account created successfully !!',
                html: '<h1>Welcome onboard !</h1> <br> <h3>Thanks for creating your account</h3>'
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            res.redirect("/login")
        })
}

exports.postLogOut = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err)
        res.redirect("/");
    })
}

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
            return res.redirect("/reset")
        }
        // create a token
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                // no user : return 
                if (!user) {
                    req.flash('error', 'No account with that email found.');
                    return res.redirect("/reset")
                }
                // if user : set token and save
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            // user has been save with token
            .then(() => {
                res.redirect("/")
                // mail options
                var mailOptions = {
                    from: 'shop@nodejs-shop.com',
                    to: req.body.email,
                    subject: 'Reset your password',
                    html: `<h1>Reset your password !</h1> 
                        <br> 
                        <p>Click this link to reset your password : <a href="http://localhost:3000/reset/${token}">Reset my password</a></p>
                        <p>Warning ! This link will only be available for 1 hour</p>`
                };
                // send the mail
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            })
            .catch(err => {
                console.log(err)
            })
    })
}

exports.getNewPassword = (req, res, next) => {

    const token = req.params.token;
    // $gt stands for greater than
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then((user) => {
            let message = req.flash('error');
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }

            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'Create new Password',
                errorMessage: message,
                userId: user._id.toString(),
                token: token
            });
        })
        .catch(err => {
            console.log(err)
        })


}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const token = req.body.token;
    let resetUser;

    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12)
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetToken = undefined;
            return resetUser.save();
        })
        .then(() => {
            res.redirect("/login")
        })
        .catch(err => {
            console.log(err)
        })
}