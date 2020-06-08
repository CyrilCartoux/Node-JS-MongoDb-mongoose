const express = require('express');
const adminController = require('../controllers/admin');
const router = express.Router();
const isAuth = require("./../middleware/is-auth");
const { body } = require("express-validator/check");

router.get('/add-product', isAuth, adminController.getAddProduct);
router.get('/products', adminController.getProducts);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/add-product',
    [
        body("title")
            .isLength({ min: 3 })
            .withMessage("Title must be larger than 3 characters")
            .trim(),
        body("price")
            .isFloat(),
        body("description")
            .isLength({ min: 5, max: 355 })
            .trim()
    ],
    isAuth, adminController.postAddProduct);
router.post('/edit-product',
    [
        body("title")
            .isLength({ min: 3 })
            .withMessage("Title must be larger than 3 characters")
            .trim(),
        body("price")
            .isFloat()
            .withMessage('Please enter price with cents (00.00$)'),
        body("description")
            .isLength({ min: 5, max: 355 })
            .withMessage("Please enter a description (min length 5)")
            .trim()
    ],
    isAuth, adminController.postEditProduct);
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
