import {
    addItem,
    getCart,
    updateCartItem as updateCartItemApi,
    removeCartItem as removeCartItemApi,
    clearCart as clearCartApi,
} from "../state/service/cart.api.js";
import { useDispatch } from "react-redux";
import {
    setCart,
    setCartLoading,
    setCartError,
    clearItems,
} from "../state/cart.Slice.js";

export const useCart = () => {
    const dispatch = useDispatch();

    /**
     * Fetch the current user's cart from backend and sync to Redux.
     */
    async function handleGetCart() {
        try {
            dispatch(setCartLoading(true));
            dispatch(setCartError(null));
            const data = await getCart();
            if (data?.cart) {
                dispatch(setCart(data.cart));
            }
            return data;
        } catch (error) {
            console.error("GET CART ERROR:", error);
            const msg = error.response?.data?.message || error.message || "Failed to fetch cart";
            dispatch(setCartError(msg));
            throw error;
        } finally {
            dispatch(setCartLoading(false));
        }
    }

    /**
     * Add item to cart. Backend handles duplicate (same product+variant) by incrementing quantity.
     * Returns updated cart from backend.
     */
    async function handleAddItem({ productId, variantId, quantity = 1 }) {
        const data = await addItem({ productId, variantId, quantity });
        if (data?.success && data?.cart) {
            dispatch(setCart(data.cart));
        }
        return data;
    }

    /**
     * Update quantity of a specific cart item (by item _id).
     */
    async function handleUpdateQuantity({ itemId, quantity }) {
        try {
            const data = await updateCartItemApi({ itemId, quantity });
            if (data.success && data.cart) {
                dispatch(setCart(data.cart));
            }
            return data;
        } catch (error) {
            console.error("UPDATE CART ITEM ERROR:", error);
            throw error;
        }
    }

    /**
     * Remove a specific cart item by its _id.
     */
    async function handleRemoveItem({ itemId }) {
        try {
            const data = await removeCartItemApi({ itemId });
            if (data.success && data.cart) {
                dispatch(setCart(data.cart));
            }
            return data;
        } catch (error) {
            console.error("REMOVE CART ITEM ERROR:", error);
            throw error;
        }
    }

    /**
     * Clear all items from cart.
     */
    async function handleClearCart() {
        try {
            const data = await clearCartApi();
            dispatch(clearItems());
            return data;
        } catch (error) {
            console.error("CLEAR CART ERROR:", error);
            throw error;
        }
    }

    return {
        handleGetCart,
        handleAddItem,
        handleUpdateQuantity,
        handleRemoveItem,
        handleClearCart,
    };
};