const User = require("./../models/user");

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
            res.redirect('/');
        })
        .catch(err => {
            console.log(err)
        })
};

exports.postLogOut = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err)
        res.redirect("/");
    })
}