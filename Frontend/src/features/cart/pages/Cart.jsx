import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useCart } from "../hook/useCart.js";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";

/* ─────────────────────────────────────────────────────────────────────────────
   CART ITEM CARD — fully wired to backend via useCart
───────────────────────────────────────────────────────────────────────────── */
const CartItemCard = ({ item, index, onQuantityChange, onRemove }) => {
    const [updating, setUpdating] = useState(false);
    const cardRef = useRef(null);

    const product = item.product || {};
    // Resolve variant from product.variants using item.variant id
    const variantId = item.variant;
    const variantObj = product?.variants?.find(v => v._id === variantId || v._id?.toString() === variantId?.toString());

    const coverImage =
        variantObj?.images?.[0]?.url ||
        product?.images?.[0]?.url ||
        null;

    const title = product?.title ?? "Product";

    // Price: prefer the stored item.price, fallback to variant price, then product price
    const priceObj = item.price || variantObj?.price || product?.price || {};
    const price = Number(priceObj?.amount ?? priceObj ?? 0);
    const currency = priceObj?.currency ?? "INR";

    const qty = item.quantity ?? 1;

    const symbols = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
    const symbol = symbols[currency] ?? "₹";

    // Variant display attributes
    const variantAttrs = variantObj?.attributes
        ? Object.entries(variantObj.attributes).map(([k, v]) => `${k}: ${v}`).join(", ")
        : null;

    const stock = variantObj?.stock ?? Infinity;
    const subtotal = price * qty;

    const handleMinus = async () => {
        if (qty <= 1 || updating) return;
        setUpdating(true);
        try {
            await onQuantityChange(item._id, qty - 1);
        } finally {
            setUpdating(false);
        }
    };

    const handlePlus = async () => {
        if (updating) return;
        if (qty >= stock) {
            alert(`Only ${stock} items available in stock.`);
            return;
        }
        setUpdating(true);
        try {
            await onQuantityChange(item._id, qty + 1);
        } finally {
            setUpdating(false);
        }
    };

    const handleRemove = async () => {
        if (updating) return;
        setUpdating(true);
        try {
            await onRemove(item._id);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div
            ref={cardRef}
            className="cart-item-card flex gap-3.5 p-4 rounded-2xl relative"
            style={{
                background: "rgba(24,24,28,0.65)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.06)",
                opacity: updating ? 0.6 : 1,
                transition: "opacity 0.2s",
            }}
        >
            {/* Product Image */}
            <div
                className="rounded-xl overflow-hidden shrink-0"
                style={{ width: 72, height: 90 }}
            >
                {coverImage ? (
                    <img
                        src={coverImage}
                        alt={title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 28, color: "rgba(255,255,255,0.2)" }}
                        >
                            checkroom
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-8">
                {/* Title */}
                <p className="text-sm font-semibold text-white truncate">{title}</p>

                {/* Variant attributes */}
                {variantAttrs && (
                    <span
                        className="self-start px-2.5 py-0.5 rounded-full text-[10px] font-medium"
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "rgba(255,255,255,0.6)",
                        }}
                    >
                        {variantAttrs}
                    </span>
                )}

                {/* Unit price */}
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {symbol}{price.toLocaleString("en-IN")} × {qty}
                </span>

                {/* Subtotal */}
                <span className="text-base font-bold text-white">
                    {symbol}{subtotal.toLocaleString("en-IN")}
                </span>

                {/* Quantity Stepper */}
                <div
                    className="flex items-center gap-0 self-start mt-1 rounded-full overflow-hidden"
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                    }}
                >
                    <button
                        id={`cart-qty-minus-${index}`}
                        onClick={handleMinus}
                        disabled={qty <= 1 || updating}
                        className="w-8 h-8 flex items-center justify-center transition-colors hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                            remove
                        </span>
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-white select-none">
                        {updating ? "…" : qty}
                    </span>
                    <button
                        id={`cart-qty-plus-${index}`}
                        onClick={handlePlus}
                        disabled={qty >= stock || updating}
                        className="w-8 h-8 flex items-center justify-center transition-colors hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                            add
                        </span>
                    </button>
                </div>
            </div>

            {/* Delete button */}
            <button
                id={`cart-delete-${index}`}
                onClick={handleRemove}
                disabled={updating}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-white/10 disabled:opacity-40"
                style={{ color: "rgba(255,255,255,0.3)" }}
                title="Remove item"
            >
                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>
                    delete
                </span>
            </button>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   EMPTY CART STATE
───────────────────────────────────────────────────────────────────────────── */
const EmptyCart = () => (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 py-20 px-6">
        <div className="relative">
            <div
                className="w-28 h-28 rounded-full flex items-center justify-center"
                style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 0 48px -12px rgba(255,255,255,0.06)",
                }}
            >
                <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 52, color: "rgba(255,255,255,0.2)" }}
                >
                    shopping_bag
                </span>
            </div>
        </div>

        <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-white">Your cart is empty</h2>
            <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.4)" }}
            >
                Looks like you haven&apos;t added anything yet.
                <br />
                Browse the collection and find your fit.
            </p>
        </div>

        <Link
            to="/collections"
            id="cart-shop-now-btn"
            className="px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
                background: "#ffffff",
                color: "#111113",
            }}
        >
            Continue Shopping
        </Link>
    </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   SKELETON LOADER
───────────────────────────────────────────────────────────────────────────── */
const CartSkeleton = () => (
    <div className="space-y-4">
        {[1, 2].map((i) => (
            <div
                key={i}
                className="flex gap-3.5 p-4 rounded-2xl"
                style={{
                    background: "rgba(24,24,28,0.65)",
                    border: "1px solid rgba(255,255,255,0.06)",
                }}
            >
                <div
                    className="rounded-xl shrink-0 animate-pulse"
                    style={{
                        width: 72,
                        height: 90,
                        background: "rgba(255,255,255,0.06)",
                    }}
                />
                <div className="flex-1 space-y-3 pt-1">
                    <div className="h-4 rounded-full w-40 animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <div className="h-3 rounded-full w-20 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
                    <div className="h-5 rounded-full w-16 animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <div className="h-8 rounded-full w-24 animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
                </div>
            </div>
        ))}
    </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN CART PAGE
───────────────────────────────────────────────────────────────────────────── */
const Cart = () => {
    const cartItems = useSelector((state) => state.cart.items);
    const { handleGetCart, handleUpdateQuantity, handleRemoveItem, handleClearCart } = useCart();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [clearingCart, setClearingCart] = useState(false);

    const navRef = useRef(null);
    const contentRef = useRef(null);

    /* ── Fetch cart on mount ── */
    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                await handleGetCart();
            } catch (err) {
                console.error("Cart fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    /* ── GSAP entrance ── */
    useEffect(() => {
        if (navRef.current) {
            gsap.fromTo(
                navRef.current,
                { y: -60, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
            );
        }
        if (contentRef.current) {
            gsap.fromTo(
                contentRef.current,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.15 }
            );
        }
    }, []);

    /* ── GSAP card stagger after load ── */
    useEffect(() => {
        if (!loading && cartItems?.length > 0) {
            gsap.fromTo(
                ".cart-item-card",
                { opacity: 0, y: 30, scale: 0.97 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.45,
                    stagger: 0.08,
                    ease: "power3.out",
                    delay: 0.1,
                }
            );
        }
    }, [loading, cartItems]);

    /* ── Handlers ── */
    const handleQuantityChange = useCallback(async (itemId, newQuantity) => {
        try {
            await handleUpdateQuantity({ itemId, quantity: newQuantity });
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Update failed";
            alert(msg);
        }
    }, [handleUpdateQuantity]);

    const handleRemove = useCallback(async (itemId) => {
        try {
            await handleRemoveItem({ itemId });
        } catch (err) {
            console.error("Remove failed:", err);
        }
    }, [handleRemoveItem]);

    const handleClearAll = async () => {
        if (!window.confirm("Remove all items from your cart?")) return;
        setClearingCart(true);
        try {
            await handleClearCart();
        } catch (err) {
            console.error("Clear cart failed:", err);
        } finally {
            setClearingCart(false);
        }
    };

    /* ── Order totals ── */
    const subtotal = cartItems.reduce((acc, item) => {
        const priceObj = item.price || {};
        const price = Number(priceObj?.amount ?? 0);
        const qty = item.quantity ?? 1;
        return acc + price * qty;
    }, 0);

    const deliveryFee = 0; // free delivery
    const total = subtotal + deliveryFee;
    const itemCount = cartItems?.length ?? 0;
    // Total quantity across all items (for badge)
    const totalQty = cartItems.reduce((acc, item) => acc + (item.quantity ?? 1), 0);

    return (
        <div
            className="min-h-screen font-[Plus_Jakarta_Sans] antialiased flex flex-col"
            style={{ background: "#111113" }}
        >
            {/* ═══════════════════════════════════════════════════════
                NAVIGATION BAR (inside cart page - back button + badge)
            ═══════════════════════════════════════════════════════ */}
            <header
                ref={navRef}
                className="fixed top-0 left-0 right-0 z-40"
                style={{
                    background: "rgba(17,17,19,0.85)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
            >
                <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Back + Title */}
                    <div className="flex items-center gap-3">
                        <button
                            id="cart-back-btn"
                            onClick={() => navigate(-1)}
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-white/[0.06]"
                            style={{ color: "rgba(255,255,255,0.6)" }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                                arrow_back
                            </span>
                        </button>
                        <h1 className="text-lg font-semibold text-white tracking-tight">
                            My Cart
                        </h1>
                    </div>

                    {/* Cart badge */}
                    {totalQty > 0 && (
                        <div className="relative">
                            <span className="material-symbols-outlined text-white/60" style={{ fontSize: 22 }}>
                                shopping_bag
                            </span>
                            <span
                                className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-black"
                                style={{ background: "#ffffff", padding: "0 3px" }}
                            >
                                {totalQty}
                            </span>
                        </div>
                    )}
                </div>
            </header>

            {/* ═══════════════════════════════════════════════════════
                MAIN CONTENT
            ═══════════════════════════════════════════════════════ */}
            <main
                ref={contentRef}
                className="flex-1 max-w-lg mx-auto w-full px-4 pt-24 pb-36 flex flex-col gap-4"
            >
                {loading ? (
                    <CartSkeleton />
                ) : cartItems.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <>
                        {/* ── Section label ── */}
                        <div className="flex items-center justify-between">
                            <span
                                className="text-xs font-bold uppercase tracking-[0.18em]"
                                style={{ color: "rgba(255,255,255,0.3)" }}
                            >
                                {itemCount} {itemCount === 1 ? "Item" : "Items"}
                            </span>
                            <button
                                id="cart-clear-all-btn"
                                onClick={handleClearAll}
                                disabled={clearingCart}
                                className="text-xs font-medium transition-colors hover:text-white/70 disabled:opacity-50"
                                style={{ color: "rgba(255,255,255,0.35)" }}
                            >
                                {clearingCart ? "Clearing..." : "Clear all"}
                            </button>
                        </div>

                        {/* ── Cart Items ── */}
                        <div className="flex flex-col gap-3">
                            {cartItems.map((item, i) => (
                                <CartItemCard
                                    key={item._id ?? i}
                                    item={item}
                                    index={i}
                                    onQuantityChange={handleQuantityChange}
                                    onRemove={handleRemove}
                                />
                            ))}
                        </div>

                        {/* ── Order Summary Card ── */}
                        <div
                            className="rounded-2xl p-5 space-y-4"
                            style={{
                                background: "rgba(24,24,28,0.65)",
                                backdropFilter: "blur(16px)",
                                WebkitBackdropFilter: "blur(16px)",
                                border: "1px solid rgba(255,255,255,0.06)",
                            }}
                        >
                            {/* Header */}
                            <h2 className="text-[15px] font-semibold text-white">Order Summary</h2>

                            {/* Rows */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                                        Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                                    </span>
                                    <span className="text-sm font-medium text-white">
                                        ₹{subtotal.toLocaleString("en-IN")}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                                        Delivery
                                    </span>
                                    <span className="text-sm font-semibold" style={{ color: "#4ade80" }}>
                                        FREE
                                    </span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

                            {/* Total */}
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-white">Total</span>
                                <span className="text-lg font-bold text-white">
                                    ₹{total.toLocaleString("en-IN")}
                                </span>
                            </div>

                            {/* Footnote */}
                            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                                Inclusive of all taxes
                            </p>
                        </div>

                        {/* ── Delivery Info ── */}
                        <div
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                            style={{
                                background: "rgba(74,222,128,0.05)",
                                border: "1px solid rgba(74,222,128,0.12)",
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#4ade80" }}>
                                local_shipping
                            </span>
                            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                                Free delivery on your order · Estimated 3–5 business days
                            </p>
                        </div>
                    </>
                )}
            </main>

            {/* ═══════════════════════════════════════════════════════
                FIXED CHECKOUT BUTTON
            ═══════════════════════════════════════════════════════ */}
            {!loading && cartItems.length > 0 && (
                <div
                    className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-8 pt-4"
                    style={{
                        background:
                            "linear-gradient(to top, rgba(17,17,19,1) 60%, rgba(17,17,19,0))",
                    }}
                >
                    <div className="max-w-lg mx-auto">
                        <button
                            id="cart-checkout-btn"
                            onClick={() => navigate("/checkout")}
                            className="w-full h-14 rounded-full flex items-center justify-center gap-2.5 font-bold text-sm uppercase tracking-wider transition-all hover:opacity-92 active:scale-[0.99]"
                            style={{
                                background: "#ffffff",
                                color: "#111113",
                                boxShadow: "0 8px 24px -4px rgba(0,0,0,0.5)",
                            }}
                        >
                            Proceed to Checkout
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                                arrow_forward
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
