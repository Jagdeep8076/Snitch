import { createBrowserRouter } from "react-router-dom";

import Home from "../features/products/pages/Home";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import CreateProduct from "../features/products/pages/createProduct";
import Dashboard from "../features/products/pages/Dashboard";
import Protected from "../features/auth/components/Protected";
import ProductDetail from "../features/products/pages/ProductDetail";
import SellerProductDetail from "../features/products/pages/SellerProductDetail";
import Cart from "../features/cart/pages/Cart";
import AppLayout from "./Applayout";

const router = createBrowserRouter([
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/product/:productId",
        element: <ProductDetail />,
      },
      {
        path: "/cart",
        element: (
          <Protected>
            <Cart />
          </Protected>
        ),
      },
      {
        path: "/seller",
        children: [
          {
            path: "/seller/products/create",
            element: (
              <Protected role="seller">
                <CreateProduct />
              </Protected>
            ),
          },
          {
            path: "/seller/dashboard",
            element: (
              <Protected role="seller">
                <Dashboard />
              </Protected>
            ),
          },
          {
            path: "/seller/product/:productId",
            element: (
              <Protected role="seller">
                <SellerProductDetail />
              </Protected>
            ),
          },
        ],
      },
    ],
  },
]);

export default router;