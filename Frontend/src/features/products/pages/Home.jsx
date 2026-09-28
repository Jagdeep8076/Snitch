import React, { useEffect, useRef, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useProduct } from "../hook/useProduct.js";
import gsap from "gsap";
import * as THREE from "three";


const HeroCanvas = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;


    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    /* ── Scene & Camera ── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      el.clientWidth / el.clientHeight,
      0.1,
      500
    );
    camera.position.set(0, 0, 30);

    /* ── Floating Torus Ring ── */
    const torusGeo = new THREE.TorusGeometry(8, 0.35, 16, 100);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0xc7c6ca,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    scene.add(torus);

    /* ── Inner Icosahedron ── */
    const icoGeo = new THREE.IcosahedronGeometry(4, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0xa5b4fc,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);

    const PARTICLE_COUNT = 600;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 80;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    const particleMat = new THREE.PointsMaterial({
      color: 0xe8e8ea,
      size: 0.4,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    /* ── Glow Orbs ── */
    const makeOrb = (color, radius, x, y, z, opacity) => {
      const geo = new THREE.SphereGeometry(radius, 24, 24);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      return mesh;
    };
    const orb1 = makeOrb(0x2e2b52, 12, -15, 5, -25, 0.15);
    const orb2 = makeOrb(0x282338, 10, 18, -8, -30, 0.12);

    /* ── Mouse ── */
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    /* ── Resize ── */
    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    /* ── Animation Loop ── */
    let rafId;
    const clock = new THREE.Clock();
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      torus.rotation.x = t * 0.15 + mouse.y * 0.3;
      torus.rotation.y = t * 0.2 + mouse.x * 0.3;

      ico.rotation.x = -t * 0.25;
      ico.rotation.y = t * 0.18;
      ico.scale.setScalar(1 + 0.08 * Math.sin(t * 0.8));

      particles.rotation.y = t * 0.012;
      particles.rotation.x = t * 0.008;

      orb1.scale.setScalar(1 + 0.06 * Math.sin(t * 0.4));
      orb2.scale.setScalar(1 + 0.06 * Math.sin(t * 0.35 + 1));

      camera.position.x += (mouse.x * 3 - camera.position.x) * 0.03;
      camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      torusGeo.dispose();
      icoGeo.dispose();
      particleGeo.dispose();
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    />
  );
};


const ProductCard = ({ product, index }) => {
    const navigate = useNavigate()
    
  const cardRef = useRef(null);
  const coverImage =
    product.images?.[0]?.url || product.images?.[0] || product.image || null;
  const price = product.price?.amount ?? product.price ?? "—";
  const currency = product.price?.currency ?? "INR";
  const symbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AED: "د.إ",
    JPY: "¥",
  };
  const symbol = symbols[currency] ?? currency;

  return (
    <div
    onClick={() => navigate(`/product/${product._id}`)}
      ref={cardRef}
      className="home-product-card group relative rounded-2xl border border-white/[0.06] overflow-hidden transition-all duration-500 hover:border-white/20"
      style={{
        background: "rgba(24,24,28,0.65)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
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
            <span
              className="material-symbols-outlined text-outline"
              style={{ fontSize: "40px" }}
            >
              checkroom
            </span>
            <span className="text-xs text-outline">No image</span>
          </div>
        )}

        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Quick-view button on hover */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 ease-out">
          <button className="w-full h-10 rounded-full bg-white/90 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 backdrop-blur-sm hover:bg-white transition-colors">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "15px" }}
            >
              visibility
            </span>
            Quick View
          </button>
        </div>

        {/* Image count badge */}
        {product.images?.length > 1 && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold text-white/90"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "11px" }}
            >
              photo_library
            </span>
            {product.images.length}
          </div>
        )}
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
            {symbol}
            {Number(price).toLocaleString("en-IN")}
          </span>
          <span
            className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-on-surface-variant border border-white/[0.06]"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            {currency}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   SKELETON CARD
═══════════════════════════════════════════════════════════════════════════ */
const SkeletonCard = () => (
  <div
    className="rounded-2xl border border-white/[0.06] overflow-hidden"
    style={{ background: "rgba(24,24,28,0.65)" }}
  >
    <div
      className="w-full animate-pulse"
      style={{
        aspectRatio: "4/5",
        background:
          "linear-gradient(110deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
    <div className="p-5 space-y-3">
      <div
        className="h-4 rounded-full w-3/4"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
      <div
        className="h-3 rounded-full w-full"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />
      <div className="flex items-center justify-between pt-2">
        <div
          className="h-5 rounded-full w-16"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
        <div
          className="h-5 rounded-full w-10"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MARQUEE STRIP COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
const MarqueeStrip = () => {
  const words = [
    "STREETWEAR",
    "◆",
    "NEW ARRIVALS",
    "◆",
    "EXCLUSIVE DROPS",
    "◆",
    "PREMIUM FITS",
    "◆",
    "LIMITED EDITION",
    "◆",
    "OVERSIZED",
    "◆",
    "SNITCH STUDIO",
    "◆",
  ];

  return (
    <div
      className="overflow-hidden border-y border-white/[0.06] select-none"
      style={{ background: "rgba(255,255,255,0.015)" }}
    >
      <div className="marquee-track flex whitespace-nowrap py-4">
        {[...words, ...words, ...words].map((w, i) => (
          <span
            key={i}
            className={`mx-4 text-xs font-bold tracking-[0.3em] uppercase ${
              w === "◆"
                ? "text-white/20"
                : "text-white/30"
            }`}
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN HOME PAGE
═══════════════════════════════════════════════════════════════════════════ */
const Home = () => {
  const products = useSelector((state) => state.product.products);
  const user = useSelector((state) => state.auth.user);
  const { handleGetAllProducts } = useProduct();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const heroRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroSubRef = useRef(null);
  const heroCTARef = useRef(null);
  const navRef = useRef(null);
  const productsHeaderRef = useRef(null);
  const userMenuRef = useRef(null);

  /* ── Close user menu on outside click ── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── GSAP: user menu animate ── */
  useEffect(() => {
    if (showUserMenu && userMenuRef.current) {
      const panel = userMenuRef.current.querySelector(".user-dropdown-panel");
      if (panel) {
        gsap.fromTo(
          panel,
          { opacity: 0, y: -10, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "power3.out" }
        );
      }
    }
  }, [showUserMenu]);

  /* ── Helper: user initials ── */
  const getUserInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const getUserFirstName = (name) => {
    if (!name) return "User";
    return name.trim().split(/\s+/)[0];
  };

  /* ── Fetch products ── */
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      await handleGetAllProducts();
    } catch {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ── GSAP Hero Entrance Animations ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Nav slide down */
      gsap.fromTo(
        navRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1 }
      );

      /* Hero title staggered reveal */
      if (heroTitleRef.current) {
        const words = heroTitleRef.current.querySelectorAll(".hero-word");
        gsap.fromTo(
          words,
          { y: 100, opacity: 0, rotationX: -40 },
          {
            y: 0,
            opacity: 1,
            rotationX: 0,
            duration: 1,
            stagger: 0.12,
            ease: "power4.out",
            delay: 0.3,
          }
        );
      }

      /* Sub text fade in */
      gsap.fromTo(
        heroSubRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.9 }
      );

      /* CTA buttons */
      gsap.fromTo(
        heroCTARef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 1.1 }
      );
    });

    return () => ctx.revert();
  }, []);

  /* ── GSAP Product Cards Stagger ── */
  useEffect(() => {
    if (!loading && products?.length > 0) {
      gsap.fromTo(
        ".home-product-card",
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.06,
          ease: "power3.out",
          delay: 0.2,
        }
      );
    }
  }, [loading, products]);

  /* ── Products header animation ── */
  useEffect(() => {
    if (!loading && productsHeaderRef.current) {
      gsap.fromTo(
        productsHeaderRef.current,
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" }
      );
    }
  }, [loading]);

  const productCount = products?.length ?? 0;

  return (
    <div
      className="min-h-screen text-on-surface font-[Plus_Jakarta_Sans] antialiased"
      style={{ background: "#111113" }}
    >
      {/* ═══════════════════════════════════════════════════════
          CUSTOM STYLES (scoped)
      ═══════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .marquee-track {
          animation: marquee 25s linear infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-12px); }
        }
        .hero-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes gradient-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-text-animated {
          background-size: 200% 200%;
          animation: gradient-shift 4s ease infinite;
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════
          NAVIGATION
      ═══════════════════════════════════════════════════════ */}
      <header
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04]"
        style={{
          background: "rgba(17,17,19,0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <span
                className="material-symbols-outlined text-white"
                style={{ fontSize: "18px" }}
              >
                storefront
              </span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Snitch
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {["Home", "Collections", "New Arrivals", "About"].map((item) => (
              <button
                key={item}
                className={`text-sm font-medium transition-colors duration-200 ${
                  item === "Home"
                    ? "text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
              title="Search"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "20px" }}
              >
                search
              </span>
            </button>

            {/* Cart */}
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-200 relative"
              title="Cart"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "20px" }}
              >
                shopping_bag
              </span>
            </button>

            {/* Auth / User Profile */}
            {user ? (
              <div ref={userMenuRef} className="relative">
                {/* Avatar + Name trigger */}
                <button
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="hidden sm:flex items-center gap-2.5 h-10 pl-1 pr-4 rounded-full border border-white/[0.08] hover:border-white/20 transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  {/* Avatar with initials */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold tracking-wider text-white shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(165,180,252,0.4), rgba(199,198,202,0.3))",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {getUserInitials(user.fullname)}
                  </div>
                  <span className="text-xs font-semibold text-white/80 max-w-[100px] truncate">
                    {getUserFirstName(user.fullname)}
                  </span>
                  <span
                    className="material-symbols-outlined text-white/40 transition-transform duration-200"
                    style={{
                      fontSize: "16px",
                      transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    expand_more
                  </span>
                </button>

                {/* Mobile avatar */}
                <button
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="sm:hidden w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(165,180,252,0.4), rgba(199,198,202,0.3))",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {getUserInitials(user.fullname)}
                </button>

                {/* ── Dropdown Panel ── */}
                {showUserMenu && (
                  <div
                    className="user-dropdown-panel absolute top-full right-0 mt-2 w-72 rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl"
                    style={{
                      background: "rgba(20,20,24,0.95)",
                      backdropFilter: "blur(24px)",
                      WebkitBackdropFilter: "blur(24px)",
                    }}
                  >
                    {/* User Info Header */}
                    <div className="p-5 border-b border-white/[0.06]">
                      <div className="flex items-start gap-3">
                        {/* Large avatar */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold tracking-wider text-white shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(165,180,252,0.35), rgba(199,198,202,0.25))",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          {getUserInitials(user.fullname)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-white truncate">
                            {user.fullname}
                          </p>
                          <p className="text-xs text-white/40 truncate mt-0.5">
                            {user.email}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {/* Role badge */}
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                user.role === "seller"
                                  ? "text-emerald-400 border-emerald-400/20"
                                  : "text-indigo-300 border-indigo-300/20"
                              }`}
                              style={{
                                background:
                                  user.role === "seller"
                                    ? "rgba(52,211,153,0.08)"
                                    : "rgba(165,180,252,0.08)",
                                border: `1px solid ${
                                  user.role === "seller"
                                    ? "rgba(52,211,153,0.2)"
                                    : "rgba(165,180,252,0.2)"
                                }`,
                              }}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: "10px" }}
                              >
                                {user.role === "seller"
                                  ? "storefront"
                                  : "person"}
                              </span>
                              {user.role}
                            </span>
                            {/* Online dot */}
                            <span className="flex items-center gap-1 text-[10px] text-white/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Online
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Location if available */}
                      {(user.city || user.state) && (
                        <div className="flex items-center gap-1.5 mt-3 text-xs text-white/30">
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "13px" }}
                          >
                            location_on
                          </span>
                          {[user.city, user.state]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      {user.role === "seller" && (
                        <>
                          <Link
                            to="/seller/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
                          >
                            <span
                              className="material-symbols-outlined text-white/40"
                              style={{ fontSize: "18px" }}
                            >
                              dashboard
                            </span>
                            Seller Dashboard
                          </Link>
                          <Link
                            to="/seller/products/create"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
                          >
                            <span
                              className="material-symbols-outlined text-white/40"
                              style={{ fontSize: "18px" }}
                            >
                              add_circle
                            </span>
                            Create Product
                          </Link>
                        </>
                      )}
                      <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-all duration-150">
                        <span
                          className="material-symbols-outlined text-white/40"
                          style={{ fontSize: "18px" }}
                        >
                          shopping_bag
                        </span>
                        My Orders
                      </button>
                      <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-all duration-150">
                        <span
                          className="material-symbols-outlined text-white/40"
                          style={{ fontSize: "18px" }}
                        >
                          settings
                        </span>
                        Settings
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="p-2 pt-0 border-t border-white/[0.04] mt-1">
                      <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-400/[0.06] transition-all duration-150 mt-1">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "18px" }}
                        >
                          logout
                        </span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Three.js Canvas */}
        <HeroCanvas />

        {/* Background gradient washes */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-[#111113]" />
          <div className="absolute -top-40 left-1/4 w-96 h-96 rounded-full bg-purple-900/10 blur-[120px]" />
          <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-indigo-900/10 blur-[100px]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6">
          {/* Personalized welcome for logged-in user */}
          {user && (
            <div
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/[0.08] mb-5"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(165,180,252,0.4), rgba(199,198,202,0.3))",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {getUserInitials(user.fullname)}
              </div>
              <span className="text-xs font-medium text-white/60">
                Welcome back,{" "}
                <span className="text-white/90 font-semibold">
                  {getUserFirstName(user.fullname)}
                </span>{" "}
                👋
              </span>
            </div>
          )}

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] mb-8 hero-float"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-[0.2em] text-white/60 uppercase">
              New Collection Live
            </span>
          </div>

          {/* Title */}
          <div
            ref={heroTitleRef}
            className="overflow-hidden mb-6"
            style={{ perspective: "800px" }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
              <span className="hero-word inline-block text-white">
                Redefine
              </span>{" "}
              <span className="hero-word inline-block text-white">
                Your
              </span>
              <br className="hidden sm:block" />{" "}
              <span
                className="hero-word inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#e8e8ea] via-[#a5b4fc] to-[#c7d2fe] gradient-text-animated"
              >
                Style.
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            ref={heroSubRef}
            className="text-base sm:text-lg text-white/45 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Discover curated collections from independent sellers.
            Premium streetwear, exclusive drops, and one-of-a-kind fashion —
            all in one place.
          </p>

          {/* CTA Buttons */}
          <div
            ref={heroCTARef}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#products"
              className="group flex items-center gap-2 h-13 px-8 rounded-full bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-white/90 active:scale-[0.98] transition-all duration-200"
              style={{ height: "52px" }}
            >
              Explore Collection
              <span
                className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1"
                style={{ fontSize: "18px" }}
              >
                arrow_forward
              </span>
            </a>
            {user?.role === "seller" && (
              <Link
                to="/seller/products/create"
                className="flex items-center gap-2 h-13 px-8 rounded-full border border-white/15 text-white text-sm font-bold uppercase tracking-wider hover:bg-white/[0.06] transition-all duration-200"
                style={{ height: "52px" }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "18px" }}
                >
                  add
                </span>
                List Product
              </Link>
            )}
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
            <span className="text-[10px] font-semibold tracking-[0.3em] uppercase">
              Scroll
            </span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-white/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MARQUEE STRIP
      ═══════════════════════════════════════════════════════ */}
      <MarqueeStrip />

      {/* ═══════════════════════════════════════════════════════
          PRODUCTS SECTION
      ═══════════════════════════════════════════════════════ */}
      <section id="products" className="relative z-10">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-secondary/5 blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-tertiary/5 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Section Header */}
          <div
            ref={productsHeaderRef}
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <span
                    className="material-symbols-outlined text-white/60"
                    style={{ fontSize: "14px" }}
                  >
                    grid_view
                  </span>
                </div>
                <span className="text-xs font-semibold tracking-[0.2em] text-white/40 uppercase">
                  All Products
                </span>
                {!loading && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white/50 border border-white/[0.08]"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    {productCount}
                  </span>
                )}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Curated{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e8e8ea] to-[#a5b4fc]">
                  Collection
                </span>
              </h2>
              <p className="text-sm text-white/40 mt-2 max-w-md">
                Handpicked pieces from top sellers. Each product tells a story
                of design and quality.
              </p>
            </div>

            {/* Filter pills (decorative) */}
            <div className="flex items-center gap-2 mt-6 sm:mt-0">
              {["All", "New", "Popular", "Under ₹999"].map((filter, i) => (
                <button
                  key={filter}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                    i === 0
                      ? "bg-white text-black"
                      : "border border-white/[0.08] text-white/50 hover:text-white hover:border-white/20"
                  }`}
                  style={
                    i !== 0 ? { background: "rgba(255,255,255,0.03)" } : {}
                  }
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-6 py-5 flex items-center gap-4 mb-10">
              <span
                className="material-symbols-outlined text-red-400 shrink-0"
                style={{ fontSize: "24px" }}
              >
                error
              </span>
              <div>
                <p className="text-sm font-semibold text-red-300">
                  Something went wrong
                </p>
                <p className="text-xs text-white/50 mt-0.5">{error}</p>
              </div>
              <button
                onClick={fetchProducts}
                className="ml-auto px-5 py-2 rounded-full text-xs font-bold border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && productCount === 0 && (
            <div
              className="rounded-3xl border border-white/[0.06] flex flex-col items-center justify-center py-24 px-8 text-center"
              style={{
                background: "rgba(24,24,28,0.5)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <span
                  className="material-symbols-outlined text-white/30"
                  style={{ fontSize: "38px" }}
                >
                  local_mall
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No products yet
              </h3>
              <p className="text-sm text-white/40 max-w-xs leading-relaxed mb-8">
                Be the first to discover exclusive drops. Products from our
                sellers will appear here.
              </p>
              {user?.role === "seller" && (
                <Link
                  to="/seller/products/create"
                  className="flex items-center gap-2 h-11 px-6 bg-white text-black rounded-full text-sm font-bold hover:bg-white/90 transition-opacity"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px" }}
                  >
                    add
                  </span>
                  Create First Product
                </Link>
              )}
            </div>
          )}

          {/* Product Grid */}
          {!loading && !error && productCount > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product, index) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES STRIP
      ═══════════════════════════════════════════════════════ */}
      <section className="relative z-10 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "local_shipping",
                title: "Free Shipping",
                desc: "On orders above ₹999",
              },
              {
                icon: "verified",
                title: "Authentic",
                desc: "100% verified sellers",
              },
              {
                icon: "autorenew",
                title: "Easy Returns",
                desc: "7-day return policy",
              },
              {
                icon: "lock",
                title: "Secure Payment",
                desc: "Encrypted checkout",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-4 p-5 rounded-2xl border border-white/[0.04] transition-all duration-300 hover:border-white/[0.1]"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <span
                    className="material-symbols-outlined text-white/60"
                    style={{ fontSize: "22px" }}
                  >
                    {f.icon}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-white/35">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <span className="text-lg font-bold text-white tracking-tight">
                Snitch
              </span>
              <p className="text-xs text-white/30 mt-2 leading-relaxed max-w-xs">
                India's premium streetwear marketplace connecting independent
                designers with fashion-forward buyers.
              </p>
              <div className="flex items-center gap-3 mt-4">
                {["share", "group", "mail"].map((icon) => (
                  <button
                    key={icon}
                    className="w-8 h-8 rounded-full flex items-center justify-center border border-white/[0.06] text-white/30 hover:text-white/60 hover:border-white/15 transition-all duration-200"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "14px" }}
                    >
                      {icon}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: "Shop",
                links: ["All Products", "New Arrivals", "Popular", "Sale"],
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Press", "Blog"],
              },
              {
                title: "Support",
                links: ["Help Center", "Contact Us", "Returns", "Track Order"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button className="text-sm text-white/30 hover:text-white/60 transition-colors duration-200">
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-white/20 tracking-wider uppercase">
              © 2026 Snitch Studio. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {["Privacy", "Terms", "Cookies"].map((item) => (
                <button
                  key={item}
                  className="text-[11px] text-white/20 hover:text-white/40 uppercase tracking-wider transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
