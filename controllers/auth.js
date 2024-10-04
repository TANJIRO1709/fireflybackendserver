// const bcrypt = require("bcryptjs");
// const User = require("../models/user");
// const { validationResult } = require("express-validator");
// require("dotenv").config();

// exports.getLogin = (req, res, next) => {
//   let session = req.session.id;
//   console.log("Request session in getLogin", req.session);
//   res.json({ success: req.session.isLoggedIn, message: session });
// };

// exports.getUser = (req, res, next) => {
//   let session = req.session.id;
//   console.log("Request session in getUser", req.session);
//   if (session) {
//     User.findById(req.session.userId)
//       .then((user) => {
//         if (user) {
//           res.json({
//             success: true,
//             user: {
//               userName: user.userName,
//               email: user.email,
//               cart: user.cart,
//               likedProducts: user.likedProducts,
//               models: user.models,
//             },
//           });
//         } else {
//           res.json({ success: false, message: "No user Found" });
//         }
//       })
//       .catch((err) => {
//         console.log(err);
//         res.json({ success: false, message: err.toString() });
//       });
//   } else {
//     res.json({ success: false, message: "No session found" });
//   }
// };

// exports.postGoogleSignin = async (req, res, next) => {
//   try {
//     console.log("LOGGING IN TO GOOGLE");
//     const { name: userName, email, password } = req.body;
//     let user = await User.findOne({ email: email });
//     if (!user) {
//       const hashPassword = await bcrypt.hash(password, 12);
//       user = new User({
//         userName,
//         email,
//         password: hashPassword,
//         cart: { items: [] },
//       });
//       await user.save();
//       console.log({ success: true, message: "User Created" });
//     }
//     req.session.isLoggedIn = true;
//     req.session.userId = user.id;
//     console.log("SAVING SESSION");
//     await req.session.save();
//     console.log("Session saved successfully", req.session);
//     res.json({ success: true, message: "Session saved successfully" });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ success: false, message: err.toString() });
//   }
// };

// exports.postLogin = async (req, res, next) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email: email });
//     if (!user) {
//       return res.status(400).json({ success: false, message: "No user found" });
//     }
//     const doMatch = await bcrypt.compare(password, user.password);
//     if (doMatch) {
//       req.session.isLoggedIn = true;
//       req.session.userId = user.id;
//       await req.session.save();
//       console.log("Session saved successfully", req.session);
//       res.json({ success: true, message: "Logged in successfully" });
//     } else {
//       res.status(401).json({ success: false, message: "Wrong password" });
//     }
//   } catch (err) {
//     console.log(err);
//     res.json({ success: false, message: err.toString() });
//   }
// };

// exports.postSignIn = async (req, res, next) => {
//   const { email, password, name: userName } = req.body;
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     console.log(errors.array());
//     return res
//       .status(422)
//       .json({ success: false, message: errors.array()[0].msg });
//   }
//   try {
//     let user = await User.findOne({ email: email });
//     if (user) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Email already exists" });
//     }
//     const hashPassword = await bcrypt.hash(password, 12);
//     user = new User({
//       userName,
//       email,
//       password: hashPassword,
//       cart: { items: [] },
//     });
//     req.session.isLoggedIn = true;
//     req.session.userId = user.id;
//     await req.session.save();
//     await user.save();
//     res.status(200).json({ success: true, message: "User Created" });
//   } catch (err) {
//     console.log(err);
//     res.json({ success: false, message: err.toString() });
//   }
// };

// exports.getLogout = (req, res, next) => {
//   if (req.session) {
//     req.session.destroy((err) => {
//       if (err) {
//         res.json({ success: false, message: err.toString() });
//       } else {
//         res.json({ success: true, message: "Logged out successfully" });
//       }
//     });
//   }
// };

// exports.likeProduct = async (req, res, next) => {
//   try {
//     const { productId, like } = req.body;
//     const update = like
//       ? { $addToSet: { likedProducts: productId } }
//       : { $pull: { likedProducts: productId } };
//     const user = await User.findByIdAndUpdate(req.session.userId, update, {
//       new: true,
//     });
//     await user.save();
//     res.json({ success: true, user });
//   } catch (err) {
//     res.json({ success: false, message: err.toString() });
//   }
// };
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

exports.getUser = (req, res, next) => {
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
        res.status(404).json({ success: false, message: "User not found" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
      });
  } else {
    res.status(401).json({ success: false, message: "Unauthorized access" });
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
