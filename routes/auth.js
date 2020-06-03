const express = require('express');

const router = express.Router();

const authController = require("./../controllers/auth");

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);
router.get("/reset", authController.getReset)
router.get("/reset/:token", authController.getNewPassword);

router.post("/reset", authController.postReset)
router.post("/login", authController.postLogin);
router.post("/logout", authController.postLogOut);
router.post("/signup", authController.postSignup);
router.post("/new-password", authController.postNewPassword)

module.exports = router;