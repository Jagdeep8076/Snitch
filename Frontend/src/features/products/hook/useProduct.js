import { useDispatch } from "react-redux";
import { createProduct, getSellerProducts } from "../services/product.api.js";
import { setSellerProducts } from "../state/product.slice";

export const useProduct = () => {
  const dispatch = useDispatch();

  async function handleCreateProduct(formData) {
    try {
      const data = await createProduct(formData);
      return data.product;
    } catch (error) {
      console.error("CREATE PRODUCT ERROR:", error);
      throw error;
    }
  }

  async function handleGetSellerProduct() {
    try {
      const data = await getSellerProducts();
      dispatch(setSellerProducts(data.products));
      return data.products;
    } catch (error) {
      console.error("GET SELLER PRODUCTS ERROR:", error);
      dispatch(setSellerProducts([]));
      throw error;
    }
  }

  return {
    handleCreateProduct,
    handleGetSellerProduct,
  };
};