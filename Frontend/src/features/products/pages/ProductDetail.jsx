import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useProduct } from '../hook/useProduct.js';
import { useCart } from '../../cart/hook/useCart.js';

const ADD_TO_CART_STATES = {
    IDLE: "idle",
    LOADING: "loading",
    SUCCESS: "success",
    ERROR: "error",
};

const CURRENCY_SYMBOLS = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
};

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((state) => state.auth?.user);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [addToCartState, setAddToCartState] = useState(ADD_TO_CART_STATES.IDLE);
    const [addToCartMsg, setAddToCartMsg] = useState("");

    const { handleGetProductById } = useProduct();
    const { handleAddItem } = useCart();
    const feedbackTimerRef = useRef(null);

    async function fetchProductDetails() {
        if (!productId) {
            setFetchError("Invalid product link");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setFetchError(null);
            const productData = await handleGetProductById(productId);
            if (!productData) {
                setFetchError("Product not found");
                setProduct(null);
            } else {
                setProduct(productData);
            }
        } catch (error) {
            console.error("Failed to fetch product details:", error);
            const msg = error?.response?.data?.message || error?.message || "Failed to load product details";
            setFetchError(msg);
            setProduct(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProductDetails();
        return () => {
            if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        };
    }, [productId]);

    const variants = useMemo(() => {
        return Array.isArray(product?.variants) ? product.variants : [];
    }, [product]);

    const hasVariants = variants.length > 0;

    // Initialize attributes to first variant's attributes if available
    useEffect(() => {
        if (hasVariants && variants[0]?.attributes) {
            const rawAttrs = variants[0].attributes;
            const initial = typeof rawAttrs.entries === "function"
                ? Object.fromEntries(rawAttrs.entries())
                : { ...rawAttrs };
            setSelectedAttributes(initial);
        } else {
            setSelectedAttributes({});
        }
    }, [hasVariants, variants]);

    // Match active variant based on selected attributes
    const activeVariant = useMemo(() => {
        if (!hasVariants) return null;

        const sKeys = Object.keys(selectedAttributes);

        // Try exact match on selected attributes
        const exactMatch = variants.find(v => {
            if (!v.attributes) return false;
            const vAttrs = typeof v.attributes.entries === "function"
                ? Object.fromEntries(v.attributes.entries())
                : v.attributes;

            const vKeys = Object.keys(vAttrs);
            if (vKeys.length !== sKeys.length) return false;
            return vKeys.every(k => String(vAttrs[k]) === String(selectedAttributes[k]));
        });

        if (exactMatch) return exactMatch;

        // Try partial match if any attributes are selected
        if (sKeys.length > 0) {
            const partial = variants.find(v => {
                if (!v.attributes) return false;
                const vAttrs = typeof v.attributes.entries === "function"
                    ? Object.fromEntries(v.attributes.entries())
                    : v.attributes;
                return sKeys.every(k => String(vAttrs[k]) === String(selectedAttributes[k]));
            });
            if (partial) return partial;
        }

        // Fallback to first variant with stock > 0, or first variant
        return variants.find(v => Number(v.stock ?? 0) > 0) || variants[0] || null;
    }, [hasVariants, variants, selectedAttributes]);

    // Available attribute options across all variants
    const availableAttributes = useMemo(() => {
        if (!hasVariants) return {};

        const attrs = {};
        variants.forEach(variant => {
            if (variant.attributes) {
                const entries = typeof variant.attributes.entries === "function"
                    ? Array.from(variant.attributes.entries())
                    : Object.entries(variant.attributes);

                entries.forEach(([key, value]) => {
                    if (!attrs[key]) attrs[key] = new Set();
                    if (value != null && value !== "") {
                        attrs[key].add(String(value));
                    }
                });
            }
        });

        const result = {};
        Object.keys(attrs).forEach(key => {
            result[key] = Array.from(attrs[key]);
        });

        return result;
    }, [hasVariants, variants]);

    // Reset image index when active variant changes
    useEffect(() => {
        setSelectedImage(0);
    }, [activeVariant]);

    const handleAttributeChange = (attrName, value) => {
        if (!hasVariants) return;

        setSelectedAttributes(prev => {
            if (prev[attrName] === value) {
                const newAttrs = { ...prev };
                delete newAttrs[attrName];
                return newAttrs;
            }
            return {
                ...prev,
                [attrName]: value
            };
        });
    };

    // Images resolution (variant images prioritized, then product images)
    const displayImages = useMemo(() => {
        const imagesMap = new Map();
        const addImg = (img) => {
            const url = typeof img === "string" ? img : img?.url;
            if (url && !imagesMap.has(url)) {
                imagesMap.set(url, { url });
            }
        };

        if (activeVariant?.images?.length > 0) {
            activeVariant.images.forEach(addImg);
        }

        if (product?.images?.length > 0) {
            product.images.forEach(addImg);
        }

        const combined = Array.from(imagesMap.values());
        return combined.length > 0 ? combined : [{ url: '/snitch_editorial_warm.png' }];
    }, [product, activeVariant]);

    // Safe, robust price derivation reconciling .price, .prices, or flat numeric formats
    const rawPrice = activeVariant?.price ?? activeVariant?.prices ?? product?.price ?? product?.prices;
    const displayPrice = useMemo(() => {
        if (!rawPrice) return { amount: 0, currency: "INR", mrp: null };
        if (typeof rawPrice === "number" || typeof rawPrice === "string") {
            const num = Number(rawPrice) || 0;
            return { amount: num, currency: "INR", mrp: null };
        }
        const amt = Number(rawPrice.amount ?? rawPrice.price ?? 0);
        const curr = rawPrice.currency || "INR";
        const rawMrp = rawPrice.mrp != null ? Number(rawPrice.mrp) : null;
        const mrp = Number.isFinite(rawMrp) && rawMrp > amt ? rawMrp : null;
        return { amount: amt, currency: curr, mrp };
    }, [rawPrice]);

    const isOutOfStock = hasVariants
        ? (Boolean(activeVariant) && Number(activeVariant.stock ?? 0) <= 0)
        : false;

    const canAddToCart = !isOutOfStock && (!hasVariants || Boolean(activeVariant));

    const handleAddToCart = async () => {
        if (!product?._id || !canAddToCart) return;
        if (addToCartState === ADD_TO_CART_STATES.LOADING) return;

        const effectiveVariantId = activeVariant?._id || "none";

        // Guest click check — if unauthenticated, redirect to Login preserving destination
        if (!user) {
            navigate("/login", {
                state: {
                    from: location,
                    action: "add_to_cart",
                    productId: product._id,
                    variantId: effectiveVariantId,
                },
            });
            return;
        }

        try {
            setAddToCartState(ADD_TO_CART_STATES.LOADING);
            setAddToCartMsg("");

            const data = await handleAddItem({
                productId: product._id,
                variantId: effectiveVariantId,
                quantity: 1,
            });

            if (data?.success) {
                setAddToCartState(ADD_TO_CART_STATES.SUCCESS);
                setAddToCartMsg("Added to cart ✓");
            } else {
                throw new Error(data?.message || "Failed to add to cart");
            }
        } catch (error) {
            console.error("Failed to add item to cart:", error);
            if (error?.response?.status === 401) {
                navigate("/login", {
                    state: {
                        from: location,
                        action: "add_to_cart",
                        productId: product._id,
                        variantId: effectiveVariantId,
                    },
                });
                return;
            }
            const msg = error?.response?.data?.message || error?.message || "Failed to add to cart";
            setAddToCartState(ADD_TO_CART_STATES.ERROR);
            setAddToCartMsg(msg);
        } finally {
            if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
            feedbackTimerRef.current = setTimeout(() => {
                setAddToCartState(ADD_TO_CART_STATES.IDLE);
                setAddToCartMsg("");
            }, 3000);
        }
    };

    // When returning from login after guest clicked Add to Cart
    const hasAutoAddedRef = useRef(false);
    useEffect(() => {
        if (
            !hasAutoAddedRef.current &&
            location.state?.action === "add_to_cart" &&
            user &&
            product &&
            canAddToCart
        ) {
            hasAutoAddedRef.current = true;
            handleAddToCart();
        }
    }, [user, product, canAddToCart]);

    const getAddToCartText = () => {
        if (isOutOfStock) return "Out of Stock";
        if (hasVariants && !activeVariant) return "Select an Option";
        switch (addToCartState) {
            case ADD_TO_CART_STATES.LOADING: return "Adding...";
            case ADD_TO_CART_STATES.SUCCESS: return "Added ✓";
            case ADD_TO_CART_STATES.ERROR: return "Failed — Try Again";
            default: return "Add to Cart";
        }
    };

    const getAddToCartBtnClass = () => {
        const base = "w-full h-12 rounded-full text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm transition-all duration-150 ";
        if (!canAddToCart) {
            return base + "bg-surface-container-high text-on-surface/40 cursor-not-allowed border border-surface-container-high";
        }
        if (addToCartState === ADD_TO_CART_STATES.SUCCESS) {
            return base + "bg-emerald-600 text-white cursor-default";
        }
        if (addToCartState === ADD_TO_CART_STATES.ERROR) {
            return base + "bg-red-600/80 text-white hover:opacity-90 active:scale-[0.99]";
        }
        if (addToCartState === ADD_TO_CART_STATES.LOADING) {
            return base + "bg-white text-black opacity-70 cursor-wait";
        }
        return base + "bg-white text-black hover:bg-white/90 active:scale-[0.99]";
    };

    const currencySymbol = CURRENCY_SYMBOLS[displayPrice?.currency] || displayPrice?.currency || "₹";

    /* Loading state */
    if (loading) {
        return (
            <div className="min-h-screen pb-24 bg-[#111113] text-on-surface antialiased font-[Plus_Jakarta_Sans]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 xl:px-24 pt-24 sm:pt-28">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
                        {/* Skeleton Image */}
                        <div className="w-full lg:w-[60%] aspect-[4/5] rounded-2xl border border-white/[0.06] bg-white/[0.03] animate-pulse" />
                        {/* Skeleton Details */}
                        <div className="w-full lg:w-[40%] space-y-6 pt-4">
                            <div className="h-4 w-24 bg-white/[0.06] rounded-full animate-pulse" />
                            <div className="h-10 w-3/4 bg-white/[0.08] rounded-xl animate-pulse" />
                            <div className="h-8 w-1/3 bg-white/[0.06] rounded-xl animate-pulse" />
                            <div className="h-px w-full bg-white/[0.06]" />
                            <div className="space-y-3">
                                <div className="h-4 w-full bg-white/[0.04] rounded-full animate-pulse" />
                                <div className="h-4 w-5/6 bg-white/[0.04] rounded-full animate-pulse" />
                            </div>
                            <div className="h-12 w-full bg-white/[0.08] rounded-full animate-pulse mt-8" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* Error or Product Not Found state */
    if (fetchError || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#111113] px-4 text-center font-[Plus_Jakarta_Sans]">
                <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                    <span className="material-symbols-outlined text-white/40" style={{ fontSize: "36px" }}>
                        inventory_2
                    </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {fetchError || "Product Not Found"}
                </h1>
                <p className="text-sm text-white/45 max-w-sm mb-8 leading-relaxed">
                    The fashion piece you are looking for is unavailable or does not exist. Browse our collections to find your fit.
                </p>
                <div className="flex items-center gap-4 flex-wrap justify-center">
                    <Link
                        to="/collections"
                        className="px-6 py-3 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-all"
                    >
                        Browse Collections
                    </Link>
                    <button
                        onClick={fetchProductDetails}
                        className="px-6 py-3 rounded-full border border-white/20 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 bg-[#111113] text-on-surface antialiased font-[Plus_Jakarta_Sans]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 xl:px-24 pt-20 sm:pt-24 lg:pt-28">

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">

                    {/* Left: Product Images Gallery */}
                    <div className="w-full lg:w-[60%] flex flex-col-reverse md:flex-row gap-3 sm:gap-4 lg:gap-6">

                        {displayImages.length > 1 && (
                            <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 w-full md:w-20 lg:w-24 flex-shrink-0 md:max-h-[calc(100vh-200px)]">
                                {displayImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`flex-shrink-0 w-16 md:w-full aspect-[4/5] overflow-hidden rounded-xl border transition-all duration-300 ${
                                            selectedImage === idx
                                                ? 'opacity-100 border-white ring-1 ring-white/50'
                                                : 'opacity-50 border-white/10 hover:opacity-100 hover:border-white/30'
                                        }`}
                                    >
                                        <img
                                            src={img.url}
                                            alt={`View ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = "/snitch_editorial_warm.png";
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="relative w-full aspect-[4/5] overflow-hidden group rounded-2xl border border-white/[0.08] bg-[#18181c]">
                            <img
                                src={displayImages[selectedImage]?.url || displayImages[0]?.url || "/snitch_editorial_warm.png"}
                                alt={product.title}
                                className="w-full h-full object-cover transition-opacity duration-500"
                                onError={(e) => {
                                    e.currentTarget.src = "/snitch_editorial_warm.png";
                                }}
                            />

                            {displayImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() =>
                                            setSelectedImage(prev =>
                                                prev === 0 ? displayImages.length - 1 : prev - 1
                                            )
                                        }
                                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center opacity-85 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/90"
                                        aria-label="Previous image"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
                                    </button>

                                    <button
                                        onClick={() =>
                                            setSelectedImage(prev =>
                                                prev === displayImages.length - 1 ? 0 : prev + 1
                                            )
                                        }
                                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center opacity-85 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/90"
                                        aria-label="Next image"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right: Product Info & Actions */}
                    <div className="w-full lg:w-[40%] lg:sticky lg:top-28 flex flex-col pt-2">

                        <button
                            onClick={() => navigate(-1)}
                            className="self-start mb-6 text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                            Back
                        </button>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-[1.15] mb-4 break-words">
                            {product.title}
                        </h1>

                        {/* Price Section */}
                        <div className="mb-6 flex flex-col">
                            <div className="flex items-center gap-2.5 text-2xl font-bold text-white">
                                <span>{currencySymbol}</span>
                                <span>{Number(displayPrice.amount || 0).toLocaleString("en-IN")}</span>
                            </div>

                            {displayPrice.mrp && displayPrice.mrp > displayPrice.amount && (
                                <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                                    <span className="text-white/40 line-through text-xs sm:text-sm">
                                        {currencySymbol}{Number(displayPrice.mrp).toLocaleString("en-IN")}
                                    </span>
                                    <span className="bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px] sm:text-xs tracking-wider border border-emerald-500/20">
                                        SAVE {Math.round(((displayPrice.mrp - displayPrice.amount) / displayPrice.mrp) * 100)}%
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="h-px w-full mb-6 bg-white/[0.08]" />

                        {/* Variant Attributes Selection */}
                        {Object.entries(availableAttributes).map(
                            ([attrName, values]) => (
                                <div key={attrName} className="mb-5">
                                    <h3 className="text-xs uppercase tracking-[0.2em] font-semibold mb-2.5 text-white/60">
                                        {attrName}: <span className="text-white font-bold">{selectedAttributes[attrName] || "Select"}</span>
                                    </h3>

                                    <div className="flex flex-wrap gap-2">
                                        {values.map(value => {
                                            const isSelected = selectedAttributes[attrName] === value;

                                            const isValid = variants.some(v => {
                                                if (!v.attributes) return false;
                                                const vAttrs = typeof v.attributes.entries === "function"
                                                    ? Object.fromEntries(v.attributes.entries())
                                                    : v.attributes;

                                                if (String(vAttrs[attrName]) !== String(value)) return false;
                                                return Object.entries(selectedAttributes).every(([k, selectedVal]) => {
                                                    if (k === attrName) return true;
                                                    return String(vAttrs[k]) === String(selectedVal);
                                                });
                                            });

                                            return (
                                                <button
                                                    key={value}
                                                    disabled={!isValid}
                                                    onClick={() => handleAttributeChange(attrName, value)}
                                                    className={`px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-bold transition-all duration-200 rounded-full border ${
                                                        isSelected
                                                            ? 'bg-white text-black border-white shadow-sm'
                                                            : isValid
                                                                ? 'bg-white/[0.04] text-white/80 border-white/10 hover:border-white/30 hover:bg-white/[0.08]'
                                                                : 'bg-white/[0.02] text-white/20 border-white/5 cursor-not-allowed line-through'
                                                    }`}
                                                >
                                                    {value}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )
                        )}

                        {/* Stock indicator */}
                        {hasVariants && activeVariant && (
                            <div className="mb-6 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${Number(activeVariant.stock ?? 0) > 0 ? 'bg-emerald-400' : 'bg-red-500'}`} />
                                <span className={`text-[11px] uppercase tracking-[0.1em] font-bold ${Number(activeVariant.stock ?? 0) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {Number(activeVariant.stock ?? 0) > 0 ? `${activeVariant.stock} in stock` : 'Out of stock'}
                                </span>
                            </div>
                        )}

                        {/* Add to Cart feedback message */}
                        {addToCartMsg && (
                            <div
                                className={`mb-4 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    addToCartState === ADD_TO_CART_STATES.SUCCESS
                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-red-500/15 text-red-400 border border-red-500/20'
                                }`}
                            >
                                {addToCartMsg}
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col gap-3 mt-4">
                            <button
                                type="button"
                                disabled={!canAddToCart || addToCartState === ADD_TO_CART_STATES.LOADING}
                                onClick={handleAddToCart}
                                className={getAddToCartBtnClass()}
                            >
                                {getAddToCartText()}
                            </button>

                            <Link
                                to="/collections"
                                className="w-full h-12 bg-white/[0.04] border border-white/10 text-white rounded-full text-sm font-bold tracking-wider uppercase flex items-center justify-center hover:bg-white/[0.08] transition-all duration-150"
                            >
                                Continue Shopping
                            </Link>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="mt-8 pt-6 border-t border-white/[0.08]">
                                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold mb-3 text-white/50">
                                    The Details
                                </h3>
                                <p className="text-xs sm:text-sm leading-relaxed text-white/70 whitespace-pre-line">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Trust highlights */}
                        <div className="mt-8 space-y-3 text-[11px] uppercase tracking-[0.1em] text-white/40 font-medium">
                            <div className="flex justify-between border-b border-white/[0.06] pb-2.5">
                                <span>Shipping</span>
                                <span className="text-white/70">Complimentary over ₹999</span>
                            </div>
                            <div className="flex justify-between border-b border-white/[0.06] pb-2.5">
                                <span>Returns</span>
                                <span className="text-white/70">Within 7 days of delivery</span>
                            </div>
                            <div className="flex justify-between border-b border-white/[0.06] pb-2.5">
                                <span>Authenticity</span>
                                <span className="text-white/70">100% Guaranteed</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;