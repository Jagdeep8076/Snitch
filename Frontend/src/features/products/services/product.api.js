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