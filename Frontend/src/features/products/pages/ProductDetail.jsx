import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { useProduct } from '../hook/useProduct.js'
import { useCart } from '../../cart/hook/useCart.js';



const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const navigate = useNavigate();
    const { handleGetProductById } = useProduct();
    const {handleAddItem } = useCart()


    async function fetchProductDetails() {
        try {
            const data = await handleGetProductById(productId);
            setProduct(data?.product || data);
        } catch (error) {
            console.error("Failed to fetch product details", error);
        }
    }

    useEffect(() => {
        fetchProductDetails();
    }, [productId]);

    useEffect(() => {
        if (product?.variants?.length > 0) {
            setSelectedAttributes(product.variants[0].attributes || {});
        }
    }, [product]);

    const activeVariant = useMemo(() => {
        if (!product?.variants || product.variants.length === 0) return null;

        return product.variants.find(v => {
            if (!v.attributes) return false;

            const vKeys = Object.keys(v.attributes);
            const sKeys = Object.keys(selectedAttributes);

            const isMatch = vKeys.every(
                k => v.attributes[k] === selectedAttributes[k]
            );

            return vKeys.length === sKeys.length && isMatch;
        });
    }, [product, selectedAttributes]);

    const availableAttributes = useMemo(() => {
        if (!product?.variants) return {};

        const attrs = {};

        product.variants.forEach(variant => {
            if (variant.attributes) {
                Object.entries(variant.attributes).forEach(([key, value]) => {
                    if (!attrs[key]) attrs[key] = new Set();
                    attrs[key].add(value);
                });
            }
        });

        Object.keys(attrs).forEach(key => {
            attrs[key] = Array.from(attrs[key]);
        });

        return attrs;
    }, [product]);

    useEffect(() => {
        setSelectedImage(0);
    }, [activeVariant]);

    const handleAttributeChange = (attrName, value) => {
        if (!product?.variants) return;

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

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-[10px] uppercase tracking-[0.2em] font-medium animate-pulse text-outline font-[Plus_Jakarta_Sans]">
                    Retrieving piece...
                </p>
            </div>
        );
    }

    const partialMatchVariant = (() => {
        if (!product?.variants || Object.keys(selectedAttributes).length === 0) return null;
        return product.variants.find(v => {
            if (!v.attributes) return false;
            return Object.entries(selectedAttributes).every(([k, val]) => v.attributes[k] === val);
        });
    })();

    const displayImages = (() => {
        const imagesMap = new Map();
        
        const matchVariant = activeVariant || partialMatchVariant;
        
        if (matchVariant?.images?.length > 0) {
            matchVariant.images.forEach(img => imagesMap.set(img.url, img));
        }

        if (product?.images?.length > 0) {
            product.images.forEach(img => {
                if (!imagesMap.has(img.url)) {
                    imagesMap.set(img.url, img);
                }
            });
        }

        const combined = Array.from(imagesMap.values());
        return combined.length > 0 ? combined : [{ url: '/snitch_editorial_warm.png' }];
    })();

    const displayPrice = activeVariant?.price?.amount
        ? activeVariant.price
        : product.price;

    const isOutOfStock =
        Boolean(activeVariant) && Number(activeVariant.stock) <= 0;

    const handleAddToCart = async () => {
        if (!product?._id || !activeVariant?._id || isOutOfStock) return;

        try {
            await handleAddItem({
                productId: product._id,
                variantId: activeVariant._id,
                quantity: 1
            });
        } catch (error) {
            console.error("Failed to add item to cart:", error);
        }
    };

    const getAddToCartText = () => {
        if (isOutOfStock) return "Out of Stock";
        return "Add to Cart";
    };

    return (
        <div className="min-h-screen pb-24 bg-background text-on-surface antialiased font-[Plus_Jakarta_Sans]">
            <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24 pt-12 lg:pt-20">

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">

                    <div className="w-full lg:w-[70%] flex flex-col-reverse md:flex-row gap-4 lg:gap-6">

                        {displayImages.length > 1 && (
                            <div className="flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 w-full md:w-20 lg:w-24 flex-shrink-0 md:max-h-[calc(100vh-200px)]">
                                {displayImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`flex-shrink-0 w-20 md:w-full aspect-[4/5] overflow-hidden rounded-xl border transition-all duration-300 ${
                                            selectedImage === idx
                                                ? 'opacity-100 border-primary ring-1 ring-primary/50'
                                                : 'opacity-50 border-surface-container-high hover:opacity-100 hover:border-outline'
                                        }`}
                                    >
                                        <img
                                            src={img.url}
                                            alt={`View ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="relative w-full aspect-[4/5] overflow-hidden group rounded-2xl border border-surface-container-high bg-surface-container">
                            <img
                                src={
                                    displayImages[selectedImage]?.url ||
                                    displayImages[0].url
                                }
                                alt={product.title}
                                className="w-full h-full object-cover transition-opacity duration-500"
                            />

                            {displayImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() =>
                                            setSelectedImage(prev =>
                                                prev === 0
                                                    ? displayImages.length - 1
                                                    : prev - 1
                                            )
                                        }
                                        className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full bg-surface-container-low/80 backdrop-blur-sm text-on-surface border border-surface-container-high hover:bg-surface-container"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
                                    </button>

                                    <button
                                        onClick={() =>
                                            setSelectedImage(prev =>
                                                prev === displayImages.length - 1
                                                    ? 0
                                                    : prev + 1
                                            )
                                        }
                                        className="absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full bg-surface-container-low/80 backdrop-blur-sm text-on-surface border border-surface-container-high hover:bg-surface-container"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="w-full lg:w-[30%] lg:sticky lg:top-24 flex flex-col pt-4">

                        <button
                            onClick={() => navigate(-1)}
                            className="self-start mb-8 text-[10px] uppercase tracking-[0.2em] font-bold text-outline hover:text-on-surface transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                            Back
                        </button>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-on-surface leading-[1.1] mb-6">
                            {product.title}
                        </h1>

                        <div className="mb-8 flex items-center gap-2 text-xl font-semibold text-on-surface">
                            <span>{displayPrice?.currency}</span>
                            <span>{displayPrice?.amount?.toLocaleString()}</span>
                        </div>

                        <div className="h-px w-full mb-8 bg-surface-container-high" />

                        {Object.entries(availableAttributes).map(
                            ([attrName, values]) => (
                                <div key={attrName} className="mb-6">
                                    <h3 className="text-xs uppercase tracking-[0.24em] font-semibold mb-3 text-secondary">
                                        {attrName}: <span className="text-on-surface">{selectedAttributes[attrName] || ""}</span>
                                    </h3>

                                    <div className="flex flex-wrap gap-2">
                                        {values.map(value => {
                                            const isSelected = selectedAttributes[attrName] === value;

                                            const isValid = product.variants.some(v => {
                                                if (!v.attributes || v.attributes[attrName] !== value) return false;
                                                return Object.entries(selectedAttributes).every(([k, selectedVal]) => {
                                                    if (k === attrName) return true;
                                                    return v.attributes[k] === selectedVal;
                                                });
                                            });

                                            return (
                                                <button
                                                    key={value}
                                                    disabled={!isValid}
                                                    onClick={() => handleAttributeChange(attrName, value)}
                                                    className={`px-4 py-2.5 text-[11px] uppercase tracking-[0.15em] font-bold transition-all duration-200 rounded-full border ${
                                                        isSelected
                                                            ? 'bg-primary text-on-primary border-primary'
                                                            : isValid
                                                                ? 'bg-surface-container text-on-surface border-surface-container-high hover:border-outline hover:bg-surface-container-high'
                                                                : 'bg-surface-container/50 text-on-surface/30 border-surface-container-high/30 cursor-not-allowed opacity-50 line-through'
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

                        {activeVariant ? (
                            <div className="mb-6 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${activeVariant.stock > 0 ? 'bg-emerald-500' : 'bg-error'}`} />
                                <span className={`text-[11px] uppercase tracking-[0.1em] font-bold ${activeVariant.stock > 0 ? 'text-emerald-500' : 'text-error'}`}>
                                    {activeVariant.stock > 0 ? `Only ${activeVariant.stock} left in stock` : 'Out of stock'}
                                </span>
                            </div>
                        ) : null}

                        <div className="mb-12">
                            <h3 className="text-xs uppercase tracking-[0.24em] font-semibold mb-4 text-secondary">
                                The Details
                            </h3>
                            <p className="text-sm leading-relaxed text-on-surface-variant">
                                {product.description}
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 mt-auto">
                            <button
                                type="button"
                                disabled={!activeVariant || isOutOfStock}
                                onClick={handleAddToCart}
                                className={`w-full h-12 rounded-full text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm transition-all duration-150 ${
                                    !activeVariant || isOutOfStock
                                        ? 'bg-surface-container-high text-on-surface/50 cursor-not-allowed border border-surface-container-high'
                                        : 'bg-primary text-on-primary hover:opacity-90 active:scale-[0.99]'
                                }`}
                            >
                                {getAddToCartText()}
                            </button>

                            <button
                                onClick={() => navigate(-1)}
                                className="w-full h-12 bg-surface-container border border-surface-container-high text-on-surface rounded-full text-sm font-bold tracking-wider uppercase flex items-center justify-center hover:bg-surface-container-high transition-all duration-150"
                            >
                                Continue Shopping
                            </button>
                        </div>

                        <div className="mt-14 space-y-4 text-[11px] uppercase tracking-[0.1em] text-outline font-medium">
                            <div className="flex justify-between border-b border-surface-container-high pb-3">
                                <span>Shipping</span>
                                <span className="text-on-surface-variant">Complimentary over INR 15,000</span>
                            </div>

                            <div className="flex justify-between border-b border-surface-container-high pb-3">
                                <span>Returns</span>
                                <span className="text-on-surface-variant">Within 14 days of delivery</span>
                            </div>

                            <div className="flex justify-between border-b border-surface-container-high pb-3">
                                <span>Authenticity</span>
                                <span className="text-on-surface-variant">100% Guaranteed</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;