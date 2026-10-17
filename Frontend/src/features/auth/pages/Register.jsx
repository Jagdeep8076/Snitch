import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../hook/useAuth";
import ThreeBackground from "../../../components/ThreeBackground";
import StudioPass3D from "../../../components/StudioPass3D";
import { API_BASE_URL } from "../../../config/api.config.js";

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oauthMessage = searchParams.get("message");
  const oauthCancelled = searchParams.get("cancelled");
  const redirectQuery = searchParams.get("redirect");
  const safeRedirect =
    redirectQuery && redirectQuery.startsWith("/") && !redirectQuery.startsWith("//")
      ? redirectQuery
      : "/";

  const user = useSelector((state) => state.auth.user);
  const authLoading = useSelector((state) => state.auth.loading);

  useEffect(() => {
    if (user && !authLoading) {
      navigate(safeRedirect, { replace: true });
    }
  }, [user, authLoading, safeRedirect, navigate]);

  const { handleRegister, handleResendVerification } = useAuth();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    isSeller: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);

  // Success popup modal state
  const [successModal, setSuccessModal] = useState(null);
  const [resendStatus, setResendStatus] = useState("");
  const [resendMsg, setResendMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (validationError) setValidationError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Validate inputs
    if (!formData.fullname.trim()) {
      setValidationError("Please enter your full legal name.");
      return;
    }
    if (!formData.email.trim()) {
      setValidationError("Please enter a valid email address.");
      return;
    }
    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match. Please re-enter your password.");
      return;
    }

    setLoading(true);

    const result = await handleRegister({
      fullname: formData.fullname.trim(),
      email: formData.email.trim().toLowerCase(),
      contact: formData.contact.trim() || undefined,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      address: formData.address.trim() || undefined,
      city: formData.city.trim() || undefined,
      state: formData.state.trim() || undefined,
      pincode: formData.pincode.trim() || undefined,
      isSeller: formData.isSeller,
    });

    setLoading(false);

    if (result && !result.error) {
      // Trigger Registration Success Popup
      setSuccessModal({
        email: formData.email.trim().toLowerCase(),
        title: "Registration successful!",
        subtitle: "Please check your email to verify your account.",
      });
    } else {
      setValidationError(result?.message || "Registration failed. Please try again.");
    }
  };

  const handleResendInModal = async () => {
    if (!successModal?.email) return;
    setResendStatus("sending");
    setResendMsg("");

    const res = await handleResendVerification({ email: successModal.email });
    if (res && !res.error) {
      setResendStatus("sent");
      setResendMsg("A fresh verification email has been dispatched!");
    } else {
      setResendStatus("error");
      setResendMsg(res?.message || "Failed to resend email. Please try again.");
    }
  };

  /* ── Shared input class ── */
  const inputCls =
    "w-full h-12 bg-surface-container border border-surface-container-high rounded-xl px-4 text-sm text-on-surface placeholder:text-outline focus:bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 outline-none";

  return (
    <div className="bg-background text-on-surface min-h-screen antialiased font-[Plus_Jakarta_Sans]">
      <ThreeBackground variant="register" />

      {/* REGISTRATION SUCCESS POPUP MODAL */}
      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-md rounded-3xl border border-white/10 p-8 text-center shadow-2xl relative overflow-hidden"
            style={{ background: "#16161a" }}
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-400/20 mx-auto flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-emerald-400 text-3xl">
                mail
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white tracking-tight mb-2">
              Registration successful!
            </h3>

            <p className="text-base text-zinc-300 font-medium mb-4">
              Please check your email to verify your account.
            </p>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-400 mb-6 text-left space-y-1">
              <p>
                We sent a secure single-use verification link to:{" "}
                <span className="text-white font-semibold">{successModal.email}</span>
              </p>
              <p className="text-[11px] text-zinc-500">
                Click the link in your inbox to complete activation and log in.
              </p>
            </div>

            {resendMsg && (
              <p
                className={`text-xs mb-4 ${
                  resendStatus === "sent" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {resendMsg}
              </p>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full h-12 bg-white text-black rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition active:scale-[0.99] flex items-center justify-center gap-2"
              >
                Proceed to Sign In
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>

              <button
                type="button"
                disabled={resendStatus === "sending"}
                onClick={handleResendInModal}
                className="w-full py-2.5 text-xs text-zinc-400 hover:text-white transition disabled:opacity-50"
              >
                {resendStatus === "sending" ? "Sending fresh link..." : "Didn't receive email? Resend verification"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        <header
          className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-2xl"
          style={{ background: "rgba(17,17,19,0.72)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-on-surface-variant"
                style={{ fontSize: "20px" }}
              >
                arrow_back
              </span>
              <span className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                Back to Snitch
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs text-outline hidden sm:inline">Already a member?</span>
              <Link
                to="/login"
                className="text-sm font-semibold text-primary hover:underline underline-offset-4 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </header>

        <div className="min-h-[calc(100vh-3.5rem)] grid lg:grid-cols-[1fr_520px] xl:grid-cols-[1fr_580px]">
          {/* Left Hero Showcase */}
          <div
            className="hidden lg:flex flex-col justify-between border-r border-white/10 p-10 xl:p-14 relative overflow-hidden"
            style={{
              background: "rgba(18,18,22,0.6)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

            <div className="relative">
              <span className="text-2xl font-bold tracking-tight text-on-surface">Snitch</span>
            </div>

            <div className="relative flex flex-col gap-6">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 w-fit"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold tracking-widest text-secondary uppercase">
                  Studio Access
                </span>
              </div>

              <div>
                <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-on-surface leading-[1.1] mb-2">
                  Join the<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    Snitch Studio.
                  </span>
                </h1>
                <p className="text-on-surface-variant text-xs xl:text-sm leading-relaxed max-w-sm">
                  Discover curated streetwear, exclusive drops, and become a verified seller — all in one place.
                </p>
              </div>

              <div
                className="relative rounded-2xl border border-white/10 p-4"
                style={{ background: "rgba(24,24,28,0.5)", backdropFilter: "blur(12px)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                    Interactive 3D Pass
                  </span>
                  <span className="text-[10px] text-outline font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Move mouse to inspect
                  </span>
                </div>
                <StudioPass3D />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { icon: "local_shipping", title: "Free Delivery", desc: "Over ₹999" },
                  { icon: "verified_user", title: "Authentic", desc: "Quality-checked" },
                  { icon: "storefront", title: "Zero Fees", desc: "Instant payouts" },
                ].map((f) => (
                  <div
                    key={f.title}
                    className="p-2.5 rounded-xl border border-white/5"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <span
                      className="material-symbols-outlined text-primary mb-1 block"
                      style={{ fontSize: "18px" }}
                    >
                      {f.icon}
                    </span>
                    <p className="text-xs font-semibold text-on-surface">{f.title}</p>
                    <p className="text-[10px] text-on-surface-variant">{f.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="flex -space-x-2">
                  {["🧑", "👩", "🧔", "👱"].map((em, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-surface-container-lowest flex items-center justify-center text-xs select-none"
                      style={{ background: "rgba(35,35,40,0.8)" }}
                    >
                      {em}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant">
                  <span className="font-semibold text-on-surface">50,000+</span> members already in
                </p>
              </div>
            </div>

            <div className="relative">
              <p className="text-xs text-outline">© {new Date().getFullYear()} Snitch. All rights reserved.</p>
            </div>
          </div>

          {/* Right Registration Form */}
          <div
            className="flex flex-col overflow-y-auto"
            style={{
              background: "rgba(17,17,20,0.65)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <div className="flex-1 px-4 sm:px-8 lg:px-10 xl:px-12 py-10">
              <div className="lg:hidden mb-8 text-center">
                <span className="text-2xl font-bold text-on-surface">Snitch</span>
                <p className="text-sm text-on-surface-variant mt-1">Create your free account</p>
              </div>

              {/* Notice for Google Login redirect */}
              {oauthMessage && (
                <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-400 shrink-0">
                    info
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-200">Registration Required</h4>
                    <p className="text-xs text-amber-300/90 mt-0.5">{oauthMessage}</p>
                  </div>
                </div>
              )}

              {oauthCancelled && (
                <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-zinc-400">
                  Google registration was cancelled. You can register using the form below.
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
                  Create Account
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Fill in your details to get started. An email verification link will be sent.
                </p>
              </div>

              {validationError && (
                <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 flex items-start gap-3">
                  <span className="material-symbols-outlined text-red-400" style={{ fontSize: "18px" }}>
                    error
                  </span>
                  <p className="text-sm text-red-300">{validationError}</p>
                </div>
              )}

              <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                {/* 1. Account Credentials */}
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
                    <span className="text-xs font-semibold tracking-widest text-secondary uppercase">
                      Account Credentials
                    </span>
                    <span className="text-xs text-outline">Required</span>
                  </div>

                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-on-surface" htmlFor="fullname">
                      Full Name
                    </label>
                    <input
                      className={inputCls}
                      id="fullname"
                      name="fullname"
                      type="text"
                      placeholder="e.g. Arjun Sharma"
                      required
                      value={formData.fullname}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-on-surface" htmlFor="email">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-outline pointer-events-none">
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                          mail
                        </span>
                      </span>
                      <input
                        className={`${inputCls} pl-11`}
                        id="email"
                        name="email"
                        type="email"
                        placeholder="arjun@example.com"
                        required
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-on-surface" htmlFor="password">
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        className={`${inputCls} pr-12`}
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        aria-label="Toggle password visibility"
                        className="absolute right-3 p-1.5 text-outline hover:text-on-surface transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-on-surface" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        className={`${inputCls} pr-12`}
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        required
                        minLength={6}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        aria-label="Toggle confirm password visibility"
                        className="absolute right-3 p-1.5 text-outline hover:text-on-surface transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                          {showConfirmPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Contact Phone (Optional) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-on-surface" htmlFor="contact">
                      Contact Phone <span className="text-xs text-outline font-normal">(Optional)</span>
                    </label>
                    <input
                      className={inputCls}
                      id="contact"
                      name="contact"
                      type="tel"
                      placeholder="9876543210 (10 digits)"
                      value={formData.contact}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* 2. Optional Shipping Details */}
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold tracking-widest text-secondary uppercase">
                        Location Details
                      </span>
                    </div>
                    <span className="text-xs text-outline">Optional</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-on-surface" htmlFor="address">
                      Street Address
                    </label>
                    <input
                      className={inputCls}
                      id="address"
                      name="address"
                      type="text"
                      placeholder="Flat / House no., Street, Area"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-on-surface" htmlFor="city">
                        City
                      </label>
                      <input
                        className={inputCls}
                        id="city"
                        name="city"
                        type="text"
                        placeholder="Mumbai"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-on-surface" htmlFor="state">
                        State
                      </label>
                      <input
                        className={inputCls}
                        id="state"
                        name="state"
                        type="text"
                        placeholder="Maharashtra"
                        value={formData.state}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-on-surface" htmlFor="pincode">
                      Postal / PIN Code
                    </label>
                    <input
                      className={inputCls}
                      id="pincode"
                      name="pincode"
                      type="text"
                      placeholder="400001 (6 digits)"
                      value={formData.pincode}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Seller Toggle */}
                <label
                  htmlFor="isSeller"
                  className="group cursor-pointer select-none rounded-2xl bg-surface-container-low border border-surface-container-high hover:border-outline p-5 transition-all duration-200 block"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-primary">Merchant Access</span>
                        <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-xs font-semibold uppercase tracking-wider">
                          Privilege
                        </span>
                      </div>
                      <p className="text-sm font-medium text-on-surface">Register as a Verified Seller</p>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      <div
                        className={`w-11 h-6 rounded-full flex items-center p-0.5 transition-colors duration-200 ${
                          formData.isSeller
                            ? "bg-primary"
                            : "bg-surface-container-highest border border-outline-variant"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                            formData.isSeller ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </div>
                      <input
                        className="sr-only"
                        id="isSeller"
                        name="isSeller"
                        type="checkbox"
                        checked={formData.isSeller}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    List collections, access analytics, and create your public designer showcase.
                  </p>
                </label>

                {/* Submit & Terms */}
                <div className="flex flex-col gap-5">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      className="mt-0.5 w-4 h-4 rounded border border-outline accent-primary cursor-pointer shrink-0"
                      type="checkbox"
                      required
                    />
                    <span className="text-sm text-on-surface-variant leading-relaxed">
                      I am at least 18 years old and agree to the{" "}
                      <a
                        className="text-primary font-medium underline underline-offset-4 hover:text-on-surface transition-colors"
                        href="#"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        className="text-primary font-medium underline underline-offset-4 hover:text-on-surface transition-colors"
                        href="#"
                      >
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-primary text-on-primary rounded-full text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm hover:opacity-90 active:scale-[0.99] transition-all duration-150 disabled:opacity-50"
                  >
                    {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                      arrow_forward
                    </span>
                  </button>

                  <div className="flex items-center gap-4 my-1">
                    <div className="flex-1 h-px bg-surface-container-high" />
                    <span className="text-xs text-outline uppercase tracking-wider">
                      Or continue with
                    </span>
                    <div className="flex-1 h-px bg-surface-container-high" />
                  </div>

                  {/* Phase 5: Google OAuth Registration explicit semantics */}
                  <a
                    href={`${API_BASE_URL}/auth/google?action=register${safeRedirect !== "/" ? `&redirect=${encodeURIComponent(safeRedirect)}` : ""}${typeof window !== "undefined" ? `&origin=${encodeURIComponent(window.location.origin)}` : ""}`}
                    className="w-full h-12 bg-white text-black rounded-full text-sm font-semibold flex items-center justify-center gap-3 border border-white/10 hover:bg-gray-100 active:scale-[0.99] transition-all duration-150"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.805 12.23c0-.79-.065-1.55-.207-2.28H12v4.32h5.49a4.69 4.69 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.055-4.4 3.055-7.68Z" fill="#4285F4"/>
                      <path d="M12 22c2.76 0 5.077-.91 6.77-2.47l-3.3-2.56c-.91.61-2.07.98-3.47.98-2.67 0-4.93-1.8-5.74-4.22H2.85v2.64A10.23 10.23 0 0 0 12 22Z" fill="#34A853"/>
                      <path d="M6.26 13.73A6.15 6.15 0 0 1 5.94 12c0-.6.11-1.18.32-1.73V7.63H2.85A10.01 10.01 0 0 0 1.75 12c0 1.61.39 3.13 1.1 4.37l3.41-2.64Z" fill="#FBBC05"/>
                      <path d="M12 6.05c1.5 0 2.84.52 3.9 1.54l2.92-2.92C17.07 3.04 14.76 2 12 2a10.23 10.23 0 0 0-9.15 5.63l3.41 2.64C7.07 7.85 9.33 6.05 12 6.05Z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </a>

                  <div className="flex items-center justify-center gap-1.5 text-outline text-xs">
                    <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
                      lock
                    </span>
                    256-bit encrypted · Your data is safe
                  </div>
                </div>
              </form>
            </div>

            <div className="px-4 sm:px-8 lg:px-10 py-6 border-t border-surface-container-high text-center">
              <p className="text-xs text-outline uppercase tracking-widest">
                Snitch Studio © {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
