import { createBrowserRouter } from "react-router-dom";

import Home from "../features/home/pages/Home";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import CreateProduct from "../features/products/pages/createProduct";
import Dashboard from "../features/products/pages/Dashboard";


const router = createBrowserRouter([
    {
        path: "/",
        element:  <Home />
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
        path: "/seller",
        children: [
            {
                path: "/seller/products/create",
                element: <CreateProduct />
            },
            {
                path:"/seller/dashboard",
                element: <Dashboard />
            }
        ]
    },
]);

export default router;
