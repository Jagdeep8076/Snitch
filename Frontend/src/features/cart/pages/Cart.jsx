import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useCart } from "../hook/useCart.js";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const CURRENCY_SYMBOLS = { INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥" };

/**
 * Safely resolve a variant object from an already-populated product.
 * item.variant is a string (the ObjectId stored in cart.items[].variant).
 * product.variants is an array of subdocuments; after JSON serialisation each
 * subdoc has _id as a plain string.
 */
function resolveVariant(item) {
    const product = item?.product;
    if (!product || !item.variant) return null;
    const variantIdStr = String(item.variant);
    return (
        product.variants?.find(
            (v) => String(v._id) === variantIdStr
        ) ?? null
    );
}

/**
 * Build a human-readable attribute string from a variant.
 * The attributes field is a Mongoose Map, which serialises to a plain object
 * in JSON.  We handle both Map (with .entries()) and plain object.
 */
function getVariantAttrsDisplay(variant) {
    if (!variant?.attributes) return null;
    let entries;
    if (typeof variant.attributes.entries === "function") {
        // Still a Map instance (unlikely after JSON round-trip but safe)
        entries = Array.from(variant.attributes.entries());
    } else {
        entries = Object.entries(variant.attributes);
    }
    if (!entries.length) return null;
    return entries.map(([k, v]) => `${k}: ${v}`).join("  ·  ");
}

/**
 * Derive the correct unit price for a cart item.
 * Priority: item.price (stored at add-to-cart time) → variant.price → product.price
 */
function resolvePrice(item, variantObj) {
    const priceObj =
        item.price ??
        variantObj?.price ??
        item.product?.price ??
        {};
    const amount = Number(priceObj?.amount ?? 0);
    const currency = priceObj?.currency ?? "INR";
    const mrp = priceObj?.mrp ? Number(priceObj.mrp) : null;
    return { amount, currency, mrp };
}

/* ─────────────────────────────────────────────────────────────────────────────
   CART ITEM CARD
───────────────────────────────────────────────────────────────────────────── */
const CartItemCard = ({ item, index, onQuantityChange, onRemove }) => {
    const [updating, setUpdating] = useState(false);
    const cardRef = useRef(null);

    const product = item?.product ?? {};
    const variantObj = resolveVariant(item);

    /* ── Images ── */
    const coverImage =
        variantObj?.images?.[0]?.url ??
        product?.images?.[0]?.url ??
        null;

    const title = product?.title ?? "Product";

    /* ── Price ── */
    const { amount: price, currency, mrp } = resolvePrice(item, variantObj);
    const symbol = CURRENCY_SYMBOLS[currency] ?? "₹";

    /* ── Quantity & stock ── */
    const qty = item.quantity ?? 1;
    const stock = variantObj?.stock ?? Infinity;
    const subtotal = price * qty;

    /* ── Variant display ── */
    const variantAttrs = getVariantAttrsDisplay(variantObj);

    /* ── Handlers ── */
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
        if (stock !== Infinity && qty >= stock) {
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
            className="cart-item-card flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl relative"
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
                <p className="text-sm font-semibold text-white leading-snug line-clamp-2">
                    {title}
                </p>

                {/* Variant attributes badge */}
                {variantAttrs && (
                    <span
                        className="self-start px-2.5 py-0.5 rounded-full text-[10px] font-medium"
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "rgba(255,255,255,0.6)",
                            whiteSpace: "nowrap",
                            maxWidth: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {variantAttrs}
                    </span>
                )}

                {/* Unit price × qty */}
                <div className="flex flex-col gap-0.5 mt-1">
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {symbol}{price.toLocaleString("en-IN")} × {qty}
                    </span>
                    {mrp > price && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] line-through" style={{ color: "rgba(255,255,255,0.3)" }}>
                                {symbol}{mrp.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1 rounded">
                                SAVE {Math.round(((mrp - price) / mrp) * 100)}%
                            </span>
                        </div>
                    )}
                </div>

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
                        aria-label="Decrease quantity"
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
                        disabled={(stock !== Infinity && qty >= stock) || updating}
                        className="w-8 h-8 flex items-center justify-center transition-colors hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                        aria-label="Increase quantity"
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
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 flex items-center justify-center rounded-full transition-all hover:bg-red-500/20 disabled:opacity-40"
                style={{ color: "rgba(255,255,255,0.3)" }}
                title="Remove item"
                aria-label="Remove item"
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
        {[1, 2, 3].map((i) => (
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
   ORDER SUMMARY PANEL
───────────────────────────────────────────────────────────────────────────── */
const OrderSummary = ({ cartItems, itemCount, onCheckout, loading }) => {
    let totalMrp = 0;
    const subtotal = cartItems.reduce((acc, item) => {
        const variantObj = resolveVariant(item);
        const { amount, mrp } = resolvePrice(item, variantObj);
        const qty = item.quantity ?? 1;
        if (mrp && mrp > amount) {
            totalMrp += mrp * qty;
        } else {
            totalMrp += amount * qty;
        }
        return acc + amount * qty;
    }, 0);
    const discount = totalMrp - subtotal;

    const deliveryFee = 0;
    const total = subtotal + deliveryFee;

    // Determine currency symbol from first item
    const firstItem = cartItems[0];
    const firstVariant = firstItem ? resolveVariant(firstItem) : null;
    const { currency } = firstItem ? resolvePrice(firstItem, firstVariant) : { currency: "INR" };
    const symbol = CURRENCY_SYMBOLS[currency] ?? "₹";

    return (
        <div
            className="rounded-2xl p-5 space-y-4 sticky top-24"
            style={{
                background: "rgba(24,24,28,0.65)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.06)",
            }}
        >
            {/* Header */}
            <h2 className="text-[15px] font-semibold text-white">Order Summary</h2>

            {/* Per-item breakdown */}
            <div className="space-y-2">
                {cartItems.map((item) => {
                    const variantObj = resolveVariant(item);
                    const { amount } = resolvePrice(item, variantObj);
                    const qty = item.quantity ?? 1;
                    const title = item.product?.title ?? "Product";
                    const itemSubtotal = amount * qty;
                    return (
                        <div key={item._id} className="flex items-start justify-between gap-2">
                            <span
                                className="text-xs leading-snug flex-1 min-w-0 truncate"
                                style={{ color: "rgba(255,255,255,0.45)" }}
                                title={title}
                            >
                                {title} × {qty}
                            </span>
                            <span className="text-xs font-medium text-white shrink-0">
                                {symbol}{itemSubtotal.toLocaleString("en-IN")}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

            {/* Subtotal row */}
            <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
                <span className="text-sm font-medium text-white">
                    {symbol}{totalMrp.toLocaleString("en-IN")}
                </span>
            </div>

            {/* Discount row */}
            {discount > 0 && (
                <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Discount
                    </span>
                    <span className="text-sm font-semibold" style={{ color: "#4ade80" }}>
                        -{symbol}{discount.toLocaleString("en-IN")}
                    </span>
                </div>
            )}

            {/* Delivery row */}
            <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Delivery
                </span>
                <span className="text-sm font-semibold" style={{ color: "#4ade80" }}>
                    FREE
                </span>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

            {/* Total */}
            <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-white">Total</span>
                <span className="text-lg font-bold text-white">
                    {symbol}{total.toLocaleString("en-IN")}
                </span>
            </div>

            {/* Footnote */}
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                Inclusive of all taxes
            </p>

            {/* Checkout button (desktop panel) */}
            <button
                id="cart-checkout-btn-panel"
                onClick={onCheckout}
                disabled={loading}
                className="w-full h-12 rounded-full flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wider transition-all hover:opacity-90 active:scale-[0.99] mt-2"
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

            {/* Delivery info */}
            <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{
                    background: "rgba(74,222,128,0.05)",
                    border: "1px solid rgba(74,222,128,0.12)",
                }}
            >
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: 16, color: "#4ade80" }}>
                    local_shipping
                </span>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Free delivery · Estimated 3–5 business days
                </p>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN CART PAGE
───────────────────────────────────────────────────────────────────────────── */
const Cart = () => {
    const cartItems = useSelector((state) => state.cart.items);
    const { handleGetCart, handleUpdateQuantity, handleRemoveItem, handleClearCart } = useCart();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [clearingCart, setClearingCart] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const navRef = useRef(null);
    const contentRef = useRef(null);

    /* ── Fetch cart on mount ── */
    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            setErrorMsg("");
            try {
                await handleGetCart();
            } catch (err) {
                console.error("Cart fetch error:", err);
                setErrorMsg("Failed to load cart. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const handleQuantityChange = useCallback(
        async (itemId, newQuantity) => {
            try {
                setErrorMsg("");
                await handleUpdateQuantity({ itemId, quantity: newQuantity });
            } catch (err) {
                const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to update quantity";
                setErrorMsg(msg);
                // Auto-clear after 4 s
                setTimeout(() => setErrorMsg(""), 4000);
            }
        },
        [handleUpdateQuantity]
    );

    const handleRemove = useCallback(
        async (itemId) => {
            try {
                setErrorMsg("");
                await handleRemoveItem({ itemId });
            } catch (err) {
                const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to remove item";
                setErrorMsg(msg);
                setTimeout(() => setErrorMsg(""), 4000);
            }
        },
        [handleRemoveItem]
    );

    const handleClearAll = async () => {
        if (!window.confirm("Remove all items from your cart?")) return;
        setClearingCart(true);
        setErrorMsg("");
        try {
            await handleClearCart();
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to clear cart";
            setErrorMsg(msg);
            setTimeout(() => setErrorMsg(""), 4000);
        } finally {
            setClearingCart(false);
        }
    };

    /* ── Derived totals ── */
    const itemCount = cartItems?.length ?? 0;
    const totalQty = cartItems.reduce((acc, item) => acc + (item.quantity ?? 1), 0);

    return (
        <div
            className="min-h-screen font-[Plus_Jakarta_Sans] antialiased flex flex-col"
            style={{ background: "#111113" }}
        >
            {/* ═══════════════════════════════════════════════════════
                TOP NAV BAR (back button + badge)
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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
                MAIN CONTENT — responsive two-column layout
            ═══════════════════════════════════════════════════════ */}
            <main
                ref={contentRef}
                className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-24 pb-36"
            >
                {/* Error banner */}
                {errorMsg && (
                    <div
                        className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
                        style={{
                            background: "rgba(239,68,68,0.12)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            color: "#f87171",
                        }}
                    >
                        {errorMsg}
                    </div>
                )}

                {loading ? (
                    <CartSkeleton />
                ) : cartItems.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <>
                        {/* ── Section label + Clear all ── */}
                        <div className="flex items-center justify-between mb-4">
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

                        {/* ── Responsive two-column grid ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-6 items-start">

                            {/* LEFT — Cart items list */}
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

                            {/* RIGHT — Order Summary (hidden on mobile; mobile gets fixed bottom bar) */}
                            <div className="hidden lg:block">
                                <OrderSummary
                                    cartItems={cartItems}
                                    itemCount={itemCount}
                                    onCheckout={() => navigate("/checkout")}
                                    loading={loading}
                                />
                            </div>
                        </div>

                        {/* Mobile order summary — shows below items on small screens */}
                        <div className="lg:hidden mt-6">
                            <OrderSummary
                                cartItems={cartItems}
                                itemCount={itemCount}
                                onCheckout={() => navigate("/checkout")}
                                loading={loading}
                            />
                        </div>
                    </>
                )}
            </main>

            {/* ═══════════════════════════════════════════════════════
                FIXED MOBILE CHECKOUT BUTTON (hidden on lg+)
            ═══════════════════════════════════════════════════════ */}
            {!loading && cartItems.length > 0 && (
                <div
                    className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-8 pt-4"
                    style={{
                        background:
                            "linear-gradient(to top, rgba(17,17,19,1) 60%, rgba(17,17,19,0))",
                    }}
                >
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
            )}
        </div>
    );
};

export default Cart;
