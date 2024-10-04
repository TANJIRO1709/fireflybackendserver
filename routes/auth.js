const express = require("express");

const authController = require("../controllers/auth");

const { check, body } = require("express-validator");

const router = express.Router();

router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);

router.post("/signin",authController.postSignIn);

router.get("/user", authController.getUser);

router.get("/logout", authController.getLogout);

router.post("/googlesignin", authController.postGoogleSignin);

router.post("/likeproduct", authController.likeProduct);

module.exports = router;
