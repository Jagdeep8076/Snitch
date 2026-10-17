import mongoose from "mongoose";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import orderModel from "../models/order.model.js";
import paymentModel from "../models/payment.model.js";
import { stockOfVariant } from "../dao/product.dao.js";
import { getCartDetails } from "../dao/cart.dao.js";
import { createOrder, verifyPaymentSignature } from "../services/payment.service.js";
import { config } from "../config/config.js";

/**
 * Helper to fetch formatted cart details for a user.
 */
export const fetchCartResponse = async (userId) => {
    return await getCartDetails(userId);
};

/**
 * Add product/variant to user's cart.
 */
export const addToCart = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
            });
        }

        const { productId, variantId } = req.params;
        const { quantity = 1 } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID",
                success: false,
            });
        }

        const parsedQty = Number(quantity);
        if (!Number.isInteger(parsedQty) || parsedQty < 1) {
            return res.status(400).json({
                message: "Quantity must be a positive integer",
                success: false,
            });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                success: false,
            });
        }

        const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
        let selectedVariantId = null;
        let variantObj = null;

        if (hasVariants && variantId && variantId !== "none" && variantId !== "undefined") {
            variantObj = product.variants.find((v) => v._id.toString() === variantId.toString());
            if (!variantObj) {
                return res.status(404).json({
                    message: "Selected variant not found",
                    success: false,
                });
            }
            selectedVariantId = variantObj._id;
        } else if (hasVariants) {
            variantObj = product.variants[0];
            selectedVariantId = variantObj._id;
        }

        const stock = variantObj ? Number(variantObj.stock ?? 0) : 999;
        if (stock <= 0) {
            return res.status(400).json({
                message: "This item is currently out of stock",
                success: false,
            });
        }

        const itemPrice = (variantObj?.price && variantObj.price.amount != null)
            ? variantObj.price
            : product.price;

        if (!itemPrice || itemPrice.amount == null) {
            return res.status(400).json({
                message: "Product price is not configured properly",
                success: false,
            });
        }

        let cart = await cartModel.findOne({ user: req.user._id });
        if (!cart) {
            cart = await cartModel.create({
                user: req.user._id,
                items: [],
            });
        }

        const existingItem = cart.items.find((item) => {
            const matchesProduct = item.product.toString() === productId.toString();
            if (!matchesProduct) return false;
            if (!selectedVariantId && !item.variant) return true;
            return String(item.variant) === String(selectedVariantId);
        });

        if (existingItem) {
            if (existingItem.quantity + parsedQty > stock) {
                return res.status(400).json({
                    message: `Only ${stock} items are available in stock. You already have ${existingItem.quantity} items in your cart`,
                    success: false,
                });
            }

            existingItem.quantity += parsedQty;
            existingItem.price = {
                amount: itemPrice.amount,
                currency: itemPrice.currency || "INR",
                mrp: itemPrice.mrp ?? null,
            };
        } else {
            if (parsedQty > stock) {
                return res.status(400).json({
                    message: `Only ${stock} items are available in stock`,
                    success: false,
                });
            }

            cart.items.push({
                product: productId,
                variant: selectedVariantId,
                quantity: parsedQty,
                price: {
                    amount: itemPrice.amount,
                    currency: itemPrice.currency || "INR",
                    mrp: itemPrice.mrp ?? null,
                },
            });
        }

        await cart.save();

        const populatedCart = await fetchCartResponse(req.user._id);

        return res.status(200).json({
            message: "Product added to cart successfully",
            success: true,
            cart: populatedCart,
        });
    } catch (error) {
        console.error("ADD TO CART ERROR:", error);
        return res.status(500).json({
            message: error.message || "Failed to add to cart",
            success: false,
        });
    }
};

/**
 * Get current user's cart.
 */
export const getCart = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
            });
        }

        const formattedCart = await fetchCartResponse(req.user._id);

        return res.status(200).json({
            message: formattedCart.items.length === 0 ? "Cart is empty" : "Cart fetched successfully",
            success: true,
            cart: formattedCart,
        });
    } catch (error) {
        console.error("GET CART ERROR:", error);
        return res.status(500).json({
            message: error.message || "Failed to get cart",
            success: false,
        });
    }
};

/**
 * Increment quantity of a specific product+variant by 1.
 */
export const incrementCartItemQuantity = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
            });
        }

        const { productId, variantId } = req.params;

        const cart = await cartModel.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
                success: false,
            });
        }

        const item = cart.items.find((i) => {
            const matchesProduct = i.product.toString() === productId.toString();
            if (!matchesProduct) return false;
            if ((!variantId || variantId === "none") && !i.variant) return true;
            return String(i.variant) === String(variantId);
        });

        if (!item) {
            return res.status(404).json({
                message: "Cart item not found",
                success: false,
            });
        }

        const stock = await stockOfVariant(productId, item.variant ? item.variant.toString() : "none");
        if (item.quantity + 1 > stock) {
            return res.status(400).json({
                message: `Only ${stock} items left in stock. and you already have ${item.quantity} items in your cart`,
                success: false,
            });
        }

        item.quantity += 1;
        await cart.save();

        const populatedCart = await fetchCartResponse(req.user._id);

        return res.status(200).json({
            message: "Cart item quantity incremented successfully",
            success: true,
            cart: populatedCart,
        });
    } catch (error) {
        console.error("INCREMENT CART ITEM ERROR:", error);
        return res.status(500).json({
            message: error.message || "Failed to increment cart item",
            success: false,
        });
    }
};

/**
 * Update quantity of a specific cart item by its _id.
 */
export const updateCartItem = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
            });
        }

        const { itemId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({
                message: "Invalid cart item ID",
                success: false,
            });
        }

        const parsedQty = Number(quantity);
        if (!Number.isInteger(parsedQty) || parsedQty < 1) {
            return res.status(400).json({
                message: "Quantity must be a positive integer",
                success: false,
            });
        }

        const cart = await cartModel.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
                success: false,
            });
        }

        const cartItem = cart.items.find((item) => item._id.toString() === itemId.toString());
        if (!cartItem) {
            return res.status(404).json({
                message: "Cart item not found",
                success: false,
            });
        }

        const stock = await stockOfVariant(
            cartItem.product.toString(),
            cartItem.variant ? cartItem.variant.toString() : "none"
        );

        if (parsedQty > stock) {
            return res.status(400).json({
                message: `Only ${stock} items available in stock`,
                success: false,
            });
        }

        cartItem.quantity = parsedQty;
        await cart.save();

        const populatedCart = await fetchCartResponse(req.user._id);

        return res.status(200).json({
            message: "Cart updated successfully",
            success: true,
            cart: populatedCart,
        });
    } catch (error) {
        console.error("UPDATE CART ERROR:", error);
        return res.status(500).json({
            message: error.message || "Failed to update cart",
            success: false,
        });
    }
};

/**
 * Remove a single item from user's cart by item _id.
 */
export const removeCartItem = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
            });
        }

        const { itemId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({
                message: "Invalid cart item ID",
                success: false,
            });
        }

        const cart = await cartModel.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
                success: false,
            });
        }

        const itemExists = cart.items.some((item) => item._id.toString() === itemId.toString());
        if (!itemExists) {
            return res.status(404).json({
                message: "Cart item not found",
                success: false,
            });
        }

        cart.items = cart.items.filter((item) => item._id.toString() !== itemId.toString());
        await cart.save();

        const populatedCart = await fetchCartResponse(req.user._id);

        return res.status(200).json({
            message: "Item removed from cart successfully",
            success: true,
            cart: populatedCart,
        });
    } catch (error) {
        console.error("REMOVE CART ITEM ERROR:", error);
        return res.status(500).json({
            message: error.message || "Failed to remove cart item",
            success: false,
        });
    }
};

/**
 * Clear all items from user's cart.
 */
export const clearCart = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
            });
        }

        const cart = await cartModel.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }

        return res.status(200).json({
            message: "Cart cleared successfully",
            success: true,
            cart: {
                user: req.user._id,
                items: [],
                totalPrice: 0,
                currency: "INR",
            },
        });
    } catch (error) {
        console.error("CLEAR CART ERROR:", error);
        return res.status(500).json({
            message: error.message || "Failed to clear cart",
            success: false,
        });
    }
};

/**
 * Creates a Razorpay order from the user's cart.
 */
export const createOrderController = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const userId = req.user._id;
        const { shippingAddress } = req.body || {};

        const cart = await cartModel.findOne({ user: userId });
        if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty. Please add items to checkout.",
            });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const product = await productModel.findById(item.product);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "One of the products in your cart is no longer available.",
                });
            }

            const variantIdStr = String(item.variant?._id || item.variant || "");
            const variant = Array.isArray(product.variants)
                ? product.variants.find((v) => String(v._id) === variantIdStr)
                : null;

            const requestedQty = Math.max(1, Number(item.quantity) || 1);
            const currentStock = variant ? Number(variant.stock ?? 0) : 999;
            if (currentStock < requestedQty) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${currentStock} item(s) available in stock for "${product.title}". Please reduce quantity.`,
                });
            }

            const effectivePrice = (variant?.price && variant.price.amount != null)
                ? variant.price
                : (product.price || { amount: 0, currency: "INR" });

            const unitAmount = Number(effectivePrice.amount) || 0;
            if (unitAmount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid price configured for "${product.title}".`,
                });
            }

            const itemSubtotal = unitAmount * requestedQty;
            totalAmount += itemSubtotal;

            orderItems.push({
                product: product._id,
                variant: variant ? variant._id : undefined,
                selectedVariant: variant ? {
                    _id: variant._id,
                    attributes: variant.attributes,
                    stock: variant.stock,
                    price: effectivePrice,
                } : undefined,
                title: product.title,
                quantity: requestedQty,
                price: {
                    amount: unitAmount,
                    currency: effectivePrice.currency || "INR",
                    mrp: effectivePrice.mrp ?? null,
                },
                subtotal: itemSubtotal,
            });
        }

        if (totalAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Cart total must be greater than zero.",
            });
        }

        const razorpayOrder = await createOrder({
            amount: totalAmount,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: {
                userId: String(userId),
                userEmail: req.user.email || "",
            },
        });

        const resolvedAddress = {
            fullname: shippingAddress?.fullname?.trim() || req.user.fullname || "Customer",
            contact: shippingAddress?.contact?.trim() || req.user.contact || "",
            address: shippingAddress?.address?.trim() || req.user.address || "Main Address",
            city: shippingAddress?.city?.trim() || req.user.city || "City",
            state: shippingAddress?.state?.trim() || req.user.state || "State",
            pincode: shippingAddress?.pincode?.trim() || req.user.pincode || "110001",
        };

        const newOrder = await orderModel.create({
            user: userId,
            items: orderItems,
            totalAmount,
            currency: "INR",
            shippingAddress: resolvedAddress,
            paymentStatus: "pending",
            orderStatus: "created",
            razorpayOrderId: razorpayOrder.id,
        });

        // Also save in paymentModel for compatibility
        try {
            await paymentModel.create({
                user: userId,
                razorpay: {
                    orderId: razorpayOrder.id,
                },
                price: {
                    amount: totalAmount,
                    currency: "INR",
                },
                status: "pending",
                orderItems: orderItems.map((oi) => ({
                    title: oi.title,
                    productId: oi.product,
                    variantId: oi.variant,
                    quantity: oi.quantity,
                    price: oi.price,
                })),
            });
        } catch (_) {}

        return res.status(200).json({
            success: true,
            message: "Order created successfully",
            order: razorpayOrder,
            dbOrderId: newOrder._id,
            keyId: config.RAZORPAY_KEY_ID,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
        });
    } catch (error) {
        console.error("CREATE ORDER CONTROLLER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create order",
        });
    }
};

/**
 * Verifies Razorpay payment signature and completes order processing.
 */
export const verifyPaymentController = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const userId = req.user._id;
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            dbOrderId,
        } = req.body || {};

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing required Razorpay payment verification fields",
            });
        }

        const orderQuery = {
            user: userId,
            razorpayOrderId: razorpay_order_id,
        };
        if (dbOrderId && mongoose.Types.ObjectId.isValid(dbOrderId)) {
            orderQuery._id = dbOrderId;
        }

        const order = await orderModel.findOne(orderQuery);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found or does not belong to the authenticated user",
            });
        }

        if (order.paymentStatus === "paid") {
            return res.status(200).json({
                success: true,
                message: "Order already verified and paid",
                order,
            });
        }

        const isValid = verifyPaymentSignature({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });

        if (!isValid) {
            order.paymentStatus = "failed";
            await order.save();

            await paymentModel.updateOne(
                { "razorpay.orderId": razorpay_order_id },
                { $set: { status: "failed" } }
            );

            return res.status(400).json({
                success: false,
                message: "Payment signature verification failed. Untrusted payment.",
            });
        }

        order.paymentStatus = "paid";
        order.orderStatus = "processing";
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        await order.save();

        await paymentModel.updateOne(
            { "razorpay.orderId": razorpay_order_id },
            {
                $set: {
                    status: "paid",
                    "razorpay.paymentId": razorpay_payment_id,
                    "razorpay.signature": razorpay_signature,
                },
            }
        );

        // Decrement inventory stock
        for (const item of order.items) {
            if (item.product && item.variant) {
                await productModel.updateOne(
                    { _id: item.product, "variants._id": item.variant },
                    { $inc: { "variants.$.stock": -item.quantity } }
                );
            }
        }

        // Clear cart
        await cartModel.updateOne({ user: userId }, { $set: { items: [] } });

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            order,
        });
    } catch (error) {
        console.error("VERIFY PAYMENT CONTROLLER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to verify payment",
        });
    }
};

export const verifyOrderController = verifyPaymentController;

/**
 * Records a cancelled or failed payment attempt.
 */
export const paymentFailedController = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const userId = req.user._id;
        const { razorpay_order_id, dbOrderId } = req.body || {};

        const orderQuery = {
            user: userId,
            ...(razorpay_order_id ? { razorpayOrderId: razorpay_order_id } : {}),
        };
        if (dbOrderId && mongoose.Types.ObjectId.isValid(dbOrderId)) {
            orderQuery._id = dbOrderId;
        }

        const order = await orderModel.findOne(orderQuery);
        if (order && order.paymentStatus !== "paid") {
            order.paymentStatus = "failed";
            await order.save();
        }

        if (razorpay_order_id) {
            await paymentModel.updateOne(
                { "razorpay.orderId": razorpay_order_id },
                { $set: { status: "failed" } }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Payment failure recorded",
        });
    } catch (error) {
        console.error("PAYMENT FAILED CONTROLLER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to record payment failure",
        });
    }
};