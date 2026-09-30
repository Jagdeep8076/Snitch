import express from "express"
import { authenticateSeller } from "../middleware/auth.middleware.js";
import { createProduct, getAllProducts, getSellerProducts , getProductDetails,addProductVariant } from "../controllers/product.controller.js";
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

export default router;