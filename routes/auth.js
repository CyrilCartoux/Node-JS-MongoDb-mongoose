const express = require('express');

const router = express.Router();

const authController = require("./../controllers/auth");

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);
router.post("/login", authController.postLogin);
router.post("/logout", authController.postLogOut);
router.post("/signup", authController.postSignup);

module.exports = router;