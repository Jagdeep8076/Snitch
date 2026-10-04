import productModel from "../models/product.model.js";


export const  stockOfVariant = async ( createProductValidator, variantId) =>{
    const product = await productModel.findOne({
        _id: createProductValidator,
        "variants._id": variantId
    })

const stock = product.variants.find(variant => variant._id.toString() === variantId).stock

return stock

} 