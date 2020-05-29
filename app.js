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
// app.use((req, res, next) => {
//   User.findById("5ece8cb7a00f1de49b918cc2")
//     .then(user => {
//       req.user = new User(user.name, user.email, user.cart, mongodb.ObjectId(user._id));
//       console.log(req.user)
//       next();
//     })
//     .catch(err => console.log(err));
// });

// app routes 
app.use('/admin', adminRoutes);
app.use(shopRoutes);
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