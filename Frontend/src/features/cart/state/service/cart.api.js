import axios from "axios";
import { API_BASE_URL } from "../../../../config/api.config.js";

const cartApiInstance = axios.create({
    baseURL: `${API_BASE_URL}/cart`,
    withCredentials: true,
});

cartApiInstance.interceptors.request.use((config) => {
    try {
        const token = typeof window !== "undefined" ? localStorage.getItem("snitch_token") : null;
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (_) {}
    return config;
});

cartApiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            try {
                if (typeof window !== "undefined") {
                    localStorage.removeItem("snitch_token");
                }
            } catch (_) {}
        }
        return Promise.reject(error);
    }
);

export const addItem = async ({ productId, variantId, quantity = 1 }) => {
    const targetVariant = (variantId && variantId !== "undefined") ? variantId : "none";
    const response = await cartApiInstance.post(`/add/${productId}/${targetVariant}`, {
        quantity
    });
    return response.data;
};

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