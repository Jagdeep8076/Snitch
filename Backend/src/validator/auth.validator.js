import { body, validationResult } from "express-validator";

function validateRequest(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    next();
}

export const validateRegisterUser = [
    body("fullname")
        .trim()
        .notEmpty()
        .withMessage("Full name is required")
        .isLength({ min: 3, max: 50 })
        .withMessage("Full name must be between 3 and 50 characters"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format"),

    body("contact")
        .trim()
        .notEmpty()
        .withMessage("Contact is required")
        .matches(/^\d{10}$/)
        .withMessage("Contact must be a 10-digit number"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

    body("role")
        .notEmpty()
        .withMessage("Role is required")
        .isIn(["buyer", "seller"])
        .withMessage("Role must be either buyer or seller"),

    body("address")
        .trim()
        .notEmpty()
        .withMessage("Address is required"),

    body("city")
        .trim()
        .notEmpty()
        .withMessage("City is required"),

    body("state")
        .trim()
        .notEmpty()
        .withMessage("State is required"),

    body("pincode")
        .trim()
        .notEmpty()
        .withMessage("Pincode is required")
        .matches(/^\d{6}$/)
        .withMessage("Pincode must be a 6-digit number"),

    body("isSeller")
        .notEmpty()
        .withMessage("isSeller is required")
        .isBoolean()
        .withMessage("isSeller must be a boolean value"),

    validateRequest
];
