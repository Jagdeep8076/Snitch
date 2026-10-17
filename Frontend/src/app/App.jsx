import { RouterProvider } from 'react-router-dom';
import router from './app.routes';
import "./App.css";
import { useSelector } from 'react-redux';
import { useAuth } from '../features/auth/hook/useAuth.js';
import { useCart } from '../features/cart/hook/useCart.js';
import { useEffect } from 'react';

function App() {
  const { handleGetMe } = useAuth();
  const { handleGetCart } = useCart();
  const user = useSelector((state) => state.auth?.user);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const urlToken = searchParams.get("token");
        if (urlToken) {
          localStorage.setItem("snitch_token", urlToken);
          searchParams.delete("token");
          searchParams.delete("auth");
          const remainingQuery = searchParams.toString();
          const cleanUrl = window.location.pathname + (remainingQuery ? `?${remainingQuery}` : "") + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      } catch (_) {}
    }
    handleGetMe();
  }, []);

  useEffect(() => {
    if (user) {
      handleGetCart().catch(() => {});
    }
  }, [user]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
