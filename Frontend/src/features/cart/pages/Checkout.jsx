import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useCart } from "../hook/useCart.js";
import { clearItems } from "../state/cart.Slice.js";

const CURRENCY_SYMBOLS = { INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥" };

/**
 * Dynamically loads the official Razorpay Checkout modal script if not already present.
 */
function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (typeof window !== "undefined" && window.Razorpay) {
            resolve(window.Razorpay);
            return;
        }
        const existingScript = document.getElementById("razorpay-checkout-script");
        if (existingScript) {
            existingScript.onload = () => resolve(window.Razorpay);
            return;
        }
        const script = document.createElement("script");
        script.id = "razorpay-checkout-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(window.Razorpay);
        script.onerror = () => {
            console.error("Failed to load Razorpay SDK");
            resolve(null);
        };
        document.body.appendChild(script);
    });
}

function resolveVariant(item) {
    if (item?.selectedVariant && typeof item.selectedVariant === "object") {
        return item.selectedVariant;
    }
    const product = item?.product;
    const variantId = item?.variant?._id ?? item?.variant;
    if (!product || variantId == null || !Array.isArray(product.variants)) {
        return null;
    }
    const variantIdStr = String(variantId);
    return product.variants.find((v) => String(v?._id) === variantIdStr) ?? null;
}

function resolvePrice(item, variantObj) {
    const priceObj = item?.price ?? variantObj?.price ?? item?.product?.price ?? {};
    const rawAmount = Number(priceObj?.amount ?? priceObj?.price ?? 0);
    const amount = Number.isFinite(rawAmount) && rawAmount >= 0 ? rawAmount : 0;
    const currency = priceObj?.currency || variantObj?.price?.currency || item?.product?.price?.currency || "INR";
    return { amount, currency };
}

const Checkout = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth?.user);
    const cartItems = useSelector((state) =>
        Array.isArray(state.cart?.items) ? state.cart.items : []
    );

    const {
        handleGetCart,
        handleCreateCartOrder,
        handleVerifyPayment,
        handlePaymentFailure,
    } = useCart();

    const [loadingCart, setLoadingCart] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [infoNotice, setInfoNotice] = useState("");
    const [orderPlaced, setOrderPlaced] = useState(null);

    // Delivery form state, prefilled with authenticated user info
    const [shippingForm, setShippingForm] = useState({
        fullname: "",
        contact: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });

    useEffect(() => {
        if (user) {
            setShippingForm((prev) => ({
                fullname: prev.fullname || user.fullname || user.name || "",
                contact: prev.contact || user.contact || "",
                address: prev.address || user.address || "",
                city: prev.city || user.city || "",
                state: prev.state || user.state || "",
                pincode: prev.pincode || user.pincode || "",
            }));
        }
    }, [user]);

    useEffect(() => {
        const fetchInitialCart = async () => {
            setLoadingCart(true);
            try {
                await handleGetCart();
            } catch (err) {
                console.error("Checkout cart fetch error:", err);
            } finally {
                setLoadingCart(false);
            }
        };
        fetchInitialCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingForm((prev) => ({ ...prev, [name]: value }));
        if (errorMessage) setErrorMessage("");
    };

    // Calculate subtotal and item count
    const { subtotal, itemCount, currency } = cartItems.reduce(
        (acc, item) => {
            const variantObj = resolveVariant(item);
            const { amount, currency: itemCur } = resolvePrice(item, variantObj);
            const qty = Math.max(1, Number(item?.quantity ?? 1) || 1);
            return {
                subtotal: acc.subtotal + amount * qty,
                itemCount: acc.itemCount + qty,
                currency: itemCur || acc.currency,
            };
        },
        { subtotal: 0, itemCount: 0, currency: "INR" }
    );

    const symbol = CURRENCY_SYMBOLS[currency] ?? "₹";

    const validateForm = () => {
        if (!shippingForm.fullname.trim()) return "Full name is required for delivery";
        if (!shippingForm.contact.trim()) return "Contact / Phone number is required";
        if (!shippingForm.address.trim()) return "Delivery street address is required";
        if (!shippingForm.city.trim()) return "City is required";
        if (!shippingForm.state.trim()) return "State is required";
        if (!shippingForm.pincode.trim()) return "PIN Code is required";
        return null;
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setInfoNotice("");

        const validationErr = validateForm();
        if (validationErr) {
            setErrorMessage(validationErr);
            return;
        }

        if (cartItems.length === 0) {
            setErrorMessage("Your cart is empty. Please add products before checking out.");
            return;
        }

        setSubmitting(true);

        try {
            // 1. Create order on server side
            const orderRes = await handleCreateCartOrder({
                shippingAddress: shippingForm,
            });

            if (!orderRes || !orderRes.order || !orderRes.keyId) {
                throw new Error(orderRes?.message || "Failed to initiate payment. Please try again.");
            }

            const { order: razorpayOrder, keyId, dbOrderId } = orderRes;

            // 2. Load Razorpay Checkout modal
            const Razorpay = await loadRazorpayScript();
            if (!Razorpay) {
                throw new Error("Unable to load Razorpay payment gateway. Please check your connection.");
            }

            // 3. Configure Razorpay modal options
            const options = {
                key: keyId,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency || "INR",
                name: "SNITCH",
                description: `Order #${razorpayOrder.id}`,
                order_id: razorpayOrder.id,
                prefill: {
                    name: shippingForm.fullname,
                    email: user?.email || "",
                    contact: shippingForm.contact,
                },
                theme: {
                    color: "#111113",
                },
                modal: {
                    ondismiss: async () => {
                        setSubmitting(false);
                        setInfoNotice("Payment cancelled. Your items remain in your cart.");
                        try {
                            await handlePaymentFailure({
                                razorpay_order_id: razorpayOrder.id,
                                dbOrderId,
                                reason: "Modal dismissed by user",
                            });
                        } catch (err) {
                            console.error("Record cancel error:", err);
                        }
                    },
                },
                handler: async (response) => {
                    setSubmitting(true);
                    setInfoNotice("Verifying payment security...");
                    try {
                        const verifyRes = await handleVerifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            dbOrderId,
                        });

                        if (verifyRes?.success) {
                            dispatch(clearItems());
                            setOrderPlaced(verifyRes.order || { razorpayOrderId: response.razorpay_order_id });
                            setInfoNotice("");
                        } else {
                            throw new Error(verifyRes?.message || "Payment verification failed.");
                        }
                    } catch (verifyErr) {
                        console.error("Verification error:", verifyErr);
                        setErrorMessage(
                            verifyErr.response?.data?.message ||
                            verifyErr.message ||
                            "Payment verification failed. Please contact support if amount was deducted."
                        );
                    } finally {
                        setSubmitting(false);
                    }
                },
            };

            const rzp = new Razorpay(options);
            rzp.on("payment.failed", async (response) => {
                setSubmitting(false);
                const reason = response.error?.description || "Payment failed at gateway";
                setErrorMessage(`Payment Failed: ${reason}`);
                try {
                    await handlePaymentFailure({
                        razorpay_order_id: razorpayOrder.id,
                        dbOrderId,
                        reason,
                    });
                } catch (e) {
                    console.error("Record payment failed error:", e);
                }
            });

            rzp.open();
        } catch (err) {
            console.error("Checkout submission error:", err);
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to initiate order. Please try again.";
            setErrorMessage(msg);
            setSubmitting(false);
        }
    };

    /* ── Render Order Placed Success View ── */
    if (orderPlaced) {
        return (
            <div
                className="min-h-screen font-[Plus_Jakarta_Sans] antialiased flex flex-col pt-28 pb-20 px-4 sm:px-6"
                style={{ background: "#111113" }}
            >
                <div className="max-w-2xl mx-auto w-full text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: 44 }}>
                            check_circle
                        </span>
                    </div>

                    <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
                            Order Confirmed
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                            Thank you for your order!
                        </h1>
                        <p className="text-sm text-white/50 max-w-md mx-auto">
                            Your payment has been verified and processed securely via Razorpay. We are preparing your shipment.
                        </p>
                    </div>

                    <div
                        className="rounded-2xl p-6 text-left space-y-4"
                        style={{
                            background: "rgba(24,24,28,0.7)",
                            border: "1px solid rgba(255,255,255,0.08)",
                        }}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                            <span className="text-xs text-white/40 uppercase tracking-wider">Order ID</span>
                            <span className="text-sm font-mono text-white/90">
                                {orderPlaced.razorpayOrderId || orderPlaced._id || "Confirmed"}
                            </span>
                        </div>

                        {orderPlaced.razorpayPaymentId && (
                            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                                <span className="text-xs text-white/40 uppercase tracking-wider">Payment ID</span>
                                <span className="text-sm font-mono text-emerald-400">
                                    {orderPlaced.razorpayPaymentId}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                            <span className="text-xs text-white/40 uppercase tracking-wider">Delivery To</span>
                            <span className="text-sm text-white/80 font-medium">
                                {shippingForm.fullname} ({shippingForm.city}, {shippingForm.pincode})
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/40 uppercase tracking-wider">Estimated Delivery</span>
                            <span className="text-sm text-white font-medium">
                                3–5 Business Days · Free Delivery
                            </span>
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/collections"
                            id="checkout-success-continue-btn"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:opacity-90 active:scale-[0.98] inline-flex items-center justify-center gap-2"
                            style={{ background: "#ffffff", color: "#111113" }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                                shopping_bag
                            </span>
                            Continue Shopping
                        </Link>
                        <Link
                            to="/"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm transition-all hover:bg-white/10 text-white/70 hover:text-white"
                            style={{ border: "1px solid rgba(255,255,255,0.14)" }}
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Render Empty Cart Guard ── */
    if (!loadingCart && cartItems.length === 0) {
        return (
            <div
                className="min-h-screen font-[Plus_Jakarta_Sans] antialiased flex flex-col items-center justify-center pt-28 pb-20 px-6 text-center"
                style={{ background: "#111113" }}
            >
                <div
                    className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                    style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                    }}
                >
                    <span className="material-symbols-outlined text-white/30" style={{ fontSize: 44 }}>
                        shopping_cart
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">No Items in Checkout</h1>
                <p className="text-sm text-white/50 max-w-sm mb-8 leading-relaxed">
                    Your shopping cart is currently empty. Add products from the collection to proceed with checkout.
                </p>
                <div className="flex items-center gap-4">
                    <Link
                        to="/collections"
                        id="checkout-empty-continue-btn"
                        className="px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{ background: "#ffffff", color: "#111113" }}
                    >
                        Continue Shopping
                    </Link>
                    <Link
                        to="/cart"
                        className="px-6 py-3.5 rounded-full font-semibold text-sm transition-all hover:bg-white/10 text-white/70"
                        style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                        View Cart
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen font-[Plus_Jakarta_Sans] antialiased flex flex-col pt-28 pb-28 px-4 sm:px-6 lg:px-8"
            style={{ background: "#111113" }}
        >
            <div className="max-w-7xl mx-auto w-full">
                {/* ── Breadcrumb & Navigation Header ── */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-white/[0.08]">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/cart"
                            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-white/60 hover:text-white transition"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                                arrow_back
                            </span>
                            Back to Cart
                        </Link>
                        <span className="text-white/20">/</span>
                        <span className="text-xs sm:text-sm font-semibold text-white">Checkout</span>
                    </div>

                    <Link
                        to="/collections"
                        id="checkout-continue-shopping-nav-btn"
                        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 transition-all hover:bg-white/10"
                        style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                            shopping_bag
                        </span>
                        <span>Continue Shopping</span>
                    </Link>
                </div>

                {/* ── Alerts & Notifications ── */}
                {errorMessage && (
                    <div
                        className="mb-6 px-4 py-3.5 rounded-2xl text-sm font-medium flex items-center justify-between gap-3"
                        style={{
                            background: "rgba(239,68,68,0.12)",
                            border: "1px solid rgba(239,68,68,0.25)",
                            color: "#f87171",
                        }}
                    >
                        <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined shrink-0" style={{ fontSize: 18 }}>
                                error
                            </span>
                            <span>{errorMessage}</span>
                        </div>
                        <button
                            onClick={() => setErrorMessage("")}
                            className="text-white/40 hover:text-white transition"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {infoNotice && (
                    <div
                        className="mb-6 px-4 py-3.5 rounded-2xl text-sm font-medium flex items-center justify-between gap-3"
                        style={{
                            background: "rgba(59,130,246,0.12)",
                            border: "1px solid rgba(59,130,246,0.25)",
                            color: "#93c5fd",
                        }}
                    >
                        <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined shrink-0 animate-spin" style={{ fontSize: 18 }}>
                                sync
                            </span>
                            <span>{infoNotice}</span>
                        </div>
                        <button
                            onClick={() => setInfoNotice("")}
                            className="text-white/40 hover:text-white transition"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* ── Two-Column Layout: Form (Left) & Summary (Right) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
                    {/* LEFT: Shipping / Delivery Form */}
                    <form
                        onSubmit={handlePlaceOrder}
                        className="rounded-3xl p-6 sm:p-8 space-y-6"
                        style={{
                            background: "rgba(24,24,28,0.65)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            backdropFilter: "blur(20px)",
                        }}
                    >
                        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-tight">
                                    Delivery Details
                                </h2>
                                <p className="text-xs text-white/40 mt-0.5">
                                    Enter your address for safe, prompt delivery.
                                </p>
                            </div>
                            <span className="material-symbols-outlined text-white/30" style={{ fontSize: 22 }}>
                                local_shipping
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="fullname"
                                    value={shippingForm.fullname}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Rahul Sharma"
                                    required
                                    className="w-full h-11 px-4 rounded-xl text-sm text-white bg-black/40 border border-white/10 focus:border-white/40 outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                                    Phone / Contact *
                                </label>
                                <input
                                    type="tel"
                                    name="contact"
                                    value={shippingForm.contact}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 9876543210"
                                    required
                                    className="w-full h-11 px-4 rounded-xl text-sm text-white bg-black/40 border border-white/10 focus:border-white/40 outline-none transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                                Street Address *
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={shippingForm.address}
                                onChange={handleInputChange}
                                placeholder="House / Flat No, Street, Landmark"
                                required
                                className="w-full h-11 px-4 rounded-xl text-sm text-white bg-black/40 border border-white/10 focus:border-white/40 outline-none transition"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={shippingForm.city}
                                    onChange={handleInputChange}
                                    placeholder="City"
                                    required
                                    className="w-full h-11 px-4 rounded-xl text-sm text-white bg-black/40 border border-white/10 focus:border-white/40 outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                                    State *
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={shippingForm.state}
                                    onChange={handleInputChange}
                                    placeholder="State"
                                    required
                                    className="w-full h-11 px-4 rounded-xl text-sm text-white bg-black/40 border border-white/10 focus:border-white/40 outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                                    PIN Code *
                                </label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={shippingForm.pincode}
                                    onChange={handleInputChange}
                                    placeholder="PIN Code"
                                    required
                                    className="w-full h-11 px-4 rounded-xl text-sm text-white bg-black/40 border border-white/10 focus:border-white/40 outline-none transition"
                                />
                            </div>
                        </div>

                        {/* Payment Method Banner */}
                        <div
                            className="p-4 rounded-2xl flex items-center justify-between"
                            style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white/70" style={{ fontSize: 20 }}>
                                        lock
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Razorpay Secure Checkout</p>
                                    <p className="text-xs text-white/40">Cards, UPI, NetBanking, Wallets · 256-bit Encrypted</p>
                                </div>
                            </div>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Verified
                            </span>
                        </div>

                        {/* Desktop Place Order Button */}
                        <div className="hidden lg:block pt-2">
                            <button
                                type="submit"
                                id="checkout-pay-button"
                                disabled={submitting || loadingCart}
                                className="w-full h-14 rounded-full flex items-center justify-center gap-2.5 font-bold text-sm uppercase tracking-wider transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                style={{
                                    background: "#ffffff",
                                    color: "#111113",
                                    boxShadow: "0 8px 30px -4px rgba(255,255,255,0.2)",
                                }}
                            >
                                {submitting ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>
                                            sync
                                        </span>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Pay {symbol}{subtotal.toLocaleString("en-IN")} via Razorpay</span>
                                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                                            arrow_forward
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* RIGHT: Order Review & Pricing Summary */}
                    <div
                        className="rounded-3xl p-6 sm:p-7 space-y-6"
                        style={{
                            background: "rgba(24,24,28,0.65)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            backdropFilter: "blur(20px)",
                        }}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                            <h2 className="text-base font-bold text-white tracking-tight">
                                Order Summary ({itemCount} {itemCount === 1 ? "item" : "items"})
                            </h2>
                            <Link to="/cart" className="text-xs text-white/50 hover:text-white transition">
                                Edit
                            </Link>
                        </div>

                        {/* Items preview list */}
                        <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                            {cartItems.map((item, idx) => {
                                const variantObj = resolveVariant(item);
                                const { amount } = resolvePrice(item, variantObj);
                                const qty = Math.max(1, Number(item?.quantity ?? 1) || 1);
                                const coverImg =
                                    variantObj?.images?.[0]?.url ||
                                    item.product?.images?.[0]?.url ||
                                    null;
                                const itemSubtotal = amount * qty;

                                return (
                                    <div key={item._id || idx} className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-14 rounded-xl overflow-hidden shrink-0 bg-white/5 border border-white/5"
                                        >
                                            {coverImg ? (
                                                <img
                                                    src={coverImg}
                                                    alt={item.product?.title || "Item"}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                                                        checkroom
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">
                                                {item.product?.title || "Product"}
                                            </p>
                                            <p className="text-xs text-white/40 mt-0.5">
                                                Qty: {qty} · {symbol}{amount.toLocaleString("en-IN")} each
                                            </p>
                                        </div>

                                        <span className="text-sm font-semibold text-white/90 shrink-0">
                                            {symbol}{itemSubtotal.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="border-t border-white/[0.08] pt-4 space-y-2.5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/50">Subtotal</span>
                                <span className="text-white font-medium">
                                    {symbol}{subtotal.toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/50">Delivery</span>
                                <span className="text-emerald-400 font-medium">FREE</span>
                            </div>

                            <div className="flex items-center justify-between text-base font-bold text-white pt-2 border-t border-white/[0.06]">
                                <span>Total Payable</span>
                                <span>{symbol}{subtotal.toLocaleString("en-IN")}</span>
                            </div>
                        </div>

                        {/* Continue Shopping button in summary */}
                        <Link
                            to="/collections"
                            id="checkout-summary-continue-btn"
                            className="w-full h-11 rounded-full flex items-center justify-center gap-2 font-semibold text-xs uppercase tracking-wider transition-all hover:bg-white/10"
                            style={{
                                color: "rgba(255,255,255,0.7)",
                                border: "1px solid rgba(255,255,255,0.14)",
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                                arrow_back
                            </span>
                            <span>Continue Shopping</span>
                        </Link>

                        {/* Mobile Submit Button */}
                        <div className="lg:hidden pt-2">
                            <button
                                onClick={handlePlaceOrder}
                                id="checkout-pay-button-mobile"
                                disabled={submitting || loadingCart}
                                className="w-full h-14 rounded-full flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-wider transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                                style={{
                                    background: "#ffffff",
                                    color: "#111113",
                                    boxShadow: "0 8px 30px -4px rgba(255,255,255,0.2)",
                                }}
                            >
                                {submitting ? "Processing..." : `Pay ${symbol}${subtotal.toLocaleString("en-IN")} via Razorpay`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
