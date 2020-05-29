const Product = require('../models/product');

// /products page get all products
exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      console.log(products)
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
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
      console.log(product)
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
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
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

// // go to cart via nav
exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then(products => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
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
// exports.postCartDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   req.user
//     .deleteItemFromCart(prodId)
//     .then(result => {
//       res.redirect('/cart');
//     })
//     .catch(err => console.log(err));
// };

// exports.postOrder = (req, res, next) => {
//   let fetchedCart;
//   req.user.addOrder()
//     .then((result) => {
//       res.redirect("/orders")
//     })
//     .catch(err => {
//       console.log(err)
//     })
// }


// exports.getOrders = (req, res, next) => {
  
//   req.user.getOrders()
//   .then(orders => {
//     res.render('shop/orders', {
//       path: '/orders',
//       pageTitle: 'Your Orders',
//       orders: orders
//     });
//   }).catch(err => {
//     console.log(err);
//   })
// };


// exports.getCheckout = (req, res, next) => {
//   res.render('shop/checkout', {
//     path: '/checkout',
//     pageTitle: 'Checkout'
//   });
// };
