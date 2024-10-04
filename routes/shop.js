const express = require("express");
const shopController = require("../controllers/shop");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const router = express.Router();

// get cart
router.get("/cart", shopController.getCart);

// add to cart
router.post("/cart", shopController.postCart);

// remove from cart
router.delete("/cart", shopController.removeFromCart);

// remove one from cart
router.delete("/removeonefromcart", shopController.removeOneFromCart);

// Get products
router.post("/products", shopController.postProducts);
router.get("/productmodels", shopController.getProductModels);

// get categories
router.get("/categories", shopController.getCategory);

// get design categories
router.get("/designcategory", shopController.getDesignCategory);

// get sub categories
router.post("/subcategories", shopController.getSubCategories);

// get models
router.get("/models/:categoryId", shopController.getModels);
router.get("/allmodels", shopController.getAllModels);

// save model
router.post("/savemodel", upload.single("model"), shopController.saveModel);
router.post(
  "/overwritemodel",
  upload.single("model"),
  shopController.overwriteModel
);

//getPaints
router.get("/paints", shopController.getPaints);

//getTiles
router.get("/tiles", shopController.getTiles);

//getWallpapers
router.get("/wallpapers", shopController.getWallpapers);

// place order
// get orders

module.exports = router;
