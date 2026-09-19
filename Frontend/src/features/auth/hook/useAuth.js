import { setError, setLoading, setUser} from "../state/auth.slice.js";
import { register,login } from "../service/auth.api.js";
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

            dispatch(setUser(data));

        } catch (error) {
            dispatch(
                setError(
                    error.response?.data?.message ||
                    "Registration failed"
                )
            );
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

            dispatch(setUser(data));

        } catch (error) {
            dispatch(
                setError(
                    error.response?.data?.message ||
                    "Login failed"
                )
            );
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        handleRegister,
        handleLogin
    };
};

