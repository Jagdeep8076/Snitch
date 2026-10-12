import mongoose from "mongoose";
import productModel from "../models/product.model.js";

export const stockOfVariant = async (productId, variantId) => {
    if (
        !productId ||
        !variantId ||
        !mongoose.Types.ObjectId.isValid(productId) ||
        !mongoose.Types.ObjectId.isValid(variantId)
    ) {
        throw new Error("Product or variant not found");
    }

    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId,
    });

    if (!product) {
        throw new Error("Product or variant not found");
    }

    const variant = product.variants.find(
        (variant) => variant._id.toString() === variantId.toString()
    );

    if (!variant) {
        throw new Error("Variant not found");
    }

    return Number(variant.stock ?? 0);
};