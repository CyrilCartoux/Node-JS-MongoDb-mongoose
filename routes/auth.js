const express = require('express');

const router = express.Router();
const User = require("./../models/user")

const authController = require("./../controllers/auth");

const { check, body } = require("express-validator/check")

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);
router.get("/reset", authController.getReset)
router.get("/reset/:token", authController.getNewPassword);

router.post("/reset", authController.postReset)
router.post("/login", authController.postLogin);
router.post("/logout", authController.postLogOut);
router.post(
    '/signup',
    [
      check('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
          return User.findOne({ email: value }).then(userDoc => {
            if (userDoc) {
              return Promise.reject(
                'E-Mail exists already, please pick a different one.'
              );
            }
          });
        }),
      body(
        'password',
        'Please enter a password with at least 5 characters.'
      )
        .isLength({ min: 5 }),
      body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true;
      })
    ],
    authController.postSignup
  );
router.post("/new-password", authController.postNewPassword)

module.exports = router;