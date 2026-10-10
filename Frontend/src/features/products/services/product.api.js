 import axios from "axios"

 const productApiInstance = axios.create({
    baseURL: "/api/products",
    withCredentials: true,
 })



 export async function createProduct(formData) { 
    const response = await productApiInstance.post("/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    })

    return response.data
 }

 export async function getSellerProducts() {
    const response = await productApiInstance.get("/seller")

    return response.data
 }

 export async function getAllProducts({ sort } = {}) {
   const params = {};
   if (sort) params.sort = sort;
   const response = await productApiInstance.get("/", { params })

   return response.data
 }

 export async function getProductById(productId) {
   const response  = await productApiInstance.get(`/detail/${productId}`)
   return response.data
 }

 export async function addProductVariant(productId, newProductVariant) {

    const formData = new FormData()

    if (newProductVariant.images) {
        newProductVariant.images.forEach((image) => {
            if (image && image.file) {
                formData.append(`images`, image.file)
            }
        })
    }

    formData.append("stock", newProductVariant.stock)
    formData.append("priceAmount", newProductVariant.price.amount)
    formData.append("priceCurrency", newProductVariant.price.currency)
    if (newProductVariant.price.mrp) {
        formData.append("mrp", newProductVariant.price.mrp)
    }
    formData.append("attributes", JSON.stringify(newProductVariant.attributes))

    const response = await productApiInstance.post(`/${productId}/variants`, formData)

    return response.data
}

export async function updateVariantStock(productId, variantId, stock) {
    const response = await productApiInstance.put(`/${productId}/variants/${variantId}/stock`, { stock });
    return response.data;
}

export async function updateProductBasePrice(productId, amount, currency, mrp) {
    const response = await productApiInstance.put(`/${productId}/price`, { amount, currency, mrp });
    return response.data;
}

export async function updateVariantPrice(productId, variantId, amount, currency, mrp) {
    const response = await productApiInstance.put(`/${productId}/variants/${variantId}/price`, { amount, currency, mrp });
    return response.data;
}