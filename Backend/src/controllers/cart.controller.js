import mongoose from "mongoose";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockOfVariant } from "../dao/product.dao.js";

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
