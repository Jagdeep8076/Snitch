import { body, validationResult } from "express-validator";

function validateRequest(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0]?.msg || "Validation error",
            errors: errors.array(),
        });
    }

    next();
}

export const validateRegisterUser = [
    body("fullname")
        .trim()
        .notEmpty()
        .withMessage("Full name is required")
        .isLength({ min: 2, max: 60 })
        .withMessage("Full name must be between 2 and 60 characters"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

    body("confirmPassword")
        .optional()
        .custom((value, { req }) => {
            if (value && value !== req.body.password) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),

    body("contact")
        .optional({ checkFalsy: true })
        .trim()
        .matches(/^\d{10}$/)
        .withMessage("Contact must be a 10-digit number"),

    body("isSeller")
        .optional()
        .isBoolean()
        .withMessage("isSeller must be a boolean value"),

    body("address")
        .optional({ checkFalsy: true })
        .trim(),

    body("city")
        .optional({ checkFalsy: true })
        .trim(),

    body("state")
        .optional({ checkFalsy: true })
        .trim(),

    body("pincode")
        .optional({ checkFalsy: true })
        .trim()
        .matches(/^\d{6}$/)
        .withMessage("Pincode must be a 6-digit number"),

    validateRequest,
];

export const validateLoginUser = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),

    validateRequest,
];

export const validateVerifyEmail = [
    body("token")
        .trim()
        .notEmpty()
        .withMessage("Verification token is required"),

    validateRequest,
];

export const validateResendVerification = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail(),

    validateRequest,
];