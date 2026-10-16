import { createBrowserRouter, Navigate } from "react-router-dom";

import Home from "../features/products/pages/Home";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import VerifyEmail from "../features/auth/pages/VerifyEmail";
import CreateProduct from "../features/products/pages/createProduct";
import Dashboard from "../features/products/pages/Dashboard";
import Protected from "../features/auth/components/Protected";
import ProductDetail from "../features/products/pages/ProductDetail";
import SellerProductDetail from "../features/products/pages/SellerProductDetail";
import Cart from "../features/cart/pages/Cart";
import Checkout from "../features/cart/pages/Checkout";
import AppLayout from "./AppLayout";
import Collections from "../features/products/pages/Collections";
import NewArrivals from "../features/products/pages/NewArrivals";
import About from "../features/products/pages/About";
import RouteErrorBoundary from "../components/RouteErrorBoundary";
import NotFound from "../components/NotFound";

const router = createBrowserRouter([
  {
    path: "/register",
    element: <Register />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
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
        path: "/collections",
        element: <Collections />,
      },
      {
        path: "/new-arrivals",
        element: <NewArrivals />,
      },
      {
        path: "/about",
        element: <About />,
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
        path: "/checkout",
        element: (
          <Protected>
            <Checkout />
          </Protected>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "/seller",
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/seller/dashboard" replace />,
      },
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
]);

export default router;