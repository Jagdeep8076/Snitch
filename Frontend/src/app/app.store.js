import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/state/auth.slice.js";
import productReducer from "../features/products/state/product.slice.js"
import cartReducer from "../features/cart/state/cart.Slice.js"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        cart: cartReducer
    }
})