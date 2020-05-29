const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// to connect the model to a name
module.exports = mongoose.model('Product', productSchema);

// const mongodb = require("mongodb")
// const getDb = require("../util/database").getDb;

// class Product {
//   constructor(title, price, imageUrl, description, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.imageUrl = imageUrl;
//     this.description = description;
//     this._id = id;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbOperation;
//     if (this._id) {
//       // update the product
//       dbOperation = db.collection("products").updateOne(
//         { _id: new mongodb.ObjectId(this._id) }, {$set: this}
//       )
//     } else {
//       // insert it
//       dbOperation = db.collection('products').insertOne(this)
//     }
//     return dbOperation
//       .then(result => {
//       })
//       .catch(err => {
//         console.log(err)
//       });
//   }

//   static fetchAll() {
//     const db = getDb();
//     // find returns a cursor
//     return db.collection('products')
//       .find()
//       .toArray()
//       .then(products => {
//         return products;
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }

//   static findById(prodId) {
//     const db = getDb();
//     return db.collection('products')
//       // because id are stored differently
//       .find({ _id: mongodb.ObjectID(prodId) })
//       // next to get the last document returned by find()
//       .next()
//       .then(product => {
//         return product;
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }
//   static deleteById(prodId) {
//     const db = getDb();
//     return db.collection("products").deleteOne({_id: mongodb.ObjectId(prodId)})
//     .then(() => {
//       console.log("removed")
//     })
//   }
// }

// module.exports = Product;
