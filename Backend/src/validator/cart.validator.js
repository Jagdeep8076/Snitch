import mongoose from "mongoose";
import { param, body, validationResult } from "express-validator";

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const validateAddToCart = [
    param("productId").isMongoId().withMessage("Invalid product ID"),
    param("variantId").custom((value) => {
        if (!value || value === "none" || value === "undefined" || mongoose.Types.ObjectId.isValid(value)) {
            return true;
        }
        throw new Error("Invalid variant ID");
    }),
    body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    validateRequest
];

export const ValidateAddToCart = validateAddToCart;

export const validateIncrementCartItemQuantity = [
    param("productId").isMongoId().withMessage("Invalid product ID"),
    param("variantId").optional().custom((value) => {
        if (!value || value === "none" || value === "undefined" || mongoose.Types.ObjectId.isValid(value)) {
            return true;
        }
        throw new Error("Invalid variant ID");
    }),
    validateRequest
];

export const ValidateIncrementCartItemQuantity = validateIncrementCartItemQuantity;

export const validateUpdateCartItem = [
    param("itemId").isMongoId().withMessage("Invalid item ID"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be a positive integer"),
    validateRequest
];

export const ValidateUpdateCartItem = validateUpdateCartItem;

export const validateRemoveCartItem = [
    param("itemId").isMongoId().withMessage("Invalid item ID"),
    validateRequest
];

export const ValidateRemoveCartItem = validateRemoveCartItem;