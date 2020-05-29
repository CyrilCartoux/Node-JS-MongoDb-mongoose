const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cart: {
    items: [{
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }]
  }
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    // or update the new one
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    })
  }

  // no products in the cart 
  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save();
}

module.exports = mongoose.model("User", userSchema)

// class User {
//   constructor(username, email, cart, id) {
//     this.username = username;
//     this.email = email;
//     this.cart = cart; // {items: []}
//     this._id = id;
//   }
//   save() {
//     const db = getDb();
//     return db.collection("users").insertOne(this);
//   }

//   addToCart(product) {
//     const cartProductIndex = this.cart.items.findIndex(cp => {
//       return cp.productId.toString() === product._id.toString();
//     });
//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];

//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       // or update the new one
//       updatedCartItems.push({
//         productId: mongodb.ObjectId(product._id),
//         quantity: newQuantity
//       })
//     }

//     // no products in the cart 
//     const updatedCart = {
//       items: updatedCartItems
//     };
//     const db = getDb();
//     return db
//       .collection('users')
//       .updateOne(
//         { _id: mongodb.ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   getCart() {
//     const db = getDb();
//     const productIds = this.cart.items.map(i => {
//       return i.productId;
//     });
//     return db.collection("products")
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then(products => {
//         return products.map(p => {
//           return {
//             ...p,
//             quantity: this.cart.items.find(i => {
//               return i.productId.toString() === p._id.toString()
//             }).quantity
//           }
//         })
//       });
//   }

//   deleteItemFromCart(prodId) {
//     const updatedCartItems = this.cart.items.filter(item => {
//       return item.productId.toString() !== prodId.toString();
//     });
//     const db = getDb();
//     return db.collection("users").updateOne(
//       { _id: mongodb.ObjectId(this._id) },
//       { $set: { cart: { items: updatedCartItems } } })
//   }

//   static findById(userId) {
//     const db = getDb()
//     return db.collection("users").find({ _id: new mongodb.ObjectId(userId) })
//       .next()
//       .then((user) => {
//         return user
//       })
//       .catch(err => { console.log(err) })
//   }

//   addOrder() {
//     const db = getDb();
//     return this.getCart()
//       .then(products => {
//         const order = {
//           items: products,
//           user: {
//             _id: mongodb.ObjectId(this._id),
//             name: this.username
//           }
//         }
//         return db.collection("orders")
//           .insertOne(order)
//       })
//       .then(() => {
//         // clear cart from user object
//         this.cart = { items: [] }
//         return db.collection("users").updateOne(
//           { _id: mongodb.ObjectId(this._id) },
//           // clear cart from database
//           { $set: { cart: { items: [] } } })
//       })
//   }

//   getOrders() {
//     const db = getDb();
//     return db.collection("orders")
//     // we can access nested data here :
//     .find({'user._id': mongodb.ObjectId(this._id)})
//     .toArray() 
//   }

// }

// module.exports = User;