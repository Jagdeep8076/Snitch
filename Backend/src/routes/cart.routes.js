import express from 'express';
import { authenticateUser } from '../middleware/auth.middleware.js';
import {
    validateAddToCart,
    validateIncrementCartItemQuantity,
    validateUpdateCartItem,
    validateRemoveCartItem,
} from '../validator/cart.validator.js';
import {
    addToCart,
    createOrderController,
    getCart,
    incrementCartItemQuantity,
    updateCartItem,
    removeCartItem,
    clearCart,
    verifyPaymentController,
    verifyOrderController,
    paymentFailedController,
} from '../controllers/cart.controller.js';

const router = express.Router();

/**
 * @route GET /api/cart
 * @desc Get user's cart
 * @access Private
 */
router.get('/', authenticateUser, getCart);

/**
 * @route POST /api/cart/add/:productId/:variantId
 * @desc Add item to cart
 * @access Private
 */
router.post("/add/:productId/:variantId", authenticateUser, validateAddToCart, addToCart);

/**
 * @route PUT /api/cart/items/:itemId
 * @desc Update item quantity in cart
 * @access Private
 */
router.put("/items/:itemId", authenticateUser, validateUpdateCartItem, updateCartItem);

/**
 * @route DELETE /api/cart/items/:itemId
 * @desc Remove item from cart
 * @access Private
 */
router.delete("/items/:itemId", authenticateUser, validateRemoveCartItem, removeCartItem);

/**
 * @route DELETE /api/cart/clear
 * @desc Clear entire cart
 * @access Private
 */
router.delete("/clear", authenticateUser, clearCart);

/**
 * @route PATCH /api/cart/quantity/increment/:productId/:variantId
 * @desc Increment item quantity in cart by one
 * @access Private
 */
router.patch("/quantity/increment/:productId/:variantId", authenticateUser, validateIncrementCartItemQuantity, incrementCartItemQuantity);

/**
 * @route POST /api/cart/payment/create/order
 * @desc Initiate Razorpay order from cart
 * @access Private
 */
router.post("/payment/create/order", authenticateUser, createOrderController);

/**
 * @route POST /api/cart/payment/verify
 * @desc Verify Razorpay payment signature
 * @access Private
 */
router.post("/payment/verify", authenticateUser, verifyPaymentController);

/**
 * @route POST /api/cart/payment/verify/order
 * @desc Alias for verify payment
 * @access Private
 */
router.post("/payment/verify/order", authenticateUser, verifyOrderController);

/**
 * @route POST /api/cart/payment/failed
 * @desc Record payment failure
 * @access Private
 */
router.post("/payment/failed", authenticateUser, paymentFailedController);

export default router;
