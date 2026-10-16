import {
    setError,
    setLoading,
    setUser
} from "../state/auth.slice.js";

import {
    register,
    login,
    getMe,
    verifyEmail,
    resendVerification,
    logout
} from "../service/auth.api.js";

import { useDispatch } from "react-redux";

export const useAuth = () => {
    const dispatch = useDispatch();

    async function handleRegister({
        email,
        contact,
        password,
        confirmPassword,
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
                confirmPassword,
                fullname,
                address,
                city,
                state,
                pincode,
                isSeller
            });

            return data;
        } catch (error) {
            const msg = error.response?.data?.message || "Registration failed";
            dispatch(setError(msg));
            return {
                error: true,
                message: msg,
                data: error.response?.data
            };
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

            dispatch(setUser(data?.user || data));
            return data;
        } catch (error) {
            const errData = error.response?.data || {};
            const msg = errData.message || "Login failed. Invalid email or password.";

            dispatch(setError(msg));
            return {
                error: true,
                message: msg,
                isUnverified: Boolean(errData.isUnverified),
                notRegistered: Boolean(errData.notRegistered),
                email: errData.email || email,
            };
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleVerifyEmail({ token }) {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            const data = await verifyEmail({ token });
            if (data?.user) {
                dispatch(setUser(data.user));
            }
            return data;
        } catch (error) {
            const msg = error.response?.data?.message || "Email verification failed";
            dispatch(setError(msg));
            return {
                error: true,
                message: msg,
                expired: Boolean(error.response?.data?.expired),
                email: error.response?.data?.email
            };
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleResendVerification({ email }) {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            const data = await resendVerification({ email });
            return data;
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to resend verification email";
            dispatch(setError(msg));
            return {
                error: true,
                message: msg,
                notRegistered: Boolean(error.response?.data?.notRegistered)
            };
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true));
            const data = await getMe();
            dispatch(setUser(data.user));
            return data;
        } catch (_err) {
            // Unauthenticated or expired session
            dispatch(setUser(null));
            return null;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleLogout() {
        try {
            dispatch(setLoading(true));
            await logout();
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            dispatch(setUser(null));
            dispatch(setLoading(false));
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleVerifyEmail,
        handleResendVerification,
        handleGetMe,
        handleLogout
    };
};
