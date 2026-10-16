import axios from "axios";

const authApiInstance = axios.create({
    baseURL: "/api/auth",
    withCredentials: true,
});

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
    const response = await authApiInstance.post("/logout");
    return response.data;
}