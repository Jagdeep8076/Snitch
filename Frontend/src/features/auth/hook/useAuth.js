import {
    setError,
    setLoading,
    setUser
} from "../state/auth.slice.js";

import {
    register,
    login
} from "../service/auth.api.js";

import { useDispatch } from "react-redux";

export const useAuth = () => {

    const dispatch = useDispatch();

    // =========================
    // REGISTER
    // =========================
    async function handleRegister({
        email,
        contact,
        password,
        fullname,
        address,
        city,
        state,
        pincode,
        isSeller = false
    }) {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            const data = await register({
                email,
                contact,
                password,
                fullname,
                address,
                city,
                state,
                pincode,
                isSeller
            });

            console.log("REGISTER SUCCESS:", data);

            // Register ke baad user ko logged-in mat karo
            return data;

        } catch (error) {

            console.error("REGISTER ERROR:", error);

            dispatch(
                setError(
                    error.response?.data?.message ||
                    "Registration failed"
                )
            );

            return null;

        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleLogin({ email, password }) {

        try {

            dispatch(setLoading(true));
            dispatch(setError(null));

            const data = await login({
                email,
                password
            });

            console.log("LOGIN SUCCESS:", data);

            // Sirf LOGIN ke baad user Redux mein jayega
            dispatch(setUser(data));

            return data;

        } catch (error) {

            console.error("LOGIN ERROR:", error);

            dispatch(
                setError(
                    error.response?.data?.message ||
                    "Login failed"
                )
            );

            return null;

        } finally {
            dispatch(setLoading(false));
        }
    }


    return {
        handleRegister,
        handleLogin
    };
};