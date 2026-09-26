import React, { useEffect, useRef, useState } from "react";
import { useProduct } from "../hook/useProduct.js";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import gsap from "gsap";

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
const StatCard = ({ icon, label, value, accent }) => (
  <div
    className="stat-card rounded-2xl border border-surface-container-high p-5 flex items-center gap-4 relative overflow-hidden"
    style={{ background: "rgba(24,24,28,0.7)", backdropFilter: "blur(12px)" }}
  >
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: "rgba(255,255,255,0.05)" }}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: "22px", color: accent }}
      >
        {icon}
      </span>
    </div>
    <div>
      <p className="text-xs text-on-surface-variant mb-0.5">{label}</p>
      <p className="text-xl font-bold text-on-surface">{value}</p>
    </div>
    <div
      className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-20"
      style={{ background: accent }}
    />
  </div>
);

/* ─────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────── */
const ProductCard = ({ product }) => {
  const coverImage =
    product.images?.[0]?.url ||
    product.images?.[0] ||
    product.image ||
    null;

  const price = product.price?.amount ?? product.price ?? "—";
  const currency = product.price?.currency ?? "INR";
  const symbols = { INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "د.إ", JPY: "¥" };
  const symbol = symbols[currency] ?? currency;

  return (
    <div
      className="product-card group rounded-2xl border border-surface-container-high overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl relative"
      style={{
        background: "rgba(24,24,28,0.75)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      <div className="relative overflow-hidden" style={{ height: "180px" }}>
        {coverImage ? (
          <img
            src={coverImage}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <span className="material-symbols-outlined text-outline" style={{ fontSize: "36px" }}>
              image_not_supported
            </span>
            <span className="text-xs text-outline">No image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {product.images?.length > 1 && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ background: "rgba(0,0,0,0.55)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "11px" }}>photo_library</span>
            {product.images.length}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-sm font-bold text-on-surface truncate mb-1">{product.title}</h3>
        <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
          {product.description || "No description."}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-primary">
            {symbol}{Number(price).toLocaleString("en-IN")}
          </span>
          <span
            className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-surface-container-high text-on-surface-variant"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            {currency}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────────── */
const SkeletonCard = () => (
  <div
    className="rounded-2xl border border-surface-container-high overflow-hidden animate-pulse"
    style={{ background: "rgba(24,24,28,0.75)" }}
  >
    <div className="w-full bg-surface-container-high" style={{ height: "180px" }} />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-surface-container-high rounded-full w-3/4" />
      <div className="h-3 bg-surface-container-high rounded-full w-full" />
      <div className="h-3 bg-surface-container-high rounded-full w-5/6" />
      <div className="flex items-center justify-between pt-2">
        <div className="h-5 bg-surface-container-high rounded-full w-16" />
        <div className="h-5 bg-surface-container-high rounded-full w-10" />
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────── */
const Dashboard = () => {
  const { handleGetSellerProduct } = useProduct();
  const sellerProducts = useSelector((state) => state.product.sellerProducts);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const headerRef = useRef(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      await handleGetSellerProduct();
    } catch {
      setError("Failed to load your products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* Header entrance */
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
      );
    }
  }, []);

  /* Stat cards */
  useEffect(() => {
    if (!loading) {
      gsap.fromTo(
        ".stat-card",
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: "power3.out", delay: 0.2 }
      );
    }
  }, [loading]);

  /* Product cards */
  useEffect(() => {
    if (!loading && sellerProducts?.length > 0) {
      gsap.fromTo(
        ".product-card",
        { opacity: 0, y: 50, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.08, ease: "power3.out", delay: 0.4 }
      );
    }
  }, [loading, sellerProducts]);

  const productCount = sellerProducts?.length ?? 0;

  return (
    <div className="min-h-screen text-on-surface font-[Plus_Jakarta_Sans] antialiased" style={{ background: "#111113" }}>

      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-tertiary/5 blur-3xl" />
      </div>

      {/* Nav */}
      <header
        className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-2xl"
        style={{ background: "rgba(17,17,19,0.82)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "20px" }}>arrow_back</span>
            <span className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">Back to Snitch</span>
          </Link>
          <span className="text-sm font-bold text-on-surface tracking-tight">Snitch</span>
          <Link
            to="/seller/products/create"
            className="flex items-center gap-1.5 h-8 px-4 bg-primary text-on-primary rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>add</span>
            New Product
          </Link>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page Header */}
        <div ref={headerRef} className="mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 mb-4"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold tracking-widest text-secondary uppercase">Seller Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-on-surface leading-tight">
            My{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Dashboard
            </span>
          </h1>
          <p className="text-on-surface-variant text-sm mt-2">
            Manage your listings, track performance, and grow your storefront.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon="inventory_2" label="Total Products" value={loading ? "—" : productCount} accent="#e8e8ea" />
          <StatCard
            icon="photo_library"
            label="With Images"
            value={loading ? "—" : sellerProducts?.filter((p) => p.images?.length > 0).length ?? 0}
            accent="#a5b4fc"
          />
          <StatCard icon="trending_up" label="Active Listings" value={loading ? "—" : productCount} accent="#34d399" />
          <StatCard icon="storefront" label="Store Status" value="Live" accent="#fbbf24" />
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>grid_view</span>
            <h2 className="text-lg font-bold text-on-surface">All Products</h2>
            {!loading && (
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-surface-container-high text-on-surface-variant"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                {productCount}
              </span>
            )}
          </div>
          <Link
            to="/seller/products/create"
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-4 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>add_circle</span>
            Add new
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-2xl border border-error/30 bg-error/10 px-6 py-5 flex items-center gap-4 mb-8">
            <span className="material-symbols-outlined text-error shrink-0" style={{ fontSize: "24px" }}>error</span>
            <div>
              <p className="text-sm font-semibold text-on-error-container">Something went wrong</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{error}</p>
            </div>
            <button
              onClick={fetchProducts}
              className="ml-auto px-4 py-2 rounded-full text-xs font-bold border border-error/30 text-error hover:bg-error/10 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && productCount === 0 && (
          <div
            className="rounded-3xl border border-surface-container-high flex flex-col items-center justify-center py-20 px-8 text-center"
            style={{ background: "rgba(24,24,28,0.6)" }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <span className="material-symbols-outlined text-outline" style={{ fontSize: "38px" }}>inventory_2</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">No products yet</h3>
            <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed mb-8">
              You haven't listed any products. Create your first product to start selling on Snitch.
            </p>
            <Link
              to="/seller/products/create"
              className="flex items-center gap-2 h-11 px-6 bg-primary text-on-primary rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
              Create First Product
            </Link>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && productCount > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sellerProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-surface-container-high mt-16 py-6 text-center">
        <p className="text-xs text-outline uppercase tracking-widest">Snitch Studio © 2026</p>
      </footer>
    </div>
  );
};

export default Dashboard;

