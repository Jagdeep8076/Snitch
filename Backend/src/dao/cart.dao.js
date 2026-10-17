import mongoose from "mongoose";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";

export async function getCartDetails(userId) {
    if (!userId) return null;
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
                                input: { $ifNull: ["$productDetails.variants", []] },
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
        return {
            _id: existingCart._id,
            user: userObjectId,
            items: [],
            totalPrice: 0,
            currency: "INR",
        };
    }

    return cart[0];
}