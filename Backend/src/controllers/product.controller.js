import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";


export async function createProduct(req, res) {

    const { title, description, priceAmount, priceCurrency } = req.body;
    const seller = req.user;

    const images = await Promise.all(req.files.map(async (file) => {
        return await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname
        })
    }))


    const product = await productModel.create({
        title,
        description,
        price: {
            amount: priceAmount,
            currency: priceCurrency || "INR"
        },
        images,
        seller: seller._id
    })


    res.status(201).json({
        message: "Product created successfully",
        success: true,
        product
    })
}

export async function getSellerProducts(req, res) {
    const seller = req.user;

    const products = await productModel.find({ seller: seller._id });


    res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
}

export async function getAllProducts(req, res) {
    const products = await productModel.find()

    return res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
}

export async function getProductDetails(req, res) {
    const { id } = req.params;

    const product = await productModel.findById(id)

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    return res.status(200).json({
        message: "Product details fetched successfully",
        success: true,
        product
    })
}


export async function addProductVariant(req, res) {

    const productId = req.params.productId;

    const product = await productModel.findOne({
        _id: productId,
        seller: req.user._id
    });

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    const files = req.files;
    const images = [];
    if (files || files.length !== 0) {
        (await Promise.all(files.map(async (file) => {
            const image = await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname
            })
            return image
        }))).map(image => images.push(image))
    }

    const price = req.body.priceAmount
    const stock = req.body.stock
    const attributes = JSON.parse(req.body.attributes || "{}")

    console.log(price)

    product.variants.push({
        images,
        price: {
            amount: Number(price) || product.price.amount,
            currency: req.body.priceCurrency || product.price.currency
        },
        stock,
        attributes
    })

    await product.save();

    return res.status(200).json({
        message: "Product variant added successfully",
        success: true,
        product,
        variant: product.variants[product.variants.length - 1]
    })
}

export async function updateVariantStock(req, res) {
    try {
        const { productId, variantId } = req.params;
        const { stock } = req.body;

        if (stock === undefined || stock < 0 || !Number.isInteger(Number(stock))) {
            return res.status(400).json({
                message: "Valid non-negative integer stock is required",
                success: false
            });
        }

        const product = await productModel.findOne({
            _id: productId,
            seller: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found or unauthorized",
                success: false
            });
        }

        const variantIndex = product.variants.findIndex(v => v._id.toString() === variantId);
        if (variantIndex === -1) {
            return res.status(404).json({
                message: "Variant not found",
                success: false
            });
        }

        product.variants[variantIndex].stock = Number(stock);
        await product.save();

        return res.status(200).json({
            message: "Stock updated successfully",
            success: true,
            product,
            variant: product.variants[variantIndex]
        });
    } catch (error) {
        console.error("UPDATE VARIANT STOCK ERROR:", error);
        return res.status(500).json({
            message: "Failed to update stock",
            success: false
        });
    }
}

export async function updateProductBasePrice(req, res) {
    try {
        const { productId } = req.params;
        const { amount, currency, mrp } = req.body;

        if (amount === undefined || amount < 0 || isNaN(Number(amount))) {
            return res.status(400).json({
                message: "Valid non-negative price amount is required",
                success: false
            });
        }

        if (mrp !== undefined && mrp !== null && mrp !== "") {
            if (isNaN(Number(mrp)) || Number(mrp) < Number(amount)) {
                return res.status(400).json({
                    message: "MRP must be a valid number greater than or equal to the selling price",
                    success: false
                });
            }
        }

        const product = await productModel.findOne({
            _id: productId,
            seller: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found or unauthorized",
                success: false
            });
        }

        product.price.amount = Number(amount);
        if (currency) {
            product.price.currency = currency;
        }
        if (mrp === "") {
            product.price.mrp = null;
        } else if (mrp !== undefined && mrp !== null) {
            product.price.mrp = Number(mrp);
        }

        await product.save();

        return res.status(200).json({
            message: "Product base price updated successfully",
            success: true,
            product
        });
    } catch (error) {
        console.error("UPDATE PRODUCT PRICE ERROR:", error);
        return res.status(500).json({
            message: "Failed to update base price",
            success: false
        });
    }
}

export async function updateVariantPrice(req, res) {
    try {
        const { productId, variantId } = req.params;
        const { amount, currency, mrp } = req.body;

        if (amount === undefined || amount < 0 || isNaN(Number(amount))) {
            return res.status(400).json({
                message: "Valid non-negative price amount is required",
                success: false
            });
        }

        if (mrp !== undefined && mrp !== null && mrp !== "") {
            if (isNaN(Number(mrp)) || Number(mrp) < Number(amount)) {
                return res.status(400).json({
                    message: "MRP must be a valid number greater than or equal to the selling price",
                    success: false
                });
            }
        }

        const product = await productModel.findOne({
            _id: productId,
            seller: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found or unauthorized",
                success: false
            });
        }

        const variantIndex = product.variants.findIndex(v => v._id.toString() === variantId);
        if (variantIndex === -1) {
            return res.status(404).json({
                message: "Variant not found",
                success: false
            });
        }

        if (!product.variants[variantIndex].price) {
            product.variants[variantIndex].price = { 
                amount: Number(amount), 
                currency: currency || product.price.currency,
                mrp: mrp ? Number(mrp) : null
            };
        } else {
            product.variants[variantIndex].price.amount = Number(amount);
            if (currency) {
                product.variants[variantIndex].price.currency = currency;
            }
            if (mrp === "") {
                product.variants[variantIndex].price.mrp = null;
            } else if (mrp !== undefined && mrp !== null) {
                product.variants[variantIndex].price.mrp = Number(mrp);
            }
        }

        await product.save();

        return res.status(200).json({
            message: "Variant price updated successfully",
            success: true,
            product,
            variant: product.variants[variantIndex]
        });
    } catch (error) {
        console.error("UPDATE VARIANT PRICE ERROR:", error);
        return res.status(500).json({
            message: "Failed to update variant price",
            success: false
        });
    }
}