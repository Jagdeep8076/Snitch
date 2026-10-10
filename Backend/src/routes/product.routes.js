import express from "express"
import { authenticateSeller } from "../middleware/auth.middleware.js";
import { createProduct, getAllProducts, getSellerProducts , getProductDetails,addProductVariant, updateVariantStock, updateProductBasePrice, updateVariantPrice } from "../controllers/product.controller.js";
import multer from "multer"
import { createProductValidator } from "../validator/product.validator.js";


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
})

const router = express.Router();


router.post("/", authenticateSeller, upload.array("images", 7), createProductValidator, createProduct)


router.get("/seller", authenticateSeller,getSellerProducts )



router.get("/",getAllProducts)


router.get("/detail/:id", getProductDetails)

/**
 * @route post /api/products/:productId/variants
 * @description Add a new variant to a product
 * @access Private (Seller only)
 */
router.post("/:productId/variants", authenticateSeller, upload.array('images', 7), addProductVariant)

/**
 * @route put /api/products/:productId/variants/:variantId/stock
 * @description Update stock of a variant
 * @access Private (Seller only)
 */
router.put("/:productId/variants/:variantId/stock", authenticateSeller, updateVariantStock);

/**
 * @route put /api/products/:productId/price
 * @description Update base price of a product
 * @access Private (Seller only)
 */
router.put("/:productId/price", authenticateSeller, updateProductBasePrice);

/**
 * @route put /api/products/:productId/variants/:variantId/price
 * @description Update price of a variant
 * @access Private (Seller only)
 */
router.put("/:productId/variants/:variantId/price", authenticateSeller, updateVariantPrice);

export default router;