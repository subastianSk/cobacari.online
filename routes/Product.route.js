const express = require("express");
const {
    uploadMultiple
} = require("../middlewares/uploads")
const {
    createProduct,
    getAllProduct,
    editProduct,
    deleteProduct,
    getProductById
} = require("../controllers/product");

const router = express.Router();

router.route("/createpoduct").post(uploadMultiple, createProduct)
router.route("/getAll").get(getAllProduct)
router.route("/get/:id").get(getProductById)
router.route("/edit/:id").put(editProduct)
router.route("/delete/:id").delete(deleteProduct)

module.exports = router;