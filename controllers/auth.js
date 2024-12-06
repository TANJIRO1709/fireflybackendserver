const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { validationResult } = require("express-validator");
require("dotenv").config();

exports.getLogin = (req, res, next) => {
  if (req.session) {
    console.log("Request session in getLogin", req.session);
    return res.json({ success: req.session.isLoggedIn, message: req.session.id });
  }
  res.json({ success: false, message: "No session found" });
};

exports.getUser = (req, res, next) => {//very important part not to include req and res object in response object
  if (req.session && req.session.userId) {
    User.findById(req.session.userId)
      .then((user) => {
        if (user) {
          return res.json({
            success: true,
            user: {
              userName: user.userName,
              email: user.email,
              cart: user.cart,
              likedProducts: user.likedProducts,
              models: user.models,
            },
          });
        }
        res.status(404).json({
          success: false,
          message: "User not found",
          session: req.session ? { userId: req.session.userId } : null,
        });
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        res.status(500).json({
          success: false,
          message: "Internal Server Error",
        });
      });
  } else {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
      session: req.session ? { userId: req.session.userId } : null,
    });
  }
};

exports.postGoogleSignin = async (req, res, next) => {
  try {
    const { name: userName, email, password } = req.body;
    let user = await User.findOne({ email: email });
    if (!user) {
      const hashPassword = await bcrypt.hash(password, 12);
      user = new User({
        userName,
        email,
        password: hashPassword,
        cart: { items: [] },
      });
      await user.save();
      console.log("User Created");
    }
    req.session.isLoggedIn = true;
    req.session.userId = user.id;
    await req.session.save();
    console.log("Session saved successfully", req.session);
    res.json({ success: true, message: "Logged in successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No user found" });
    }
    const doMatch = await bcrypt.compare(password, user.password);
    if (doMatch) {
      req.session.isLoggedIn = true;
      req.session.userId = user.id;
      await req.session.save();
      console.log("Session saved successfully", req.session);
      res.json({ success: true, message: "Logged in successfully" });
    } else {
      res.status(401).json({ success: false, message: "Incorrect password" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.postSignIn = async (req, res, next) => {
  const { email, password, name: userName } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, message: errors.array()[0].msg });
  }
  try {
    let user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    const hashPassword = await bcrypt.hash(password, 12);
    user = new User({
      userName,
      email,
      password: hashPassword,
      cart: { items: [] },
    });
    await user.save();
    req.session.isLoggedIn = true;
    req.session.userId = user.id;
    await req.session.save();
    res.status(201).json({ success: true, message: "User Created" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.getLogout = (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Failed to log out" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  } else {
    res.status(400).json({ success: false, message: "No session to destroy" });
  }
};

exports.likeProduct = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const { productId, like } = req.body;
    const update = like
      ? { $addToSet: { likedProducts: productId } }
      : { $pull: { likedProducts: productId } };
    const user = await User.findByIdAndUpdate(req.session.userId, update, { new: true });
    if (user) {
      await user.save();
      return res.json({ success: true, user });
    }
    res.status(404).json({ success: false, message: "User not found" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
