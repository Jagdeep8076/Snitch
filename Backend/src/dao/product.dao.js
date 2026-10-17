import mongoose from "mongoose";
import productModel from "../models/product.model.js";

export const stockOfVariant = async (productId, variantId) => {
    if (
        !productId ||
        !variantId ||
        !mongoose.Types.ObjectId.isValid(productId) ||
        (variantId !== "none" && !mongoose.Types.ObjectId.isValid(variantId))
    ) {
        return 0;
    }

    const product = await productModel.findById(productId);
    if (!product) {
        return 0;
    }

    if (variantId === "none" || !Array.isArray(product.variants) || product.variants.length === 0) {
        return 999;
    }

    const variant = product.variants.find(
        (v) => v._id.toString() === variantId.toString()
    );

    return variant ? Number(variant.stock ?? 0) : 0;
};