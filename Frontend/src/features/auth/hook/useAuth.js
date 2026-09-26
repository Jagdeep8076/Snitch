import {
    setError,
    setLoading,
    setUser
} from "../state/auth.slice.js";

import {
    register,
    login,
    getMe
} from "../service/auth.api.js";

import { useDispatch } from "react-redux";

export const useAuth = () => {

    const dispatch = useDispatch();


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


   
    async function handleGetMe() {

        try {

            dispatch(setLoading(true));

            const data = await getMe();

            console.log("GET ME SUCCESS:", data);

            dispatch(setUser(data.user));

            return data;

        } catch (err) {

            console.error("GET ME ERROR:", err);

            dispatch(
                setError(
                    err.response?.data?.message ||
                    "Failed to fetch user"
                )
            );

            return null;

        } finally {

            dispatch(setLoading(false));

        }
    }


   
    return {
        handleRegister,
        handleLogin,
        handleGetMe
    };
};

