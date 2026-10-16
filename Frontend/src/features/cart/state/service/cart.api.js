import axios from "axios";
import { API_BASE_URL } from "../../../../config/api.config.js";

const cartApiInstance = axios.create({
    baseURL: `${API_BASE_URL}/cart`,
    withCredentials: true,
});

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

export const createCartOrder = async (payload = {}) => {
    const response = await cartApiInstance.post("/payment/create/order", payload);
    return response.data;
};

export const verifyCartPayment = async (payload) => {
    const response = await cartApiInstance.post("/payment/verify", payload);
    return response.data;
};

export const reportPaymentFailure = async (payload) => {
    const response = await cartApiInstance.post("/payment/failed", payload);
    return response.data;
};