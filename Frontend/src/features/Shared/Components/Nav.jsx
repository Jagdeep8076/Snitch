import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../auth/hook/useAuth.js";
import axios from "axios";
import { API_BASE_URL } from "../../../config/api.config.js";

const getUserFirstName = (user) => {
  if (!user) return "User";
  if (user.firstName) return user.firstName;
  if (user.name) return user.name.split(" ")[0];
  if (user.fullname) return user.fullname.split(" ")[0];
  if (user.fullName) return user.fullName.split(" ")[0];
  return "User";
};

const getUserInitials = (user) => {
  if (!user) return "U";

  const name =
    user.fullname ||
    user.fullName ||
    user.name ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim();

  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0].toUpperCase())
    .join("");
};

const Nav = () => {
  const user = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { handleLogout: authLogout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Compute total cart quantity safely from Redux
  const cartTotalQty = Array.isArray(cartItems)
    ? cartItems.reduce((acc, item) => acc + Math.max(0, Number(item?.quantity ?? 1) || 0), 0)
    : 0;

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Handle escape key to close menus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setSearchOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
        setSearchError(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/products`, { withCredentials: true });
        const allProducts = response.data?.products || [];
        const q = searchQuery.toLowerCase();
        const filtered = allProducts.filter(
          (p) =>
            p.title?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        );
        setSearchResults(filtered);
      } catch (err) {
        console.error("Search error:", err);
        setSearchError("Search failed. Please try again.");
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = async () => {
    try {
      setProfileOpen(false);
      setMobileMenuOpen(false);
      await authLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleSearchResultClick = (productId) => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    navigate(`/product/${productId}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-4 pt-3 sm:pt-4">
      <nav className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-black/75 px-3 sm:px-5 text-white shadow-2xl backdrop-blur-xl">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white text-black">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 sm:h-5 sm:w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M3 9.5 12 4l9 5.5" />
              <path d="M5 9v10h14V9" />
              <path d="M9 19v-6h6v6" />
            </svg>
          </div>

          <span className="text-lg sm:text-xl font-black tracking-tight">SNITCH</span>
        </Link>

        {/* Center links (Desktop / Tablet md+) */}
        <div className="hidden items-center gap-6 lg:gap-8 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-white/80 transition hover:text-white"
          >
            Home
          </Link>

          <Link
            to="/collections"
            className="text-sm font-medium text-white/80 transition hover:text-white"
          >
            Collections
          </Link>

          <Link
            to="/new-arrivals"
            className="text-sm font-medium text-white/80 transition hover:text-white"
          >
            New Arrivals
          </Link>

          <Link
            to="/about"
            className="text-sm font-medium text-white/80 transition hover:text-white"
          >
            About
          </Link>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search button (visible on all screens) */}
          <div ref={searchRef} className="relative">
            <button
              type="button"
              id="nav-search-btn"
              onClick={() => {
                setSearchOpen((v) => !v);
                if (searchOpen) {
                  setSearchQuery("");
                  setSearchResults([]);
                  setSearchError(null);
                }
              }}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Search products"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </button>

            {/* Search dropdown - responsive positioning for mobile & desktop */}
            {searchOpen && (
              <div
                className="fixed inset-x-3 top-20 sm:top-14 sm:inset-x-auto sm:right-0 sm:absolute sm:w-80 rounded-2xl border border-white/10 bg-black/95 shadow-2xl backdrop-blur-xl overflow-hidden z-50 max-w-[calc(100vw-1.5rem)]"
              >
                {/* Input */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0 text-white/40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    id="nav-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="text-white/30 hover:text-white/60 transition"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Results area */}
                <div className="max-h-80 overflow-y-auto">
                  {searchLoading && (
                    <div className="px-4 py-6 text-center text-sm text-white/40">
                      Searching...
                    </div>
                  )}

                  {searchError && !searchLoading && (
                    <div className="px-4 py-4 text-center text-sm text-red-400">
                      {searchError}
                    </div>
                  )}

                  {!searchLoading && !searchError && searchQuery.trim() && searchResults.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-white/40">
                      No products found for &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}

                  {!searchLoading && !searchError && !searchQuery.trim() && (
                    <div className="px-4 py-4 text-center text-xs text-white/30">
                      Type to search products
                    </div>
                  )}

                  {!searchLoading && searchResults.map((product) => {
                    const img = product.images?.[0]?.url || product.images?.[0] || null;
                    const rawPrice = product.price ?? product.prices;
                    const price = typeof rawPrice === "object" ? (rawPrice?.amount ?? rawPrice?.price) : rawPrice;
                    const currency = typeof rawPrice === "object" ? (rawPrice?.currency ?? "INR") : "INR";
                    const symbols = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
                    const symbol = symbols[currency] ?? "₹";
                    return (
                      <button
                        key={product._id}
                        onClick={() => handleSearchResultClick(product._id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition text-left"
                      >
                        {img ? (
                          <img
                            src={img}
                            alt={product.title}
                            className="w-10 h-12 object-cover rounded-lg shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-12 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/20" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM12 3v4" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{product.title}</p>
                          {price && (
                            <p className="text-xs text-white/50 mt-0.5">
                              {symbol}{Number(price).toLocaleString("en-IN")}
                            </p>
                          )}
                        </div>
                        <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/20 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Cart icon — show for non-sellers and guests */}
          {(!user || user.role !== "seller") && (
            <Link
              to="/cart"
              className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Cart"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" />
                <circle cx="10" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>

              {/* Cart badge — sourced from Redux store */}
              {user && cartTotalQty > 0 && (
                <span className="absolute right-0.5 top-0.5 sm:right-1 sm:top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] font-bold text-black">
                  {cartTotalQty}
                </span>
              )}
            </Link>
          )}

          {/* Auth section */}
          {user ? (
            <div className="relative ml-0.5 sm:ml-1" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="flex items-center gap-1.5 sm:gap-2 rounded-xl px-1.5 sm:px-2 py-1 sm:py-1.5 transition hover:bg-white/10"
                aria-label="User profile menu"
              >
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white text-xs sm:text-sm font-bold text-black">
                  {getUserInitials(user)}
                </div>

                <span className="hidden max-w-24 truncate text-sm font-medium lg:block">
                  {getUserFirstName(user)}
                </span>

                <svg
                  viewBox="0 0 24 24"
                  className={`hidden h-4 w-4 transition lg:block ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-black/95 p-2 shadow-2xl backdrop-blur-xl z-50">
                  <div className="border-b border-white/10 px-3 py-3">
                    <p className="text-sm font-semibold text-white">
                      {user.fullname ||
                        user.fullName ||
                        user.name ||
                        `${user.firstName || ""} ${user.lastName || ""}`.trim()}
                    </p>
                    <p className="mt-1 truncate text-xs text-white/50">
                      {user.email}
                    </p>
                  </div>

                  {user.role === "seller" && (
                    <>
                      <Link
                        to="/seller/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="mt-2 block rounded-xl px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                      >
                        Seller Dashboard
                      </Link>

                      <Link
                        to="/seller/products/create"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-xl px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                      >
                        Create Product
                      </Link>
                    </>
                  )}

                  {user.role !== "seller" && (
                    <Link
                      to="/cart"
                      onClick={() => setProfileOpen(false)}
                      className="mt-2 block rounded-xl px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                      My Cart
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 block w-full rounded-xl px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-white px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-semibold text-black transition hover:bg-white/90 shrink-0"
            >
              Sign In
            </Link>
          )}

          {/* Hamburger Menu Toggle Button (Mobile & Tablet < md) */}
          <button
            type="button"
            id="nav-mobile-toggle-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile navigation drawer overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="fixed inset-x-3 top-[68px] sm:top-20 z-40 max-h-[calc(100vh-5.5rem)] overflow-y-auto rounded-3xl border border-white/10 bg-black/95 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl md:hidden animate-fade-in"
        >
          {/* Mobile nav links */}
          <div className="flex flex-col gap-1 border-b border-white/10 pb-4">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              <span>Home</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
            <Link
              to="/collections"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              <span>Collections</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
            <Link
              to="/new-arrivals"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              <span>New Arrivals</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
            >
              <span>About</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </div>

          {/* User Section in Mobile Menu */}
          <div className="pt-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
                    {getUserInitials(user)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.fullname || user.fullName || user.name || "User"}
                    </p>
                    <p className="text-xs text-white/40 truncate">{user.email}</p>
                  </div>
                </div>

                {user.role === "seller" ? (
                  <div className="flex flex-col gap-1">
                    <Link
                      to="/seller/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/60" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="7" height="9" x="3" y="3" rx="1" />
                        <rect width="7" height="5" x="14" y="3" rx="1" />
                        <rect width="7" height="9" x="14" y="12" rx="1" />
                        <rect width="7" height="5" x="3" y="16" rx="1" />
                      </svg>
                      Seller Dashboard
                    </Link>
                    <Link
                      to="/seller/products/create"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/60" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v8M8 12h8" />
                      </svg>
                      Create Product
                    </Link>
                  </div>
                ) : (
                  <Link
                    to="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/60" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" />
                        <circle cx="10" cy="20" r="1" />
                        <circle cx="18" cy="20" r="1" />
                      </svg>
                      My Cart
                    </div>
                    {cartTotalQty > 0 && (
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-black">
                        {cartTotalQty}
                      </span>
                    )}
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-red-400 hover:bg-red-500/10 transition mt-1"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-3 rounded-xl bg-white text-black font-bold text-sm tracking-wide uppercase hover:bg-white/90 transition active:scale-[0.98]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-3 rounded-xl border border-white/20 text-white font-bold text-sm tracking-wide uppercase hover:bg-white/10 transition active:scale-[0.98]"
                >
                  Register Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Nav;
