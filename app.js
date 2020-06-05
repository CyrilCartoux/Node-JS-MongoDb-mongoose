// Express
const express = require('express');
const app = express();

// Csurf 
const csrf = require('csurf')
// Flash
const flash = require("connect-flash");

// Session 
const session = require('express-session');

// Store
const mongoDBStore = require("connect-mongodb-session")(session);
const MONGODB_URI = require("./util/database").connexionString;
const store = new mongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

// Sessions 
app.use(session({
  secret: 'we are all satoshi',
  resave: false,
  saveUninitialized: false,
  store: store
}));

// csrfProtection
const csrfProtection = csrf();

// path 
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Body parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

// Other imports
const db = require("./util/database").db;
// 404
const errorController = require('./controllers/error');
const User = require("./models/user")
// routes 
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth')

app.use(csrfProtection);
app.use(flash());

// view engine : EJS
app.set('view engine', 'ejs');
app.set('views', 'views');

// Get user 
app.use((req, res, next) => {
  if(!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user
      next();
    })
    .catch(err => console.log(err));
});

// add isAuthenticated and csrf token to all request
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken()
  next();
});

// app routes 
app.use('/admin', adminRoutes);
app.use(shopRoutes);
// auth routes 
app.use(authRoutes);
// 404 route
app.use(errorController.get404);

// Database connexion
db().then(result => {
  app.listen(3000)
  console.log('connected!')
})
.catch(err => {
  console.log(err)
})