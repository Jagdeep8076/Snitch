import { createBrowserRouter } from "react-router-dom";

import Home from "../features/products/pages/Home";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import CreateProduct from "../features/products/pages/createProduct";
import Dashboard from "../features/products/pages/Dashboard";
import Protected from "../features/auth/components/Protected";
import ProductDetail from "../features/products/pages/ProductDetail";


const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    },

    {
        path: "/register",
        element: <Register />,
    },

    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/product/:productId",
        element: <ProductDetail />
    },

    {
        path: "/seller",
        children: [
            {
                path: "/seller/products/create",
                element: <Protected
                      role="seller">
                    <CreateProduct /></Protected>
            },
            {
                path:"/seller/dashboard",
                element: <Protected role="seller">
                    <Dashboard />
                </Protected>
            }
        ]
    },
]);

export default router;
