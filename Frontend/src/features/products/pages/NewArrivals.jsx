import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../services/product.api.js";

const ProductCard = ({ product, rank }) => {
    const navigate = useNavigate();
    const coverImage = product.images?.[0]?.url || null;
    const price = product.price?.amount ?? "—";
    const currency = product.price?.currency ?? "INR";
    const symbols = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
    const symbol = symbols[currency] ?? "₹";

    const createdDate = product.createdAt
        ? new Date(product.createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : null;

    return (
        <div
            onClick={() => navigate(`/product/${product._id}`)}
            className="group relative rounded-2xl border border-white/[0.06] overflow-hidden transition-all duration-500 hover:border-white/20 cursor-pointer"
            style={{
                background: "rgba(24,24,28,0.65)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
            }}
        >
            {/* Rank badge */}
            {rank <= 3 && (
                <div
                    className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                        background: rank === 1 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.15)",
                        color: rank === 1 ? "#111113" : "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(8px)",
                    }}
                >
                    {rank === 1 ? "🆕 Newest" : rank === 2 ? "Recent" : "New"}
                </div>
            )}

            {/* Image */}
            <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
                {coverImage ? (
                    <img
                        src={coverImage}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                    />
                ) : (
                    <div
                        className="w-full h-full flex flex-col items-center justify-center gap-2"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                    >
                        <span className="material-symbols-outlined text-white/20" style={{ fontSize: "40px" }}>
                            checkroom
                        </span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
                    <div className="w-full h-10 rounded-full bg-white/90 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center">
                        View Details
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-on-surface truncate mb-1 group-hover:text-white transition-colors">
                    {product.title}
                </h3>
                <p className="text-xs text-on-surface-variant line-clamp-1 mb-3 leading-relaxed">
                    {product.description || "Premium fashion piece"}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-white">
                        {symbol}{Number(price).toLocaleString("en-IN")}
                    </span>
                    {createdDate && (
                        <span className="text-[10px] text-white/30">
                            {createdDate}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const SkeletonCard = () => (
    <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "rgba(24,24,28,0.65)" }}>
        <div className="w-full animate-pulse" style={{ aspectRatio: "4/5", background: "rgba(255,255,255,0.04)" }} />
        <div className="p-5 space-y-3">
            <div className="h-4 rounded-full w-3/4 animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="h-3 rounded-full w-full animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            <div className="h-5 rounded-full w-16 animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>
    </div>
);

const NewArrivals = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewest = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch sorted by newest first (createdAt DESC)
                const data = await getAllProducts({ sort: "newest" });
                setProducts(data.products || []);
            } catch {
                setError("Failed to load new arrivals. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchNewest();
    }, []);

    return (
        <div
            className="min-h-screen text-on-surface font-[Plus_Jakarta_Sans] antialiased"
            style={{ background: "#111113" }}
        >
            {/* Header */}
            <div className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 text-center max-w-7xl mx-auto">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 mb-4">
                    Just Dropped
                </p>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight mb-6">
                    New Arrivals
                </h1>
                <p className="text-base text-white/45 max-w-xl mx-auto leading-relaxed">
                    The freshest drops, sorted by when they were listed. Be the first to cop the latest pieces.
                </p>
            </div>

            {/* Products grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                {error && (
                    <div className="text-center py-20">
                        <p className="text-red-400 text-sm mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!error && (
                    <>
                        {!loading && products.length > 0 && (
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30 mb-8">
                                {products.length} New Drop{products.length !== 1 ? "s" : ""}
                            </p>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {loading
                                ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                                : products.length === 0
                                    ? (
                                        <div className="col-span-full text-center py-20">
                                            <p className="text-white/40 text-sm">No products available yet.</p>
                                        </div>
                                    )
                                    : products.map((product, idx) => (
                                        <ProductCard key={product._id} product={product} rank={idx + 1} />
                                    ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NewArrivals;
