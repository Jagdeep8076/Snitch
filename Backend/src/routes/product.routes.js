import express from 'express';
import { authenticateSeller } from '../middleware/auth.middleware.js';
import {
    createProduct,
    getAllProducts,
    getSellerProducts,
    getProductDetails,
    addProductVariant,
    updateVariantStock,
    updateProductBasePrice,
    updateVariantPrice
} from '../controllers/product.controller.js';
import multer from "multer";
import { createProductValidator } from '../validator/product.validator.js';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});

const router = express.Router();

/**
 * @route POST /api/products
 * @description Create a new product
 * @access Private (Seller only)
 */
router.post("/", authenticateSeller, upload.array('images', 7), createProductValidator, createProduct);

/** 
 * @route GET /api/products/seller
 * @description Get all products of the authenticated seller
 * @access Private (Seller only)
 */
router.get("/seller", authenticateSeller, getSellerProducts);

/**
 * @route GET /api/products
 * @description Get all products
 * @access Public
 */
router.get("/", getAllProducts);

/**
 * @route GET /api/products/detail/:id
 * @description Get product details by ID
 * @access Public
 */
router.get("/detail/:id", getProductDetails);

/**
 * @route POST /api/products/:productId/variants
 * @description Add a new variant to a product
 * @access Private (Seller only)
 */
router.post("/:productId/variants", authenticateSeller, upload.array('images', 7), addProductVariant);

/**
 * @route PUT /api/products/:productId/variants/:variantId/stock
 * @description Update stock of a variant
 * @access Private (Seller only)
 */
router.put("/:productId/variants/:variantId/stock", authenticateSeller, updateVariantStock);

/**
 * @route PUT /api/products/:productId/price
 * @description Update base price of a product
 * @access Private (Seller only)
 */
router.put("/:productId/price", authenticateSeller, updateProductBasePrice);

/**
 * @route PUT /api/products/:productId/variants/:variantId/price
 * @description Update price of a variant
 * @access Private (Seller only)
 */
router.put("/:productId/variants/:variantId/price", authenticateSeller, updateVariantPrice);

export default router;