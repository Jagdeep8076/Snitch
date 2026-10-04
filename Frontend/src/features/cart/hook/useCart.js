import { addItem } from "../state/service/cart.api.js";
import { useDispatch } from "react-redux";
import { addItem as addItemToCart } from "../state/cart.Slice.js";

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleAddItem({ productId, variantId }) {
        const data = await addItem({
            productId,
            variantId
        });

        dispatch(addItemToCart(data));

        return data;
    }

    return { handleAddItem };
};