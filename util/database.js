const mongoose = require("mongoose")
const password = encodeURIComponent(process.env.MONGO_PASSWORD);
const connexionString = 'mongodb+srv://6ssou:'+ password +'@cluster0-kkpzf.gcp.mongodb.net/shop?retryWrites=true&w=majority';
const db = () => { 
  return mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${password}@cluster0-kkpzf.gcp.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`, 
  { useNewUrlParser: true, useUnifiedTopology: true }) 
}
const nodemailer = require("nodemailer");
const privateKey = process.env.STRIPE_KEY;

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'martindurandnordvpn@gmail.com',
    pass: process.env.MAIL_PASSWORD
  }
});

exports.db = db;
exports.connexionString = connexionString
exports.transporter = transporter;
exports.privateKey = privateKey