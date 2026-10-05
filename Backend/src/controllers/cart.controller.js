import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockOfVariant } from "../dao/product.dao.js";

export const addToCart = async (req, res) => {
    try {
        const { productId, variantId } = req.params;
        const { quantity = 1 } = req.body;

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
            variant => variant._id.toString() === variantId
        );

        if (!variant) {
            return res.status(404).json({
                message: "Variant not found",
                success: false,
            });
        }

        const stock = await stockOfVariant(productId, variantId);

        if (stock <= 0) {
            return res.status(400).json({
                message: "This variant is out of stock",
                success: false,
            });
        }

        if (quantity > stock) {
            return res.status(400).json({
                message: `Only ${stock} items left in stock`,
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
            item =>
                item.product.toString() === productId &&
                item.variant?.toString() === variantId
        );

        if (existingItem) {
            if (existingItem.quantity + quantity > stock) {
                return res.status(400).json({
                    message: `Only ${stock} items left in stock. You already have ${existingItem.quantity} items in your cart`,
                    success: false,
                });
            }

            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                variant: variantId,
                quantity: quantity,
                price: variant.price,
            });
        }

        await cart.save();

        return res.status(200).json({
            message: "Product added to cart successfully",
            success: true,
            cart,
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
        const cart = await cartModel
            .findOne({
                user: req.user._id,
            })
            .populate("items.product");

        if (!cart) {
            return res.status(200).json({
                message: "Cart is empty",
                success: true,
                cart: {
                    user: req.user._id,
                    items: [],
                },
            });
        }

        return res.status(200).json({
            message: "Cart fetched successfully",
            success: true,
            cart,
        });

    } catch (error) {
        console.error("GET CART ERROR:", error);

        return res.status(500).json({
            message: error.message,
            success: false,
        });
    }
};