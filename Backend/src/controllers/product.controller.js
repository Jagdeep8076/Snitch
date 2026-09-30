import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";

export async function createProduct(req, res) {
    try {
        const { title, description, priceAmount, priceCurrency } = req.body;
        const seller = req.user;

        const files = req.files || [];
        const images = await Promise.all(
            files.map(async (file) => {
                return await uploadFile({
                    buffer: file.buffer,
                    fileName: file.originalname,
                });
            })
        );

        const product = await productModel.create({
            title,
            description,
            price: {
                amount: priceAmount,
                currency: priceCurrency || "INR",
            },
            images,
            seller: seller._id,
        });

        return res.status(201).json({
            message: "Product Created Successfully",
            success: true,
            product,
        });
    } catch (error) {
        console.error("CREATE PRODUCT ERROR:", error);
        return res.status(500).json({
            message: "Failed to create product",
            success: false,
        });
    }
}

export async function getSellerProducts(req, res) {
    try {
        const seller = req.user;
        const products = await productModel.find({ seller: seller._id });

        return res.status(200).json({
            message: "Products Fetched Successfully",
            success: true,
            products,
        });
    } catch (error) {
        console.error("GET SELLER PRODUCTS ERROR:", error);
        return res.status(500).json({
            message: "Failed to fetch products",
            success: false,
        });
    }
}

export async function getAllProducts(req, res){
    const products = await productModel.find()
    
    return res.status(200).json({
        message: "Products Fetched Succesfully",
        success: true,
        products
    })
}
export async function getProductDetails(req, res){
    const { id } = req.params;
const product = await productModel.findById(id)

if(!product){
    return res.status(404).json({
        message: "Product doesn't Found/Fetched Succesfully",
        success: false
    })
}
return res.status(200).json({
    message: "Product Details Found/Fetched Successfully",
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
    if (files && files.length !== 0) {
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
    let attributes = {};
    try {
        attributes = JSON.parse(req.body.attributes || "{}");
    } catch(e) {
        console.error("Failed to parse attributes");
    }

    product.variants.push({
        images,
        price: {
            amount: Number(price) || product.price.amount,
            currency: req.body.priceCurrency || product.price.currency
        },
        stock: Number(stock) || 0,
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