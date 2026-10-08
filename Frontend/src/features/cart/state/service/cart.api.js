import axios from "axios"

const cartApiInstance = axios.create({
    baseURL: "/api/cart",
    withCredentials: true
})

export const addItem = async ({ productId, variantId, quantity = 1 }) => {
    const response = await cartApiInstance.post(`/add/${productId}/${variantId}`, {
        quantity
    })
    return response.data
}

export const getCart = async () => {
    const response = await cartApiInstance.get("/")
    return response.data
}

export const updateCartItem = async ({ itemId, quantity }) => {
    const response = await cartApiInstance.put(`/items/${itemId}`, { quantity })
    return response.data
}

export const removeCartItem = async ({ itemId }) => {
    const response = await cartApiInstance.delete(`/items/${itemId}`)
    return response.data
}

export const clearCart = async () => {
    const response = await cartApiInstance.delete("/clear")
    return response.data
}