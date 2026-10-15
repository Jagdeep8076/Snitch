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
    handleGetMe();
  }, []);

  useEffect(() => {
    if (user && user.role !== 'seller') {
      handleGetCart().catch(() => {});
    }
  }, [user]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
