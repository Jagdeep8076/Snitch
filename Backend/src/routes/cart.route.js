import express from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import {
    ValidateAddToCart,
    ValidateUpdateCartItem,
    ValidateRemoveCartItem,
} from "../validator/cart.validator.js";
import {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    createOrderController,
    verifyPaymentController,
    paymentFailedController,
} from "../controllers/cart.controller.js";

const router = express.Router();

// GET /api/cart — fetch user's cart
router.get("/", authenticateUser, getCart);

// POST /api/cart/add/:productId/:variantId — add item
router.post(
    "/add/:productId/:variantId",
    authenticateUser,
    ValidateAddToCart,
    addToCart
);

// PUT /api/cart/items/:itemId — update quantity
router.put(
    "/items/:itemId",
    authenticateUser,
    ValidateUpdateCartItem,
    updateCartItem
);

// DELETE /api/cart/items/:itemId — remove a single item
router.delete(
    "/items/:itemId",
    authenticateUser,
    ValidateRemoveCartItem,
    removeCartItem
);

// DELETE /api/cart/clear — clear entire cart
router.delete("/clear", authenticateUser, clearCart);

// Payment flow routes
router.post("/payment/create/order", authenticateUser, createOrderController);
router.post("/payment/verify", authenticateUser, verifyPaymentController);
router.post("/payment/failed", authenticateUser, paymentFailedController);

export default router;