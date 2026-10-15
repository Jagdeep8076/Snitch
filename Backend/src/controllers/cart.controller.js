import mongoose from "mongoose";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import orderModel from "../models/order.model.js";
import { stockOfVariant } from "../dao/product.dao.js";
import { createOrder, verifyPaymentSignature } from "../services/payment.service.js";
import { config } from "../config/config.js";

/**
 * Helper to fetch and format the user's cart using an aggregation pipeline.
 * Ensures:
 * - Full product details are populated with their variants array intact.
 * - The selected variant is identified via $filter without destructively unwinding product.variants.
 * - Deleted or invalid products and variants are filtered out safely.
 * - Item subtotals and the cart's total price are calculated correctly.
 * - If the cart is empty or has no valid items, returns a consistent empty cart structure.
 */
export const fetchCartResponse = async (userId) => {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    let existingCart = await cartModel.findOne({ user: userObjectId });
    if (!existingCart) {
        existingCart = await cartModel.create({
            user: userObjectId,
            items: [],
        });
    }

    if (!existingCart.items || existingCart.items.length === 0) {
        return {
            _id: existingCart._id,
            user: userObjectId,
            items: [],
            totalPrice: 0,
            currency: "INR",
        };
    }

    const cart = await cartModel.aggregate([
        {
            $match: {
                _id: existingCart._id,
            },
        },
        {
            $unwind: "$items",
        },
        {
            $lookup: {
                from: productModel.collection.name,
                localField: "items.product",
                foreignField: "_id",
                as: "productDetails",
            },
        },
        {
            $unwind: {
                path: "$productDetails",
                preserveNullAndEmptyArrays: false,
            },
        },
        {
            $addFields: {
                matchedVariant: {
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: "$productDetails.variants",
                                as: "v",
                                cond: {
                                    $eq: [
                                        { $toString: "$$v._id" },
                                        { $toString: { $ifNull: ["$items.variant", ""] } },
                                    ],
                                },
                            },
                        },
                        0,
                    ],
                },
            },
        },
        {
            $match: {
                matchedVariant: { $ne: null },
            },
        },
        {
            $addFields: {
                effectivePrice: {
                    $ifNull: [
                        "$items.price",
                        {
                            $ifNull: [
                                "$matchedVariant.price",
                                "$productDetails.price",
                            ],
                        },
                    ],
                },
            },
        },
        {
            $addFields: {
                itemSubtotal: {
                    $multiply: [
                        "$items.quantity",
                        { $ifNull: ["$effectivePrice.amount", 0] },
                    ],
                },
                formattedItem: {
                    _id: "$items._id",
                    product: "$productDetails",
                    variant: "$items.variant",
                    selectedVariant: "$matchedVariant",
                    quantity: "$items.quantity",
                    price: "$effectivePrice",
                    subtotal: {
                        $multiply: [
                            "$items.quantity",
                            { $ifNull: ["$effectivePrice.amount", 0] },
                        ],
                    },
                },
            },
        },
        {
            $group: {
                _id: "$_id",
                user: { $first: "$user" },
                items: { $push: "$formattedItem" },
                totalPrice: { $sum: "$itemSubtotal" },
                currency: {
                    $first: { $ifNull: ["$effectivePrice.currency", "INR"] },
                },
            },
        },
        {
            $project: {
                _id: 1,
                user: 1,
                items: 1,
                totalPrice: 1,
                currency: { $ifNull: ["$currency", "INR"] },
            },
        },
    ]);

    if (!cart || cart.length === 0) {
        if (existingCart.items.length > 0) {
            existingCart.items = [];
            await existingCart.save();
        }
        return {
            _id: existingCart._id,
            user: userObjectId,
            items: [],
            totalPrice: 0,
            currency: "INR",
        };
    }

    // Sync DB items if invalid/deleted items were filtered out
    if (cart[0].items.length !== existingCart.items.length) {
        const validItemIds = cart[0].items.map((i) => i._id.toString());
        existingCart.items = existingCart.items.filter((i) =>
            validItemIds.includes(i._id.toString())
        );
        await existingCart.save();
    }

    return cart[0];
};

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

        if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(variantId)) {
            return res.status(400).json({
                message: "Invalid product ID or variant ID",
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

        const product = await productModel.findOne({
            _id: productId,
            "variants._id": variantId,
        });

        if (!product) {
            return res.status(404).json({
                message: "Product and variant not found",
                success: false,
            });
        }

        const variant = product.variants.find(
            (item) => item._id.toString() === variantId
        );

        if (!variant) {
            return res.status(404).json({
                message: "Variant not found",
                success: false,
            });
        }

        const stock = Number(variant.stock ?? 0);
        if (stock <= 0) {
            return res.status(400).json({
                message: "This variant is out of stock",
                success: false,
            });
        }

        const itemPrice = (variant.price && variant.price.amount != null)
            ? variant.price
            : product.price;

        if (!itemPrice || itemPrice.amount == null) {
            return res.status(400).json({
                message: "Product price is not configured properly",
                success: false,
            });
        }

        let cart = await cartModel.findOne({
            user: req.user._id,
        });

        if (!cart) {
            cart = await cartModel.create({
                user: req.user._id,
                items: [],
            });
        }

        const existingItem = cart.items.find(
            (item) =>
                item.product.toString() === productId &&
                item.variant?.toString() === variantId
        );

        if (existingItem) {
            if (existingItem.quantity + parsedQty > stock) {
                return res.status(400).json({
                    message: `Only ${stock} items are available in stock. You already have ${existingItem.quantity} items in your cart`,
                    success: false,
                });
            }

            existingItem.quantity += parsedQty;
            if (!existingItem.price || existingItem.price.amount == null) {
                existingItem.price = {
                    amount: itemPrice.amount,
                    currency: itemPrice.currency || "INR",
                    mrp: itemPrice.mrp ?? null,
                };
            }
        } else {
            if (parsedQty > stock) {
                return res.status(400).json({
                    message: `Only ${stock} items are available in stock`,
                    success: false,
                });
            }

            cart.items.push({
                product: productId,
                variant: variantId,
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
            message: error.message,
            success: false,
        });
    }
};

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
            message: error.message,
            success: false,
        });
    }
};

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

        const cart = await cartModel.findOne({
            user: req.user._id,
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
                success: false,
            });
        }

        const cartItem = cart.items.find(
            (item) => item._id.toString() === itemId
        );

        if (!cartItem) {
            return res.status(404).json({
                message: "Cart item not found",
                success: false,
            });
        }

        let stock;
        try {
            stock = await stockOfVariant(
                cartItem.product.toString(),
                cartItem.variant?.toString()
            );
        } catch (stockErr) {
            return res.status(404).json({
                message: "Product or variant no longer available",
                success: false,
            });
        }

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
            message: error.message,
            success: false,
        });
    }
};

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

        const cart = await cartModel.findOne({
            user: req.user._id,
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
                success: false,
            });
        }

        const itemExists = cart.items.some(
            (item) => item._id.toString() === itemId
        );

        if (!itemExists) {
            return res.status(404).json({
                message: "Cart item not found",
                success: false,
            });
        }

        cart.items = cart.items.filter(
            (item) => item._id.toString() !== itemId
        );

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
            message: error.message,
            success: false,
        });
    }
};

export const clearCart = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
            });
        }

        const cart = await cartModel.findOne({
            user: req.user._id,
        });

        if (!cart) {
            return res.status(200).json({
                message: "Cart is already empty",
                success: true,
                cart: {
                    user: req.user._id,
                    items: [],
                    totalPrice: 0,
                    currency: "INR",
                },
            });
        }

        cart.items = [];

        await cart.save();

        return res.status(200).json({
            message: "Cart cleared successfully",
            success: true,
            cart: {
                _id: cart._id,
                user: req.user._id,
                items: [],
                totalPrice: 0,
                currency: "INR",
            },
        });
    } catch (error) {
        console.error("CLEAR CART ERROR:", error);

        return res.status(500).json({
            message: error.message,
            success: false,
        });
    }
};


/**
 * Creates a Razorpay order from the user's cart.
 * - Validates cart existence and items.
 * - Re-verifies all products and variants against DB.
 * - Validates stock for each item.
 * - Computes total amount server-side from trusted database prices.
 * - Creates a Razorpay order via payment service.
 * - Creates a pending Order in MongoDB.
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

        // 1. Fetch current cart
        const cart = await cartModel.findOne({ user: userId });
        if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty. Please add items to checkout.",
            });
        }

        // 2. Validate all items against DB products and check stock
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

            if (!variant) {
                return res.status(400).json({
                    success: false,
                    message: `Selected variant for "${product.title}" is no longer available.`,
                });
            }

            const requestedQty = Math.max(1, Number(item.quantity) || 1);
            const currentStock = Number(variant.stock ?? 0);
            if (currentStock < requestedQty) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${currentStock} item(s) available in stock for "${product.title}". Please reduce quantity.`,
                });
            }

            // Calculate price from trusted server-side sources
            const effectivePrice = (variant.price && variant.price.amount != null)
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
                variant: variant._id,
                selectedVariant: {
                    _id: variant._id,
                    attributes: variant.attributes,
                    stock: variant.stock,
                    price: effectivePrice,
                },
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

        // 3. Create Razorpay order via payment service
        const razorpayOrder = await createOrder({
            amount: totalAmount,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: {
                userId: String(userId),
                userEmail: req.user.email || "",
            },
        });

        // 4. Save pending order in MongoDB
        const resolvedAddress = {
            fullname: shippingAddress?.fullname?.trim() || req.user.fullname || "Customer",
            contact: shippingAddress?.contact?.trim() || req.user.contact || "",
            address: shippingAddress?.address?.trim() || req.user.address || "",
            city: shippingAddress?.city?.trim() || req.user.city || "",
            state: shippingAddress?.state?.trim() || req.user.state || "",
            pincode: shippingAddress?.pincode?.trim() || req.user.pincode || "",
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
 * - Verifies timing-safe HMAC SHA256 signature using RAZORPAY_KEY_SECRET.
 * - Prevents duplicate order deductions.
 * - Deducts variant stock in database.
 * - Clears user's cart in database.
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

        // 1. Locate order by user and Razorpay Order ID
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

        // 2. Prevent duplicate processing
        if (order.paymentStatus === "paid") {
            return res.status(200).json({
                success: true,
                message: "Order already verified and paid",
                order,
            });
        }

        // 3. Verify Razorpay cryptographic signature server-side
        const isValid = verifyPaymentSignature({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });

        if (!isValid) {
            order.paymentStatus = "failed";
            await order.save();
            return res.status(400).json({
                success: false,
                message: "Payment signature verification failed. Untrusted payment.",
            });
        }

        // 4. Mark order as paid
        order.paymentStatus = "paid";
        order.orderStatus = "processing";
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        await order.save();

        // 5. Decrement inventory stock safely for each variant purchased
        for (const item of order.items) {
            if (item.product && item.variant) {
                await productModel.updateOne(
                    { _id: item.product, "variants._id": item.variant },
                    { $inc: { "variants.$.stock": -item.quantity } }
                );
            }
        }

        // 6. Clear user cart in DB only AFTER successful payment verification
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

/**
 * Records a cancelled or failed payment attempt so the order state is preserved
 * without discarding cart items.
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
