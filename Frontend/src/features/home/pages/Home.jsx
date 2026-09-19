import React, { useState } from "react";
import ThreeBackground from "../../../components/ThreeBackground";
import StreetwearVisual3D from "../../../components/StreetwearVisual3D";

const CATEGORIES = ["All", "T‑Shirts", "Hoodies", "Cargo Pants", "Sneakers", "Accessories", "Co‑ords", "Oversized"];

const PRODUCTS = [
  { id: 1, name: "Acid Wash Oversized Tee", price: "₹799", tag: "Trending", emoji: "👕" },
  { id: 2, name: "Cargo Wide-Leg Pants", price: "₹1,499", tag: "New", emoji: "👖" },
  { id: 3, name: "Washed Hoodie Drop", price: "₹1,299", tag: "Hot", emoji: "🧥" },
  { id: 4, name: "Linen Co‑ord Set", price: "₹1,899", tag: "New", emoji: "🧣" },
  { id: 5, name: "Graphic Print Tee", price: "₹649", tag: "Sale", emoji: "👕" },
  { id: 6, name: "Relaxed Fit Joggers", price: "₹999", tag: "Trending", emoji: "🩲" },
];

const tagColors = {
  Trending: "bg-surface-container-high text-on-surface-variant",
  New: "bg-primary text-on-primary",
  Hot: "bg-error text-on-error",
  Sale: "bg-tertiary-container text-on-tertiary-container",
};

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-background text-on-surface min-h-screen antialiased selection:bg-primary/20 selection:text-on-surface font-[Plus_Jakarta_Sans]">

      {/* ── THREE.JS ANIMATED BACKGROUND ── */}
      <ThreeBackground variant="home" />

      {/* ── PAGE CONTENT (above canvas) ── */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── NAV ── */}
        <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-2xl" style={{ background: "rgba(17,17,19,0.72)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

            {/* Logo */}
            <a href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-xl font-bold tracking-tight text-on-surface">Snitch</span>
              <span className="hidden sm:inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-primary text-on-primary tracking-wider">
                BETA
              </span>
            </a>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {["Shop", "Drops", "Sellers", "About"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="px-4 py-2 rounded-full text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all duration-150"
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-full border border-white/10 text-on-surface-variant text-sm font-medium hover:border-white/20 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>search</span>
                <span className="hidden lg:inline">Search</span>
              </button>
              <button className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">shopping_bag</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
              </button>
              <a
                href="/register"
                className="hidden sm:inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-primary text-on-primary text-sm font-semibold hover:opacity-90 active:scale-95 transition-all duration-150"
              >
                Sign Up
              </a>
              {/* Mobile hamburger */}
              <button
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span className="material-symbols-outlined text-on-surface">
                  {menuOpen ? "close" : "menu"}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-white/5 px-4 pb-4 pt-2 flex flex-col gap-1" style={{ background: "rgba(17,17,19,0.92)" }}>
              {["Shop", "Drops", "Sellers", "About"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="px-4 py-3 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-white/5 hover:text-on-surface transition-all"
                >
                  {item}
                </a>
              ))}
              <a
                href="/register"
                className="mt-2 inline-flex items-center justify-center h-12 rounded-full bg-primary text-on-primary text-sm font-semibold"
              >
                Sign Up Free
              </a>
            </div>
          )}
        </header>

        {/* ── HERO ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left copy */}
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 w-fit" style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold tracking-widest text-secondary uppercase">
                  New Arrivals Live
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface leading-[1.1]">
                Clothes that<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-on-surface to-secondary">
                  hit different.
                </span>
              </h1>

              <p className="text-base text-on-surface-variant leading-relaxed max-w-md">
                Snitch brings you the freshest streetwear drops, curated fits, and
                limited‑edition pieces — delivered straight to your door.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-primary text-on-primary text-sm font-bold tracking-wide shadow-lg shadow-primary/10 hover:opacity-90 active:scale-[0.98] transition-all duration-150"
                >
                  Get Started
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
                </a>
                <button className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-white/10 text-on-surface-variant text-sm font-medium hover:border-white/20 hover:text-on-surface transition-all duration-150">
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>play_circle</span>
                  Watch Lookbook
                </button>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {[
                  { icon: "local_shipping", label: "Free delivery over ₹999" },
                  { icon: "verified", label: "100% authentic" },
                  { icon: "replay", label: "Easy returns" },
                ].map((t) => (
                  <div key={t.label} className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: "14px" }}>{t.icon}</span>
                    {t.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — hero visual card (glassmorphism) */}
            <div className="relative hidden sm:flex flex-col gap-4">
              {/* Big card */}
              <div
                className="relative rounded-3xl border border-white/10 p-8 overflow-hidden min-h-72 flex flex-col justify-between"
                style={{ background: "rgba(30,30,33,0.55)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
              >
                <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-secondary/8 blur-3xl pointer-events-none" />

                <div className="h-64 w-full relative mb-2 flex items-center justify-center">
                  <StreetwearVisual3D />
                  <div className="absolute top-2 right-2 text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-full border border-white/10 bg-black/40 text-on-surface-variant flex items-center gap-1.5 backdrop-blur-md pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    3D Interactive
                  </div>
                </div>

                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-xs font-semibold mb-2">
                    Drop of the Week
                  </span>
                  <p className="text-xl font-bold text-on-surface">Washed Hoodie Drop</p>
                  <p className="text-on-surface-variant text-sm mt-0.5">Street-ready. Studio-approved.</p>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-2xl font-bold text-on-surface">₹1,299</span>
                  <button className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-primary text-on-primary text-sm font-semibold hover:opacity-90 active:scale-95 transition-all">
                    Add to Bag
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>shopping_bag</span>
                  </button>
                </div>
              </div>

              {/* Stat pills row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "50K+", label: "Customers" },
                  { value: "2K+", label: "Styles" },
                  { value: "4.9★", label: "Rating" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col items-center py-4 rounded-2xl border border-white/8"
                    style={{ background: "rgba(26,26,28,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
                  >
                    <span className="text-lg font-bold text-on-surface">{s.value}</span>
                    <span className="text-xs text-on-surface-variant mt-0.5">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CATEGORY FILTER + PRODUCT GRID ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

          {/* Section header */}
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <p className="text-xs font-semibold tracking-widest text-secondary uppercase mb-1">Curated For You</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">Latest Drops</h2>
            </div>
            <a href="#" className="text-sm font-medium text-primary hover:underline underline-offset-4 flex items-center gap-1">
              View all
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
            </a>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 active:scale-95 border ${activeCategory === cat
                    ? "bg-primary text-on-primary border-primary shadow-sm"
                    : "border-white/10 text-on-surface-variant hover:border-white/20 hover:text-on-surface"
                  }`}
                style={activeCategory !== cat ? { background: "rgba(30,30,33,0.5)" } : {}}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {PRODUCTS.map((p) => (
              <div
                key={p.id}
                className="group relative flex flex-col rounded-2xl border border-white/8 hover:border-white/20 transition-all duration-200 overflow-hidden cursor-pointer"
                style={{ background: "rgba(26,26,28,0.65)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
              >
                {/* Product image area */}
                <div className="relative flex items-center justify-center h-36 sm:h-44 text-5xl sm:text-6xl select-none transition-transform duration-300 group-hover:scale-105" style={{ background: "rgba(30,30,33,0.4)" }}>
                  {p.emoji}
                  <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${tagColors[p.tag]}`}>
                    {p.tag}
                  </span>
                  <button className="absolute top-2 right-2 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(17,17,19,0.7)" }}>
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "16px" }}>favorite_border</span>
                  </button>
                </div>
                {/* Info */}
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <p className="text-sm font-semibold text-on-surface leading-tight line-clamp-2">{p.name}</p>
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <span className="text-sm font-bold text-on-surface">{p.price}</span>
                    <button className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary hover:text-on-primary text-primary flex items-center justify-center transition-all duration-150 active:scale-90">
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div
            className="relative rounded-3xl border border-white/10 overflow-hidden p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-16"
            style={{ background: "rgba(22,22,26,0.7)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
            <div className="flex-1 text-center lg:text-left">
              <p className="text-xs font-semibold tracking-widest text-secondary uppercase mb-2">Limited Time</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface mb-3">
                Become a Snitch Seller
              </h2>
              <p className="text-on-surface-variant leading-relaxed max-w-md mx-auto lg:mx-0">
                List your collection, reach thousands of fashion-forward buyers, and grow your brand — zero listing fees.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a href="/register" className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-primary text-on-primary font-semibold text-sm hover:opacity-90 active:scale-95 transition-all">
                Start Selling
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>storefront</span>
              </a>
              <button className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full border border-white/10 text-on-surface-variant font-medium text-sm hover:border-white/20 transition-all">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-on-surface">Snitch</span>
                <span className="text-on-surface-variant text-sm">— Wear the Vibe</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-on-surface-variant">
                {["Privacy", "Terms", "Contact", "Careers"].map((l) => (
                  <a key={l} href="#" className="hover:text-on-surface transition-colors">{l}</a>
                ))}
              </div>
              <p className="text-xs text-outline">© 2026 Snitch. All rights reserved.</p>
            </div>
          </div>
        </footer>

      </div>{/* end z-1 wrapper */}
    </div>
  );
};

export default Home;
