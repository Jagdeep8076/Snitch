import { useDispatch } from "react-redux";
import { createProduct, getSellerProducts, getAllProducts} from "../services/product.api.js";
import { setSellerProducts, setProducts } from "../state/product.slice";

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

  async function handleGetAllProducts(){
    try {
      const data = await getAllProducts()
      dispatch(setProducts(data.products))
      return data.products
    } catch (error) {
      console.error("GET ALL PRODUCTS ERROR:", error)
      dispatch(setProducts([]))
      throw error
    }
  }

  return {
    handleCreateProduct,
    handleGetSellerProduct,
    handleGetAllProducts,
  };
};