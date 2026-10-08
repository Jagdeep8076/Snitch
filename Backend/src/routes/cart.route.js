import express from "express"
import { authenticateUser } from "../middleware/auth.middleware.js";
import { ValidateAddToCart } from "../validator/cart.validator.js";
import { addToCart, getCart, updateCartItem, removeCartItem, clearCart } from "../controllers/cart.controller.js";


const router = express.Router();

// GET /api/cart  — fetch user's cart
router.get("/", authenticateUser, getCart)

// POST /api/cart/add/:productId/:variantId — add item
router.post("/add/:productId/:variantId", authenticateUser, ValidateAddToCart, addToCart)

// PUT /api/cart/items/:itemId — update quantity
router.put("/items/:itemId", authenticateUser, updateCartItem)

// DELETE /api/cart/items/:itemId — remove a single item
router.delete("/items/:itemId", authenticateUser, removeCartItem)

// DELETE /api/cart/clear — clear entire cart
router.delete("/clear", authenticateUser, clearCart)

export default router