const Category = require("../models/category");
const Product = require("../models/product");
const Subcategory = require("../models/subcategory");
const User = require("../models/user");
const Model = require("../models/model");
const cloudinary = require("../util/cloudinary");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

exports.postCart = async (req, res, next) => {
  try {
    const { userId } = req.session;
    const { productId } = req.body;
    const user = await User.findById(userId);
    const product = await Product.findById(productId);
    if (!user || !product) {
      return res
        .status(404)
        .json({ success: false, error: "User or Product not found" });
    }

    const result = await user.addToCart(product);
    const cart = result.cart.items;
    const productCart = [];
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      const product = await Product.findById(item.productId);
      productCart.push({ product, quantity: item.quantity });
    }
    res.json({ success: true, data: productCart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const { userId } = req.session;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const cart = user.cart.items;
    const productCart = [];
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      const product = await Product.findById(item.productId);
      productCart.push({ product, quantity: item.quantity });
    }
    res.json({ success: true, data: productCart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const { userId } = req.session;
    const { productId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const result = await user.removeFromCart(productId);
    const cart = result.cart.items;
    const productCart = [];
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      const product = await Product.findById(item.productId);
      productCart.push({ product, quantity: item.quantity });
    }
    res.json({ success: true, data: productCart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.removeOneFromCart = async (req, res, next) => {
  try {
    const { userId } = req.session;
    const { productId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const result = await user.removeOneFromCart(productId);
    const cart = result.cart.items;
    const productCart = [];
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      const product = await Product.findById(item.productId);
      productCart.push({ product, quantity: item.quantity });
    }
    res.json({ success: true, data: productCart });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.postProducts = async (req, res, next) => {
  try {
    const { subcategoryId } = req.body;
    console.log(subcategoryId);

    const products = await Product.find({ subcategoryId: subcategoryId });
    res.json({ success: true, products: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const categories = await Category.find({ type: "product" });
    res.json({ success: true, categories: categories });
  } catch (error) {
    console.error("Error in getCategory: ", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the request.",
    });
  }
};

exports.getDesignCategory = async (req, res, next) => {
  try {
    const categories = await Category.find({ type: "design" });
    console.log("GET DESIGN CATEGORY", categories);
    res.json({ success: true, categories: categories });
  } catch (error) {
    console.error("Error in getCategory: ", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the request.",
    });
  }
};

exports.getSubCategories = async (req, res, next) => {
  try {
    const { categoryId } = req.body;
    const subCategories = await Subcategory.find({ categoryId: categoryId });
    res.json({ success: true, subCategories: subCategories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getModels = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId;
    const models = await Model.find({ categoryId: categoryId });
    res.json({ success: true, models: models });
  } catch (error) {
    console.error("Error in getModels: ", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

exports.getAllModels = async (req, res, next) => {
  try {
    const models = await Model.find();
    res.json({ success: true, models: models });
  } catch (error) {
    console.error("Error in getModels: ", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

exports.saveModel = async (req, res) => {
  try {
    const modelFile = req.file;
    const { modelName, imageUrl } = req.body;
    const { userId } = req.session;
    console.log("USERID", userId);
    console.log("modelName", modelName);
    console.log("Image URL", imageUrl);
    if (!modelFile) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    console.log("Uploading to cloudinary...");

    cloudinary.uploader.upload_large(
      modelFile.path,
      { resource_type: "raw" },
      async function (error, result) {
        if (error) {
          console.error("Error saving model:", error);
          res.status(500).json({
            success: false,
            message: "Failed to save model",
            error: error.toString(),
          });
        } else {
          const user = await User.findById(userId);
          console.log("USER", user);
          console.log("RESULT", result);
          user.models.push({
            modelName,
            imageUrl,
            modelUrl: result.secure_url,
          });
          await user.save();

          res.json({
            success: true,
            message: "Model saved successfully",
            modelUrl: result.secure_url,
          });
        }
      }
    );
  } catch (error) {
    console.error("Error saving model:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save model",
      error: error.toString(),
    });
  }
};

// overwritemodel

const uploadWithRetry = async (filePath, options, maxAttempts = 3) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Attempt to upload the file
      return await cloudinary.uploader.upload(filePath, {
        ...options,
        timeout: 60000,
      });
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === maxAttempts) throw error;
    }
  }
};

exports.overwriteModel = async (req, res) => {
  try {
    console.log("REQ RECIVED = ", req.body);
    console.log("Uploaded file info:", req.file);
    const modelFile = req.file;
    const { publicId, modelId, modelName, imageUrl } = req.body;
    if (!modelFile) {
      return res
        .status(400)
        .json({ success: false, message: "No model file uploaded." });
    }

    cloudinary.uploader
      .destroy(publicId, { invalidate: true })
      .then((result) => console.log(result));

    const result = await uploadWithRetry(modelFile.path, {
      resource_type: "auto",
      invalidate: "true",
    });
    const userId = req.session.userId;
    const user = await User.findById(userId);
    console.log("USER MODEL", user.models.id(modelId));
    user.models.id(modelId).modelUrl = result.secure_url;
    user.models.id(modelId).modelName = modelName;
    user.models.id(modelId).imageUrl = imageUrl;
    user.save();

    res.json({ success: true, message: "Model Updated successfully" });
  } catch (error) {
    console.error("Error saving model:", error);
    res.status(500).json({ success: false, error: error.toString() });
  }
};

exports.getProductModels = async (req, res, next) => {
  try {
    let products;
    if (req.body.subcategoryId) {
      products = await Product.find({ subcategoryId: req.body.subcategoryId });
    } else {
      products = await Product.find({});
    }
    const filteredProducts = products.filter(
      (product) =>
        typeof product.modelUrl === "string" && product.modelUrl.length > 1
    );

    res.json({ success: true, data: filteredProducts });
  } catch (error) {
    console.error("Error in getProductModels: ", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

// getPaints
exports.getPaints = async (req, res, next) => {
  try {
    const categories = await Category.findOne({ categoryName: "Paints" });
    const subCategories = await Subcategory.find({
      categoryId: categories._id,
    });
    res.json({ success: true, categories, subCategories });
  } catch (error) {
    console.error("Error in getPaints: ", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

// getTiles
exports.getTiles = async (req, res, next) => {
  try {
    const categories = await Category.findOne({ categoryName: "Tiles" });
    const subCategories = await Subcategory.find({
      categoryId: categories._id,
    });
    res.json({ success: true, categories, subCategories });
  } catch (error) {
    console.error("Error in getTiles: ", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

// getWallpapers
exports.getWallpapers = async (req, res, next) => {
  try {
    const categories = await Category.findOne({ categoryName: "Wallpapers" });
    const subCategories = await Subcategory.find({
      categoryId: categories._id,
    });
    res.json({ success: true, categories, subCategories });
  } catch (error) {
    console.error("Error in getWallpapers: ", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};