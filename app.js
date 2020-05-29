// Express
const express = require('express');
const app = express();
// MongoDb
const mongodb = require('mongodb')
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

// view engine : EJS
app.set('view engine', 'ejs');
app.set('views', 'views');

// Get user 
app.use((req, res, next) => {
  User.findById("5ed0dff41f49081c9c3d7872")
    .then(user => {
      req.user = user
      console.log(req.user)
      next();
    })
    .catch(err => console.log(err));
});

// app routes 
app.use('/admin', adminRoutes);
app.use(shopRoutes);
// 404 not found
app.use(errorController.get404);

// Database connexion
db().then(result => {
  User.findOne().then(user => {
    if(!user) {
      const user = new User({
        name: 'Satoshi',
        email: 'satoshi@gmx.com',
        cart: {
          items: []
        }
      });
      user.save();
    }
  })
  app.listen(3000)
  console.log('connected!')
})
.catch(err => {
  console.log(err)
})