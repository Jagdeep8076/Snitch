import axios from "axios";
import { API_BASE_URL } from "../../../config/api.config.js";

const authApiInstance = axios.create({
    baseURL: `${API_BASE_URL}/auth`,
    withCredentials: true,
});

authApiInstance.interceptors.request.use((config) => {
    try {
        const token = typeof window !== "undefined" ? localStorage.getItem("snitch_token") : null;
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (_) {}
    return config;
});

authApiInstance.interceptors.response.use(
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

export async function register({
    email,
    contact,
    password,
    confirmPassword,
    fullname,
    address,
    city,
    state,
    pincode,
    isSeller,
}) {
    const response = await authApiInstance.post("/register", {
        email,
        contact,
        password,
        confirmPassword,
        fullname,
        address,
        city,
        state,
        pincode,
        isSeller,
    });

    return response.data;
}

export async function verifyEmail({ token }) {
    const response = await authApiInstance.post("/verify-email", { token });
    return response.data;
}

export async function resendVerification({ email }) {
    const response = await authApiInstance.post("/resend-verification", { email });
    return response.data;
}

export async function login({ email, password }) {
    const response = await authApiInstance.post("/login", {
        email,
        password,
    });
    return response.data;
}

export async function getMe() {
    const response = await authApiInstance.get("/me");
    return response.data;
}

export async function logout() {
    try {
        if (typeof window !== "undefined") {
            localStorage.removeItem("snitch_token");
            sessionStorage.clear();
        }
    } catch (_) {}

    try {
        const response = await authApiInstance.post("/logout");
        return response.data;
    } finally {
        try {
            if (typeof window !== "undefined") {
                localStorage.removeItem("snitch_token");
                sessionStorage.clear();
            }
        } catch (_) {}
    }
}