const Product = require('../models/product');
const Order = require("./../models/order");
const fs = require("fs")
const path = require("path")
const PDFDocument = require("pdfkit")
// objects stored by page 
const ITEMS_PER_PAGE = 3;

// /products page get all products
exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage : page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
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
        path: '/products'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};

// main page : load products
exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage : page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
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
        products: products
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
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
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};

// create orders
exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    // to return a promise 
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } }
      })
      const order = new Order({
        user: {
          email: req.user.email,
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    })
}


exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    })
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      console.log(order.user[0].userId)
      console.log(req.user._id)
      if (!order) {
        console.log('no orders')
        return next(new Error("no order found"))
      }
      if (order.user[0].userId.toString() !== req.user._id.toString()) {
        console.log('unauthorized')
        return next(new Error("unauthorized"));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName)
      // generate PDF 
      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", 'application/pdf')
      res.setHeader("Content-Disposition", 'inline; filename="' + invoiceName + '"');
      pdfDoc.pipe(fs.createWriteStream(invoicePath))
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice - ", {
        underline: true
      })
      pdfDoc.fontSize(18).text("Order n* " + orderId);
      pdfDoc.text("---------------------------------------");
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += (prod.quantity * prod.product.price)
        pdfDoc.fontSize(14).text(`(${prod.quantity})  ${prod.product.title}  -  $${prod.product.price}`);
      });
      pdfDoc.fontSize(14).text("---------------------------------------");
      pdfDoc.fontSize(18).text(`Total : $${totalPrice}`)
      pdfDoc.end();
    })
    .catch(err => {
      console.log(err)
      return next(err)
    })
}