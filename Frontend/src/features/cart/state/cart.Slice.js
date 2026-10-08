import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {
        setItems: (state, action) => {
            state.items = action.payload;
        },
        setCartLoading: (state, action) => {
            state.loading = action.payload;
        },
        setCartError: (state, action) => {
            state.error = action.payload;
        },
        // Replace full cart from backend response
        setCart: (state, action) => {
            state.items = action.payload?.items ?? [];
        },
        // Remove a single item by _id
        removeItem: (state, action) => {
            state.items = state.items.filter(
                item => item._id !== action.payload
            );
        },
        // Clear all items
        clearItems: (state) => {
            state.items = [];
        },
    }
});

export const {
    setItems,
    setCart,
    setCartLoading,
    setCartError,
    removeItem,
    clearItems,
} = cartSlice.actions;

export default cartSlice.reducer;