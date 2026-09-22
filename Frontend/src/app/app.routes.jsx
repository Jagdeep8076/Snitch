import { createBrowserRouter } from "react-router-dom";

import Home from "../features/home/pages/Home";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";

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
]);

export default router;
