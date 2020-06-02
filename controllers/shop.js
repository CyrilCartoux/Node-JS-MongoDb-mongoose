const Product = require('../models/product');
const Order = require("./../models/order");

// /products page get all products
exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        isAuthenticated : req.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
    });
};

// get one product
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        isAuthenticated : req.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

// main page : load products
exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        isAuthenticated : req.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
    });
};

// // go to cart via nav
exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    // to return a promise 
    .execPopulate()
    .then(user => {
      const products = user.cart.items
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        isAuthenticated : req.isLoggedIn
      });
    })
    .catch(err => console.log(err));
}

// // add a product to cart when 'add to cart' clicked
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId).then(product => {
    return req.user.addToCart(product)
  }).then(result => {
    res.redirect('/cart');
  })
};

// // // delete product from cart
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

// create orders
exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    // to return a promise 
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: {...i.productId._doc} }
      })
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user
        },
        products: products
      })
      return order.save();
    })
    .then(() => {
      return req.user.clearCart();
    }).then(() => {
      res.redirect("/orders")
    })
    .catch(err => {
      console.log(err)
    })
}


exports.getOrders = (req, res, next) => {
  Order.find({"user.userId": req.user._id})
  .then(orders => {
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders,
      isAuthenticated : req.isLoggedIn
    });
  }).catch(err => {
    console.log(err);
  })
};
