const Product = require("../models/product");
const SubCategory = require("../models/subcategory");
const Category = require("../models/category");
const Admin = require("../models/admin");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const Subcategory = require("../models/subcategory");
const Model = require("../models/model");
const cloudinary = require("../util/cloudinary");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // This saves files to the 'uploads' folder

// admin/login => GET
exports.getLogin = async (req, res, next) => {
  let session = req.session.id;
  console.log("REQ SESSION =", req.session);
  if (req.session.isLoggedIn && req.session.post === "admin") {
    const user = await Admin.findById(req.session.userId);
    console.log("USER =>", user);
    res.json({
      success: true,
      user: { userName: user.userName, email: user.email, userId: user.id },
    });
  } else {
    res.json({ success: false, message: session });
  }
};

// admin/login => POST
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  Admin.findOne({ email: email })
    .then((admin) => {
      if (!admin) {
        return res.status(400).json({ message: "No Admin found" });
      }
      bcrypt
        .compare(password, admin.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.post = admin.post;
            req.session.userId = admin.id;
            req.session.userName = admin.userName;
            return req.session.save((err) => {
              if (err) {
                console.log(err);
                res.json({ success: false, message: err });
              } else {
                console.log("Session saved successfully", req.session);
                res.json({
                  success: true,
                  message: req.session.id,
                });
              }
            });
          }
          return res
            .status(401)
            .json({ success: false, message: "Wrong password" });
        })
        .catch((err) => {
          console.log(err);
          res.json({ success: false, message: err });
        });
    })
    .catch((err) => console.log(err));
};

// admin/signup => POST
exports.postSignup = (req, res, next) => {
  const userName = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res
      .status(422)
      .json({ success: false, message: errors.array()[0].msg });
  }
  Admin.findOne({ email: email })
    .then((result) => {
      if (result) {
        return res
          .status(400)
          .json({ success: false, message: "Admin already exists" });
      } else {
        return bcrypt.hash(password, 12).then((hashPassword) => {
          const admin = new Admin({
            userName: userName,
            email: email,
            password: hashPassword,
          });
          req.session.isLoggedIn = true;
          req.session.post = admin.post;
          req.session.userId = admin.id;
          req.session.userName = admin.userName;
          req.session.save((err) => {
            if (err) {
              console.log(err);
            } else {
              console.log("Session saved successfully", req.session);
            }
          });
          return admin.save().then((result) => {
            res.status(200).json({ success: true, message: "Admin Created" });
          });
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, message: err });
    });
};

// admin/logout => GET
exports.getLogout = (req, res, next) => {
  console.log("session => ", req.session);
  if (req.session) {
    let sessionInfo = { ...req.session };
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        res.json({ success: false, message: "Failed to destroy session" });
      } else {
        res.json({ success: true, message: sessionInfo });
      }
    });
  } else {
    res.json({ success: false, message: "No session to destroy" });
  }
};

//CATEGORY ROUTES
// admin/category => POST
exports.postCategory = async (req, res, next) => {
  try {
    const { categoryName, imageUrl, type } = req.body;
    console.log("req.body = ", req.body);
    console.log("categoryName:", categoryName);
    console.log("imageUrl:", imageUrl);
    console.log("type:", type);
    const categoryData = {
      categoryName: categoryName,
      imageUrl: imageUrl,
    };
    if (type !== undefined) {
      categoryData.type = type;
    }
    const category = new Category(categoryData);
    await category.save();
    res.status(200).json({ success: true, category: category });
  } catch (error) {
    console.error("Error in postCategory: ", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the request.",
    });
  }
};

// admin/category => GET
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

// admin/designcategory => GET
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

// admin/category:categoryId => PATCH
exports.patchCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }
    category.categoryName = req.body.categoryName || category.categoryName;
    category.imageUrl = req.body.imageUrl || category.imageUrl;
    category.type = req.body.type || category.type;

    await category.save();
    res.json({ success: true, category: category });
  } catch (error) {
    console.error("Error in patchCategory: ", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the request.",
    });
  }
};

// admin/category:categoryId => DELETE
exports.delCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;
  try {
    const result = await Category.findByIdAndRemove(categoryId);
    if (result?.type === "product") {
      await Subcategory.deleteMany({ categoryId: categoryId });
      await Product.deleteMany({ categoryId: categoryId });
    } else {
      await Model.deleteMany({ categoryId: categoryId });
    }
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error in delCategory: ", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

// SUB-CATEGORY ROUTES
// admin/subcategory=> POST
exports.postSubCategory = async (req, res, next) => {
  try {
    const { subcategoryName, imageUrl, categoryId } = req.body;
    console.log("categoryId:", categoryId);
    console.log("subcategoryName:", subcategoryName);
    console.log("imageUrl:", imageUrl);
    const subCategory = new SubCategory({
      categoryId: categoryId,
      subcategoryName: subcategoryName,
      imageUrl: imageUrl,
    });
    await subCategory.save();
    res.status(200).json({ success: true, subCategory: subCategory });
  } catch (error) {
    console.error("Error in postSubCategory: ", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

// admin/getsubcategory => POST
exports.getSubCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.body;
    const subCategories = await Subcategory.find({ categoryId: categoryId });
    res.json({ success: true, subCategories: subCategories });
  } catch (error) {
    console.error("Error in getSubCategory: ", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

exports.patchSubCategory = async (req, res, next) => {
  const subCategoryId = req.params.subcategoryId;
  try {
    const subCategory = await SubCategory.findById(subCategoryId);
    if (!subCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Sub Category not found." });
    }
    subCategory.subcategoryName =
      req.body.subcategoryName || subCategory.subcategoryName;
    subCategory.imageUrl = req.body.imageUrl || subCategory.imageUrl;
    await subCategory.save();
    res.json({ success: true, subCategory: subCategory });
  } catch (error) {
    console.error("Error in patchSubCategory: ", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

exports.delSubCategory = async (req, res, next) => {
  const subCategoryId = req.params.subcategoryId;
  try {
    const result = await SubCategory.findByIdAndRemove(subCategoryId);
    await Product.deleteMany({ subcategoryId: subCategoryId });
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Sub Category not found." });
    }
    res.json({ success: true, message: "Sub Category deleted successfully" });
  } catch (error) {
    console.error("Error in delSubCategory: ", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

//PRODUCT ROUTES
// admin/product => POST
exports.postProduct = async (req, res, next) => {
  try {
    const {
      subcategoryId,
      categoryId,
      productName,
      price,
      unit,
      imageUrl,
      modelUrl,
      textureUrl,
      additionalFields,
      description,
      constraints,
    } = req.body;
    console.log("subcategoryId:", subcategoryId);
    console.log("categoryId:", categoryId);
    console.log("creatorId:", req.session.userId);
    console.log("productName:", productName);
    console.log("price:", price);
    console.log("unit:", unit);
    console.log("imageUrl:", imageUrl);
    console.log("modelUrl:", modelUrl);
    console.log("textureUrl:", textureUrl);
    console.log("additionalFields:", additionalFields);
    console.log("description:", description);
    console.log("constraints:", constraints);

    const productData = {
      subcategoryId: subcategoryId,
      categoryId: categoryId,
      creatorId: req.session.userId,
      productName: productName,
      price: price,
      unit: unit,
      imageUrl: imageUrl,
      description: description,
      modelUrl: modelUrl,
      textureUrl: textureUrl,
      additionalFields: additionalFields,
      constraints: constraints,
    };

    const product = new Product(productData);

    await product.save();
    res.status(200).json({ success: true, product: product });
  } catch (error) {
    console.error("Error in postProduct: ", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const { subCategoryId } = req.body;
    const products = await Product.find({ subcategoryId: subCategoryId });
    res.json({ success: true, product: products }); // Already valid JSON response
  } catch (error) {
    console.error("Error in getProduct: ", error);
    res.status(500).json({ success: false, message: "An error occurred" }); // Changed to json
  }
};

exports.patchProduct = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." }); // Changed to json
    }
    product.creatorId = req.body.userId || product.creatorId;
    product.productName = req.body.productName || product.productName;
    product.price = req.body.price || product.price;
    product.currency = req.body.currency || product.currency;
    product.imageUrl = req.body.imageUrl || product.imageUrl;
    product.modelUrl = req.body.modelUrl || product.modelUrl;
    product.textureUrl = req.body.textureUrl || product.textureUrl;
    product.description = req.body.description || product.description;
    product.additionalFields =
      req.body.additionalFields || product.additionalFields;
    product.constraints = req.body.constraints || product.constraints;

    await product.save();
    res.json({ success: true, product: product }); // Already valid JSON response
  } catch (error) {
    console.error("Error in patchProduct: ", error);
    res.status(500).json({ success: false, message: "An error occurred" }); // Changed to json
  }
};

exports.delProduct = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    const result = await Product.findByIdAndRemove(productId);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in delProduct: ", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

// admin/productmodels  => GET
exports.getProductModels = async (req, res, next) => {
  try {
    const products = await Product.find({});
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

// MODEL
// admin/model => POST
exports.postModel = async (req, res, next) => {
  try {
    const { categoryId, imageUrl, modelUrl, modelName } = req.body;
    console.log("categoryId:", categoryId);
    console.log("creatorId:", req.session.userId);
    console.log("imageUrl:", imageUrl);
    console.log("modelUrl:", modelUrl);
    console.log("modelName:", modelName);

    const modelData = {
      categoryId: categoryId,
      creatorId: req.session.userId,
      imageUrl: imageUrl,
      modelUrl: modelUrl,
      modelName: modelName,
    };

    const model = new Model(modelData);

    await model.save();
    res.status(200).json({ success: true, model: model });
  } catch (error) {
    console.error("Error in postModel: ", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

// admin/model/:categoryId => GET
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

// admin/model/:modelId => PATCH
exports.patchModel = async (req, res, next) => {
  const modelId = req.params.modelId;
  try {
    const model = await Model.findById(modelId);
    if (!model) {
      return res
        .status(404)
        .json({ success: false, message: "Model not found." });
    }
    model.modelUrl = req.body.modelUrl || model.modelUrl;
    model.imageUrl = req.body.imageUrl || model.imageUrl;
    model.products = req.body.products || model.products;
    await model.save();
    res.json({ success: true, model: model });
  } catch (error) {
    console.error("Error in patchModel: ", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

// admin/model/:modelId => DELETE
exports.delModel = async (req, res, next) => {
  const modelId = req.params.modelId;
  try {
    const result = await Model.findByIdAndRemove(modelId);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Model not found." });
    }
    res.json({ success: true, message: "Model deleted successfully" });
  } catch (error) {
    console.error("Error in delModel: ", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

// admin/savemodel

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

exports.saveModel = async (req, res) => {
  try {
    console.log("REQ RECIVED = ", req.body);
    console.log("Uploaded file info:", req.file);
    const modelFile = req.file;
    const { publicId } = req.body;
    const { modelId } = req.body;
    if (!modelFile) {
      return res.status(400).send("No model file uploaded.");
    }

    cloudinary.uploader
      .destroy(publicId, { invalidate: true })
      .then((result) => console.log(result));

    const result = await uploadWithRetry(modelFile.path, {
      resource_type: "auto",
      invalidate: "true",
    });
    const model = await Model.findById(modelId);
    console.log("MODEL =>", model);
    console.log("RESULT =>", result);

    model.modelUrl = result.secure_url;
    await model.save();

    res.json({ message: "Model saved successfully", result });
  } catch (error) {
    console.error("Error saving model:", error);
    res
      .status(500)
      .json({ message: "Failed to save model", error: error.toString() });
  }
};
