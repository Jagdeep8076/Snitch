import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import ThreeBackground from "../../../components/ThreeBackground";
import StreetwearVisual3D from "../../../components/StreetwearVisual3D";

const CATEGORIES = [
    "All",
    "T-Shirts",
    "Hoodies",
    "Cargo Pants",
    "Sneakers",
    "Accessories",
    "Co-ords",
    "Oversized",
];

const PRODUCTS = [
    {
        id: 1,
        name: "Acid Wash Oversized Tee",
        price: "₹799",
        tag: "Trending",
        emoji: "👕",
    },
    {
        id: 2,
        name: "Cargo Wide-Leg Pants",
        price: "₹1,499",
        tag: "New",
        emoji: "👖",
    },
    {
        id: 3,
        name: "Washed Hoodie Drop",
        price: "₹1,299",
        tag: "Hot",
        emoji: "🧥",
    },
    {
        id: 4,
        name: "Linen Co-ord Set",
        price: "₹1,899",
        tag: "New",
        emoji: "🧣",
    },
    {
        id: 5,
        name: "Graphic Print Tee",
        price: "₹649",
        tag: "Sale",
        emoji: "👕",
    },
    {
        id: 6,
        name: "Relaxed Fit Joggers",
        price: "₹999",
        tag: "Trending",
        emoji: "🩲",
    },
];

const tagColors = {
    Trending: "bg-surface-container-high text-on-surface-variant",
    New: "bg-primary text-on-primary",
    Hot: "bg-error text-on-error",
    Sale: "bg-tertiary-container text-on-tertiary-container",
};

const Home = () => {
    const user = useSelector((state) => state.auth.user);

    const [activeCategory, setActiveCategory] = useState("All");
    const [menuOpen, setMenuOpen] = useState(false);

    const displayName = user?.fullname || "User";
    const displayRole = user?.role || "buyer";

    return (
        <div className="min-h-screen bg-background text-on-surface antialiased">

            {/* THREE JS BACKGROUND */}
            <ThreeBackground variant="home" />

            <div
                className="relative"
                style={{ zIndex: 1 }}
            >

                {/* ================= NAVBAR ================= */}

                <header
                    className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-2xl"
                    style={{
                        background: "rgba(17,17,19,0.78)",
                    }}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

                        {/* LOGO */}

                        <Link
                            to="/"
                            className="flex items-center gap-2 shrink-0"
                        >
                            <span className="text-xl font-bold tracking-tight">
                                Snitch
                            </span>

                            <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-1 rounded-full bg-primary text-on-primary tracking-widest">
                                STUDIO
                            </span>
                        </Link>

                        {/* DESKTOP NAV */}

                        <nav className="hidden md:flex items-center gap-1">

                            {["Shop", "Drops", "Sellers", "About"].map(
                                (item) => (
                                    <a
                                        key={item}
                                        href="#"
                                        className="px-4 py-2 rounded-full text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all"
                                    >
                                        {item}
                                    </a>
                                )
                            )}

                        </nav>

                        {/* RIGHT SIDE */}

                        <div className="flex items-center gap-2">

                            {/* SEARCH */}

                            <button
                                className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-full border border-white/10 text-on-surface-variant text-sm hover:border-white/20 transition"
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: "17px" }}
                                >
                                    search
                                </span>

                                <span className="hidden lg:block">
                                    Search
                                </span>
                            </button>

                            {/* BAG */}

                            <button
                                className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5 transition"
                            >
                                <span className="material-symbols-outlined">
                                    shopping_bag
                                </span>

                                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                            </button>

                            {/* LOGGED IN USER */}

                            {user && (
                                <div className="hidden sm:flex items-center gap-3 ml-1">

                                    <div className="text-right">
                                        <p className="text-sm font-semibold leading-none">
                                            {displayName}
                                        </p>

                                        <p className="text-[10px] mt-1 uppercase tracking-widest text-on-surface-variant">
                                            {displayRole}
                                        </p>
                                    </div>

                                    <div className="w-10 h-10 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary">
                                            person
                                        </span>
                                    </div>

                                </div>
                            )}

                            {/* MOBILE MENU */}

                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/5"
                            >
                                <span className="material-symbols-outlined">
                                    {menuOpen ? "close" : "menu"}
                                </span>
                            </button>

                        </div>
                    </div>

                    {/* MOBILE MENU */}

                    {menuOpen && (
                        <div
                            className="md:hidden border-t border-white/5 p-4 flex flex-col gap-2"
                            style={{
                                background: "rgba(17,17,19,0.96)",
                            }}
                        >

                            {["Shop", "Drops", "Sellers", "About"].map(
                                (item) => (
                                    <a
                                        key={item}
                                        href="#"
                                        className="px-4 py-3 rounded-xl text-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                                    >
                                        {item}
                                    </a>
                                )
                            )}

                            {user && (
                                <div className="mt-2 p-4 rounded-2xl border border-white/10 bg-white/5">

                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary">
                                                person
                                            </span>
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold">
                                                {displayName}
                                            </p>

                                            <p className="text-xs text-on-surface-variant mt-1">
                                                {user.email}
                                            </p>
                                        </div>

                                    </div>

                                </div>
                            )}

                        </div>
                    )}
                </header>

                {/* ================= HERO ================= */}

                <main>

                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20 pb-16">

                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                            {/* HERO LEFT */}

                            <div className="flex flex-col gap-6">

                                <div
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 w-fit"
                                    style={{
                                        background: "rgba(255,255,255,0.04)",
                                    }}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />

                                    <span className="text-xs font-semibold tracking-widest text-secondary uppercase">
                                        New Arrivals Live
                                    </span>
                                </div>

                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">

                                    Clothes that
                                    <br />

                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary">
                                        hit different.
                                    </span>

                                </h1>

                                <p className="max-w-lg text-base leading-relaxed text-on-surface-variant">
                                    Discover the latest streetwear drops,
                                    curated fits and limited-edition pieces
                                    made for your vibe.
                                </p>

                                <div className="flex flex-wrap gap-3">

                                    <a
                                        href="#latest-drops"
                                        className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-primary text-on-primary font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
                                    >
                                        Explore Collection

                                        <span
                                            className="material-symbols-outlined"
                                            style={{ fontSize: "18px" }}
                                        >
                                            arrow_forward
                                        </span>
                                    </a>

                                    <button
                                        className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-white/10 text-on-surface-variant hover:text-on-surface hover:border-white/20 transition"
                                    >
                                        <span
                                            className="material-symbols-outlined"
                                            style={{ fontSize: "18px" }}
                                        >
                                            play_circle
                                        </span>

                                        Watch Lookbook
                                    </button>

                                </div>

                                {/* TRUST */}

                                <div className="flex flex-wrap gap-5 pt-2">

                                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                                        <span className="material-symbols-outlined text-secondary text-sm">
                                            local_shipping
                                        </span>
                                        Free delivery over ₹999
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                                        <span className="material-symbols-outlined text-secondary text-sm">
                                            verified
                                        </span>
                                        100% authentic
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                                        <span className="material-symbols-outlined text-secondary text-sm">
                                            replay
                                        </span>
                                        Easy returns
                                    </div>

                                </div>

                            </div>

                            {/* HERO 3D */}

                            <div className="hidden sm:block">

                                <div
                                    className="relative rounded-3xl border border-white/10 p-7 overflow-hidden"
                                    style={{
                                        background: "rgba(30,30,33,0.55)",
                                        backdropFilter: "blur(24px)",
                                        WebkitBackdropFilter: "blur(24px)",
                                    }}
                                >

                                    <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />

                                    <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-secondary/10 blur-3xl" />

                                    <div className="relative h-72 flex items-center justify-center">

                                        <StreetwearVisual3D />

                                        <div className="absolute top-2 right-2 px-3 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-[10px] uppercase tracking-widest text-on-surface-variant">
                                            3D Interactive
                                        </div>

                                    </div>

                                    <div className="relative">

                                        <span className="inline-block px-2.5 py-1 rounded-full bg-primary text-on-primary text-xs font-semibold mb-2">
                                            Drop of the Week
                                        </span>

                                        <h3 className="text-xl font-bold">
                                            Washed Hoodie Drop
                                        </h3>

                                        <p className="text-sm text-on-surface-variant mt-1">
                                            Street-ready. Studio-approved.
                                        </p>

                                        <div className="flex items-center justify-between mt-6">

                                            <span className="text-2xl font-bold">
                                                ₹1,299
                                            </span>

                                            <button className="h-10 px-5 rounded-full bg-primary text-on-primary text-sm font-semibold hover:opacity-90 transition">
                                                Add to Bag
                                            </button>

                                        </div>

                                    </div>

                                </div>

                                {/* STATS */}

                                <div className="grid grid-cols-3 gap-3 mt-4">

                                    {[
                                        ["50K+", "Customers"],
                                        ["2K+", "Styles"],
                                        ["4.9★", "Rating"],
                                    ].map(([value, label]) => (
                                        <div
                                            key={label}
                                            className="py-4 rounded-2xl border border-white/10 text-center"
                                            style={{
                                                background:
                                                    "rgba(26,26,28,0.65)",
                                                backdropFilter: "blur(12px)",
                                            }}
                                        >
                                            <p className="font-bold text-lg">
                                                {value}
                                            </p>

                                            <p className="text-xs text-on-surface-variant mt-1">
                                                {label}
                                            </p>
                                        </div>
                                    ))}

                                </div>

                            </div>

                        </div>

                    </section>

                    {/* ================= PRODUCTS ================= */}

                    <section
                        id="latest-drops"
                        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
                    >

                        <div className="flex items-end justify-between gap-4 mb-7">

                            <div>
                                <p className="text-xs font-semibold tracking-widest text-secondary uppercase mb-1">
                                    Curated For You
                                </p>

                                <h2 className="text-2xl sm:text-3xl font-bold">
                                    Latest Drops
                                </h2>
                            </div>

                            <button className="hidden sm:flex items-center gap-1 text-sm text-primary hover:underline">
                                View all

                                <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: "16px" }}
                                >
                                    arrow_forward
                                </span>
                            </button>

                        </div>

                        {/* CATEGORIES */}

                        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">

                            {CATEGORIES.map((category) => (

                                <button
                                    key={category}
                                    onClick={() =>
                                        setActiveCategory(category)
                                    }
                                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                        activeCategory === category
                                            ? "bg-primary text-on-primary border-primary"
                                            : "border-white/10 text-on-surface-variant hover:text-on-surface hover:border-white/20"
                                    }`}
                                >
                                    {category}
                                </button>

                            ))}

                        </div>

                        {/* PRODUCTS */}

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-5">

                            {PRODUCTS.map((product) => (

                                <div
                                    key={product.id}
                                    className="group rounded-2xl border border-white/8 overflow-hidden hover:border-white/20 transition-all"
                                    style={{
                                        background:
                                            "rgba(26,26,28,0.68)",
                                        backdropFilter: "blur(16px)",
                                    }}
                                >

                                    <div
                                        className="relative h-40 sm:h-44 flex items-center justify-center text-6xl"
                                        style={{
                                            background:
                                                "rgba(30,30,33,0.45)",
                                        }}
                                    >

                                        <span className="group-hover:scale-110 transition-transform duration-300">
                                            {product.emoji}
                                        </span>

                                        <span
                                            className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full ${tagColors[product.tag]}`}
                                        >
                                            {product.tag}
                                        </span>

                                        <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                            <span
                                                className="material-symbols-outlined"
                                                style={{ fontSize: "16px" }}
                                            >
                                                favorite_border
                                            </span>
                                        </button>

                                    </div>

                                    <div className="p-3">

                                        <p className="text-sm font-semibold leading-tight min-h-10">
                                            {product.name}
                                        </p>

                                        <div className="flex items-center justify-between mt-3">

                                            <span className="font-bold text-sm">
                                                {product.price}
                                            </span>

                                            <button className="w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition flex items-center justify-center">
                                                <span
                                                    className="material-symbols-outlined"
                                                    style={{ fontSize: "16px" }}
                                                >
                                                    add
                                                </span>
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </section>

                    {/* ================= SELLER CTA ================= */}

                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

                        <div
                            className="relative rounded-3xl border border-white/10 overflow-hidden p-8 sm:p-12 lg:p-16"
                            style={{
                                background: "rgba(22,22,26,0.72)",
                                backdropFilter: "blur(24px)",
                            }}
                        >

                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

                            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">

                                <div className="text-center lg:text-left">

                                    <p className="text-xs font-semibold tracking-widest text-secondary uppercase mb-2">
                                        Grow With Snitch
                                    </p>

                                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                                        Become a Snitch Seller
                                    </h2>

                                    <p className="text-on-surface-variant max-w-lg mt-3">
                                        List your collection, reach fashion
                                        forward buyers and grow your brand.
                                    </p>

                                </div>

                                <Link
                                    to="/register"
                                    className="shrink-0 inline-flex items-center gap-2 h-12 px-7 rounded-full bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition"
                                >
                                    Start Selling

                                    <span
                                        className="material-symbols-outlined"
                                        style={{ fontSize: "18px" }}
                                    >
                                        storefront
                                    </span>
                                </Link>

                            </div>

                        </div>

                    </section>

                </main>

                {/* ================= FOOTER ================= */}

                <footer className="border-t border-white/5">

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                            <div>
                                <span className="font-bold">
                                    Snitch
                                </span>

                                <span className="text-sm text-on-surface-variant ml-2">
                                    — Wear the Vibe
                                </span>
                            </div>

                            <div className="flex gap-6 text-sm text-on-surface-variant">

                                <a href="#" className="hover:text-on-surface">
                                    Privacy
                                </a>

                                <a href="#" className="hover:text-on-surface">
                                    Terms
                                </a>

                                <a href="#" className="hover:text-on-surface">
                                    Contact
                                </a>

                            </div>

                            <p className="text-xs text-outline">
                                © 2026 Snitch
                            </p>

                        </div>

                    </div>

                </footer>

            </div>
        </div>
    );
};

export default Home;