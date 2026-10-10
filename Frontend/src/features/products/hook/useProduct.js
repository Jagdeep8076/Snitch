import { useDispatch } from "react-redux";
import { createProduct, getSellerProducts, getAllProducts, getProductById, addProductVariant, updateVariantStock, updateProductBasePrice, updateVariantPrice } from "../services/product.api.js";
import { setSellerProducts, setProducts } from "../state/product.slice";

export const useProduct = () => {

    const dispatch = useDispatch()

    async function handleCreateProduct(formData) {
        const data = await createProduct(formData)
        return data.product
    }

    async function handleGetSellerProduct() {
        const data = await getSellerProducts()
        dispatch(setSellerProducts(data.products))
        return data.products
    }

    async function handleGetAllProducts({ sort } = {}) {

        const data = await getAllProducts({ sort })
        dispatch(setProducts(data.products))
        return data.products
    }

    async function handleGetProductById(productId) {
        const data = await getProductById(productId)
        return data.product
    }

    async function handleAddProductVariant(productId, newProductVariant) {
        const data = await addProductVariant(productId, newProductVariant)

        return data
    }

    async function handleUpdateVariantStock(productId, variantId, stock) {
        const data = await updateVariantStock(productId, variantId, stock);
        return data;
    }

    async function handleUpdateProductBasePrice(productId, amount, currency, mrp) {
        const data = await updateProductBasePrice(productId, amount, currency, mrp);
        return data;
    }

    async function handleUpdateVariantPrice(productId, variantId, amount, currency, mrp) {
        const data = await updateVariantPrice(productId, variantId, amount, currency, mrp);
        return data;
    }

    return { 
        handleCreateProduct, 
        handleGetSellerProduct, 
        handleGetAllProducts, 
        handleGetProductById, 
        handleAddProductVariant, 
        handleUpdateVariantStock,
        handleUpdateProductBasePrice,
        handleUpdateVariantPrice
    }

}