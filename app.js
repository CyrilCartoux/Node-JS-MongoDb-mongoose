// Express
const express = require('express');
const app = express();

// MongoDb
const mongodb = require('mongodb')

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

// path 
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Body parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

// Other imports
const db = require("./util/database").db;
const errorController = require('./controllers/error');
const User = require("./models/user")
// routes 
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth')

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

// app routes 
app.use('/admin', adminRoutes);
app.use(shopRoutes);
// auth routes 
app.use(authRoutes);
// 404 not found
app.use(errorController.get404);

// Database connexion
db().then(result => {
  app.listen(3000)
  console.log('connected!')
})
.catch(err => {
  console.log(err)
})