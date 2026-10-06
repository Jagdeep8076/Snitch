import { addItem ,getCart} from "../state/service/cart.api.js";
import { useDispatch } from "react-redux";
import { addItem as addItemToCart ,setItems} from "../state/cart.Slice.js";

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

async function handleGetCart() {
    const data = await getCart()
    dispatch(setItems(data.cart.items))
}

    return { handleAddItem, handleGetCart };
};