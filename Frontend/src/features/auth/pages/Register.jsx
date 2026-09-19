import React, { useState } from "react";
import { useAuth } from "../hook/useAuth";
import ThreeBackground from "../../../components/ThreeBackground";
import StudioPass3D from "../../../components/StudioPass3D";

const Register = () => {
  const { handleRegister } = useAuth();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    contact: "",
    password: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    isSeller: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleRegister({
      fullname: formData.fullname,
      email: formData.email,
      contact: formData.contact,
      password: formData.password,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      isSeller: formData.isSeller
    })
  };

  /* ── Shared input class ── */
  const inputCls =
    "w-full h-12 bg-surface-container border border-surface-container-high rounded-xl px-4 text-sm text-on-surface placeholder:text-outline focus:bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 outline-none";

  return (
    <div className="bg-background text-on-surface min-h-screen antialiased font-[Plus_Jakarta_Sans]">

      {/* ── THREE.JS ANIMATED REALISTIC BACKGROUND ── */}
      <ThreeBackground variant="register" />

      {/* ── PAGE CONTENT (above canvas) ── */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── TOP NAV BAR ── */}
        <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-2xl" style={{ background: "rgba(17,17,19,0.72)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "20px" }}>arrow_back</span>
              <span className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">Back to Snitch</span>
            </a>
            <div className="flex items-center gap-2">
              <span className="text-xs text-outline hidden sm:inline">Already a member?</span>
              <a href="#" className="text-sm font-semibold text-primary hover:underline underline-offset-4 transition-colors">Sign In</a>
            </div>
          </div>
        </header>

        {/* ── MAIN SPLIT LAYOUT ── */}
        <div className="min-h-[calc(100vh-3.5rem)] grid lg:grid-cols-[1fr_520px] xl:grid-cols-[1fr_580px]">

          {/* ── LEFT PANEL (desktop only with 3D Studio Pass) ── */}
          <div
            className="hidden lg:flex flex-col justify-between border-r border-white/10 p-10 xl:p-14 relative overflow-hidden"
            style={{ background: "rgba(18,18,22,0.6)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
          >
            {/* Decorative soft glows */}
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

            {/* Brand */}
            <div className="relative">
              <span className="text-2xl font-bold tracking-tight text-on-surface">Snitch</span>
            </div>

            {/* Center content */}
            <div className="relative flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 w-fit" style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold tracking-widest text-secondary uppercase">Studio Access</span>
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

              {/* ── REALISTIC 3D STUDIO PASS ── */}
              <div className="relative rounded-2xl border border-white/10 p-4" style={{ background: "rgba(24,24,28,0.5)", backdropFilter: "blur(12px)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">Interactive 3D Pass</span>
                  <span className="text-[10px] text-outline font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Move mouse to inspect
                  </span>
                </div>
                <StudioPass3D />
              </div>

              {/* Feature list */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { icon: "local_shipping", title: "Free Delivery", desc: "Over ₹999" },
                  { icon: "verified_user", title: "Authentic", desc: "Quality-checked" },
                  { icon: "storefront", title: "Zero Fees", desc: "Instant payouts" },
                ].map((f) => (
                  <div key={f.title} className="p-2.5 rounded-xl border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <span className="material-symbols-outlined text-primary mb-1 block" style={{ fontSize: "18px" }}>{f.icon}</span>
                    <p className="text-xs font-semibold text-on-surface">{f.title}</p>
                    <p className="text-[10px] text-on-surface-variant">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex -space-x-2">
                  {["🧑", "👩", "🧔", "👱"].map((em, i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-surface-container-lowest flex items-center justify-center text-xs select-none" style={{ background: "rgba(35,35,40,0.8)" }}>
                      {em}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant">
                  <span className="font-semibold text-on-surface">50,000+</span> members already in
                </p>
              </div>
            </div>

            {/* Bottom */}
            <div className="relative">
              <p className="text-xs text-outline">© 2025 Snitch. All rights reserved.</p>
            </div>
          </div>

          {/* ── RIGHT PANEL — FORM ── */}
          <div
            className="flex flex-col overflow-y-auto"
            style={{ background: "rgba(17,17,20,0.65)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
          >
            <div className="flex-1 px-4 sm:px-8 lg:px-10 xl:px-12 py-10">

              {/* Mobile brand */}
              <div className="lg:hidden mb-8 text-center">
                <span className="text-2xl font-bold text-on-surface">Snitch</span>
                <p className="text-sm text-on-surface-variant mt-1">Create your free account</p>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center">1</div>
                  <span className="text-xs font-medium text-on-surface">Account</span>
                </div>
                <div className="flex-1 h-px bg-surface-container-high" />
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-surface-container border border-surface-container-high text-outline text-xs font-bold flex items-center justify-center">2</div>
                  <span className="text-xs text-outline">Location</span>
                </div>
                <div className="flex-1 h-px bg-surface-container-high" />
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-surface-container border border-surface-container-high text-outline text-xs font-bold flex items-center justify-center">3</div>
                  <span className="text-xs text-outline">Done</span>
                </div>
              </div>

              {/* Form heading */}
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">Create Account</h2>
                <p className="text-sm text-on-surface-variant mt-1">Fill in your details to get started.</p>
              </div>

              <form className="flex flex-col gap-8" onSubmit={handleSubmit}>

                {/* ── SECTION: Credentials ── */}
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
                    <span className="text-xs font-semibold tracking-widest text-secondary uppercase">Account Credentials</span>
                    <span className="text-xs text-outline">Required</span>
                  </div>

                  {/* Full name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-on-surface" htmlFor="fullname">Legal Full Name</label>
                    <input
                      className={inputCls}
                      id="fullname" name="fullname" type="text"
                      placeholder="e.g. Arjun Sharma" required
                      value={formData.fullname} onChange={handleChange}
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-on-surface" htmlFor="email">Email Address</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-outline pointer-events-none">
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>mail</span>
                      </span>
                      <input
                        className={`${inputCls} pl-11`}
                        id="email" name="email" type="email"
                        placeholder="arjun@example.com" required
                        value={formData.email} onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Phone — grid on desktop */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-on-surface" htmlFor="contact">Contact Phone</label>
                    <div className="flex gap-2">
                      <div className="relative w-28 shrink-0">
                        <select className={`${inputCls} pr-7 appearance-none`}>
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+49">🇩🇪 +49</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none" style={{ fontSize: "16px" }}>expand_more</span>
                      </div>
                      <input
                        className={`${inputCls} flex-1`}
                        id="contact" name="contact" type="tel"
                        placeholder="98765 43210" required
                        value={formData.contact} onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-on-surface" htmlFor="password">Password</label>
                      <div className="flex items-center gap-1" title="Password strength">
                        <span className="text-xs text-outline mr-1">Strength:</span>
                        {[1, 2, 3, 4].map((i) => (
                          <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${i <= 3 ? "bg-primary" : "bg-surface-container-high"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        className={`${inputCls} pr-12`}
                        id="password" name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 8 characters" required
                        value={formData.password} onChange={handleChange}
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
                </div>

                {/* ── SECTION: Location ── */}
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold tracking-widest text-secondary uppercase">Location Details</span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs">Primary</span>
                    </div>
                    <span className="text-xs text-outline">Shipping</span>
                  </div>

                  {/* Street address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-on-surface" htmlFor="address">Street Address</label>
                    <input
                      className={inputCls}
                      id="address" name="address" type="text"
                      placeholder="Flat / House no., Street, Area" required
                      value={formData.address} onChange={handleChange}
                    />
                  </div>

                  {/* City + State in a row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-on-surface" htmlFor="city">City</label>
                      <input
                        className={inputCls}
                        id="city" name="city" type="text"
                        placeholder="Mumbai" required
                        value={formData.city} onChange={handleChange}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-on-surface" htmlFor="state">State</label>
                      <input
                        className={inputCls}
                        id="state" name="state" type="text"
                        placeholder="Maharashtra" required
                        value={formData.state} onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Pincode */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-on-surface" htmlFor="pincode">Postal / PIN Code</label>
                    <input
                      className={inputCls}
                      id="pincode" name="pincode" type="text"
                      placeholder="400001" required
                      value={formData.pincode} onChange={handleChange}
                    />
                  </div>
                </div>

                {/* ── SELLER TOGGLE ── */}
                <label
                  htmlFor="isSeller"
                  className="group cursor-pointer select-none rounded-2xl bg-surface-container-low border border-surface-container-high hover:border-outline p-5 transition-all duration-200 block"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-primary">Merchant Access</span>
                        <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-xs font-semibold uppercase tracking-wider">Privilege</span>
                      </div>
                      <p className="text-sm font-medium text-on-surface">Register as a Verified Seller</p>
                    </div>
                    {/* Toggle */}
                    <div className="shrink-0 pt-0.5">
                      <div className={`w-11 h-6 rounded-full flex items-center p-0.5 transition-colors duration-200 ${formData.isSeller ? "bg-primary" : "bg-surface-container-highest border border-outline-variant"}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${formData.isSeller ? "translate-x-5" : "translate-x-0"}`} />
                      </div>
                      <input className="sr-only" id="isSeller" name="isSeller" type="checkbox" checked={formData.isSeller} onChange={handleChange} />
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    List collections, access analytics, and create your public designer showcase.
                  </p>
                  <div className="mt-4 pt-3 border-t border-surface-container-high/60 flex flex-wrap items-center gap-4 text-secondary text-xs">
                    {["Zero listing fees", "Instant payouts", "Sales dashboard"].map((b) => (
                      <span key={b} className="flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>check_circle</span>
                        {b}
                      </span>
                    ))}
                  </div>
                </label>

                {/* ── TERMS + SUBMIT ── */}
                <div className="flex flex-col gap-5">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      className="mt-0.5 w-4 h-4 rounded border border-outline accent-primary cursor-pointer shrink-0"
                      type="checkbox" required
                    />
                    <span className="text-sm text-on-surface-variant leading-relaxed">
                      I am at least 18 years old and agree to the{" "}
                      <a className="text-primary font-medium underline underline-offset-4 hover:text-on-surface transition-colors" href="#">Terms of Service</a>
                      {" "}and{" "}
                      <a className="text-primary font-medium underline underline-offset-4 hover:text-on-surface transition-colors" href="#">Privacy Policy</a>.
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="w-full h-12 bg-primary text-on-primary rounded-full text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm hover:opacity-90 active:scale-[0.99] transition-all duration-150"
                  >
                    Create Account
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-outline text-xs">
                    <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>lock</span>
                    256-bit encrypted · Your data is safe
                  </div>
                </div>

              </form>
            </div>

            <div className="px-4 sm:px-8 lg:px-10 py-6 border-t border-surface-container-high text-center">
              <p className="text-xs text-outline uppercase tracking-widest">Snitch Studio © 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;