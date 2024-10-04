const adminController = require("../controllers/admin");
const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const router = express.Router();
//ADMIN
//get login state of admin
router.get("/login", adminController.getLogin);

// login for admin
router.post("/login", adminController.postLogin);

// Creating new admin
router.post("/signup", adminController.postSignup); // Close thi route when no more admis are required

//Log out admin
router.get("/logout", adminController.getLogout);

//Category
//Create
router.post("/category", adminController.postCategory);

//Read
router.get("/category", adminController.getCategory);
router.get("/designcategory", adminController.getDesignCategory);

//Update
router.patch("/category/:categoryId", adminController.patchCategory);

//Delete
router.delete("/category/:categoryId", adminController.delCategory);

//Sub-Category
//Create
router.post("/subcategory", adminController.postSubCategory);

//Read
router.post("/getsubcategory", adminController.getSubCategory);

//Update
router.patch("/subcategory/:subcategoryId", adminController.patchSubCategory);

//Delete
router.delete("/subcategory/:subcategoryId", adminController.delSubCategory);

//Product
//Create
router.post("/product", adminController.postProduct);

//Read
router.post("/getproduct", adminController.getProduct);
router.get("/productmodels", adminController.getProductModels);

//Update
router.patch("/product/:productId", adminController.patchProduct);

//Delete
router.delete("/product/:productId", adminController.delProduct);

//Models
//Create
router.post("/model", adminController.postModel);

//Read
// router.post('/getmodel/', adminController.getModel);
router.get("/models/:categoryId", adminController.getModels);

//Update
router.patch("/model/:modelId", adminController.patchModel);
router.post("/savemodel", upload.single("model"), adminController.saveModel);

//Delete
router.delete("/model/:modelId", adminController.delModel);

module.exports = router;
