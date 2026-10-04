import { param, body, validationResult } from "express-validator";

const ValidateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    next();
};

export const ValidateAddToCart = [
    param("productId")
        .isMongoId()
        .withMessage("Invalid productID"),

    param("variantId")
        .isMongoId()
        .withMessage("Invalid variantID"),

    body("quantity")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1"),

    ValidateRequest
];