import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProduct } from "../hook/useProduct.js"
import ThreeBackground from "../../../components/ThreeBackground";
import ProductCanvas3D from "../../../components/ProductCanvas3D";

/* ─────────────────────────────────────────────────────────────────────────────
   CURRENCY OPTIONS
───────────────────────────────────────────────────────────────────────────── */
const CURRENCIES = [
  { code: "INR", symbol: "₹", flag: "🇮🇳" },
  { code: "USD", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", flag: "🇬🇧" },
  { code: "AED", symbol: "د.إ", flag: "🇦🇪" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   IMAGE SLOT COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const ImageSlot = ({ index, file, onAdd, onRemove }) => {
  const inputRef = useRef(null);
  const isPrimary = index === 0;

  if (file) {
    return (
      <div className="relative group aspect-square rounded-2xl overflow-hidden border border-surface-container-high">
        <img
          src={URL.createObjectURL(file)}
          alt={`Product image ${index + 1}`}
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-2 rounded-full bg-error/20 border border-error/40 text-error hover:bg-error/40 transition-colors"
            title="Remove"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
          </button>
        </div>
        {/* Primary badge */}
        {isPrimary && (
          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider">
            Cover
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all duration-200 group
        ${isPrimary
          ? "border-primary/50 bg-primary/5 hover:border-primary hover:bg-primary/10"
          : "border-surface-container-high bg-surface-container/40 hover:border-outline hover:bg-surface-container"
        }`}
    >
      <span
        className={`material-symbols-outlined transition-colors ${isPrimary ? "text-primary" : "text-outline group-hover:text-on-surface-variant"}`}
        style={{ fontSize: "22px" }}
      >
        {isPrimary ? "add_photo_alternate" : "add"}
      </span>
      {isPrimary && (
        <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Cover Photo</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          if (e.target.files?.[0]) onAdd(index, e.target.files[0]);
        }}
      />
    </button>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN CREATE PRODUCT PAGE
───────────────────────────────────────────────────────────────────────────── */
const CreateProduct = () => {
  const { handleCreateProduct } = useProduct();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceAmount: "",
    priceCurrency: "INR",
  });
  const [images, setImages] = useState(Array(7).fill(null)); // up to 7 slots
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* ── Shared input class ── */
  const inputCls =
    "w-full h-12 bg-surface-container border border-surface-container-high rounded-xl px-4 text-sm text-on-surface placeholder:text-outline focus:bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 outline-none";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddImage = useCallback((index, file) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  }, []);

  const handleRemoveImage = useCallback((index) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("priceAmount", formData.priceAmount);
      fd.append("priceCurrency", formData.priceCurrency);
      images.forEach((img) => {
        if (img) fd.append("images", img);
      });
      await handleCreateProduct(fd);
      navigate("/home"); // redirect to home after successful upload
    } finally {
      setIsSubmitting(false);
    }
  };

  const filledImages = images.filter(Boolean).length;
  const selectedCurrency = CURRENCIES.find((c) => c.code === formData.priceCurrency);

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="bg-background text-on-surface min-h-screen antialiased font-[Plus_Jakarta_Sans] flex items-center justify-center">
        <ThreeBackground variant="register" />
        <div
          className="relative z-10 text-center p-10 rounded-3xl border border-surface-container-high max-w-sm mx-auto"
          style={{ background: "rgba(18,18,22,0.85)", backdropFilter: "blur(20px)" }}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: "32px" }}>check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Product Listed!</h2>
          <p className="text-sm text-on-surface-variant mb-6">Your product has been submitted and is now live on Snitch.</p>
          <div className="flex gap-3">
            <a
              href="/products"
              className="flex-1 h-11 bg-surface-container border border-surface-container-high rounded-full text-sm font-semibold text-on-surface flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
            >
              View Products
            </a>
            <button
              onClick={() => { setSubmitted(false); setFormData({ title: "", description: "", priceAmount: "", priceCurrency: "INR" }); setImages(Array(7).fill(null)); }}
              className="flex-1 h-11 bg-primary text-on-primary rounded-full text-sm font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
              New Product
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen antialiased font-[Plus_Jakarta_Sans]">
      {/* ── Three.js Background ── */}
      <ThreeBackground variant="register" />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ── Top Nav ── */}
        <header
          className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-2xl"
          style={{ background: "rgba(17,17,19,0.72)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "20px" }}>arrow_back</span>
              <span className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">Back to Snitch</span>
            </a>
            <span className="text-sm font-bold text-on-surface tracking-tight">Snitch</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-outline hidden sm:inline">Seller Studio</span>
            </div>
          </div>
        </header>

        {/* ── Main Grid ── */}
        <div className="min-h-[calc(100vh-3.5rem)] grid lg:grid-cols-[340px_1fr] xl:grid-cols-[400px_1fr]">

          {/* ── LEFT PANEL: 3D + Preview ── */}
          <div
            className="hidden lg:flex flex-col justify-between border-r border-white/10 p-10 xl:p-14 relative overflow-hidden"
            style={{ background: "rgba(18,18,22,0.6)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
          >
            {/* Glow orbs */}
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

            {/* Brand */}
            <div className="relative">
              <span className="text-2xl font-bold tracking-tight text-on-surface">Snitch</span>
            </div>

            {/* 3D Canvas */}
            <div className="relative flex flex-col items-center gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 w-fit" style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold tracking-widest text-secondary uppercase">Create Product</span>
              </div>

              <div>
                <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-on-surface leading-[1.1] mb-2">
                  List your<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    product.
                  </span>
                </h1>
                <p className="text-on-surface-variant text-xs xl:text-sm leading-relaxed max-w-sm">
                  Add stunning images, set your price, and let Snitch Studio connect you to thousands of buyers.
                </p>
              </div>

              {/* 3D Canvas Box */}
              <div className="relative rounded-2xl border border-white/10 w-full overflow-hidden" style={{ height: "220px", background: "rgba(24,24,28,0.5)", backdropFilter: "blur(12px)" }}>
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">Interactive 3D Preview</span>
                  <span className="text-[10px] text-outline font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Move mouse
                  </span>
                </div>
                <ProductCanvas3D />
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-2 w-full">
                {[
                  { icon: "photo_library", title: "7 Images", desc: "High-res support" },
                  { icon: "currency_rupee", title: "Multi-currency", desc: "Global pricing" },
                  { icon: "trending_up", title: "Instant Live", desc: "Zero wait time" },
                ].map((f) => (
                  <div key={f.title} className="p-2.5 rounded-xl border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <span className="material-symbols-outlined text-primary mb-1 block" style={{ fontSize: "18px" }}>{f.icon}</span>
                    <p className="text-xs font-semibold text-on-surface">{f.title}</p>
                    <p className="text-[10px] text-on-surface-variant">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer note */}
            <div className="relative">
              <p className="text-xs text-outline">© 2025 Snitch. All rights reserved.</p>
            </div>
          </div>

          {/* ── RIGHT PANEL: Form ── */}
          <div
            className="flex flex-col overflow-y-auto"
            style={{ background: "rgba(17,17,20,0.65)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
          >
            <div className="flex-1 px-4 sm:px-8 lg:px-10 xl:px-14 py-10">

              {/* Mobile brand */}
              <div className="lg:hidden mb-8 text-center">
                <span className="text-2xl font-bold text-on-surface">Snitch</span>
                <p className="text-sm text-on-surface-variant mt-1">List a new product</p>
              </div>

              {/* Heading */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>inventory_2</span>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">New Product</h2>
                </div>
                <p className="text-sm text-on-surface-variant">Fill in your product details to go live instantly.</p>
              </div>

              {/* ── FORM ── */}
              {/*
                DESKTOP LAYOUT (lg+): 2-column horizontal grid
                  Left  col → Product Info (title, description) + Pricing
                  Right col → Images upload grid + Progress bar + Submit
                MOBILE / TABLET: single-column stacked flow (default flex-col)
              */}
              <form
                className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-0 lg:items-start"
                onSubmit={handleSubmit}
              >

                {/* ════════════════════════════════════════════════════
                    LEFT COLUMN (desktop) — Product Info + Pricing
                ════════════════════════════════════════════════════ */}
                <div className="flex flex-col gap-8 lg:sticky lg:top-24">

                  {/* ── Section: Product Info ── */}
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
                      <span className="text-xs font-semibold tracking-widest text-secondary uppercase">Product Info</span>
                      <span className="text-xs text-outline">Required</span>
                    </div>

                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-on-surface" htmlFor="title">
                        Product Title
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-outline pointer-events-none">
                          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>label</span>
                        </span>
                        <input
                          className={`${inputCls} pl-11`}
                          id="title"
                          name="title"
                          type="text"
                          placeholder="e.g. Vintage Oversized Hoodie"
                          required
                          maxLength={120}
                          value={formData.title}
                          onChange={handleChange}
                        />
                      </div>
                      <span className="text-[11px] text-outline text-right">{formData.title.length}/120</span>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-on-surface" htmlFor="description">
                        Description
                      </label>
                      <textarea
                        className={`${inputCls} h-auto py-3 resize-none leading-relaxed`}
                        id="description"
                        name="description"
                        rows={6}
                        placeholder="Describe your product — material, fit, sizing, care instructions…"
                        required
                        maxLength={1000}
                        value={formData.description}
                        onChange={handleChange}
                      />
                      <span className="text-[11px] text-outline text-right">{formData.description.length}/1000</span>
                    </div>
                  </div>

                  {/* ── Section: Pricing ── */}
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
                      <span className="text-xs font-semibold tracking-widest text-secondary uppercase">Pricing</span>
                      <span className="text-xs text-outline">Visible to buyers</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-on-surface" htmlFor="priceAmount">
                        Price
                      </label>
                      <div className="flex gap-2">
                        {/* Currency selector */}
                        <div className="relative w-36 shrink-0">
                          <select
                            className={`${inputCls} pl-3 pr-8 appearance-none`}
                            name="priceCurrency"
                            value={formData.priceCurrency}
                            onChange={handleChange}
                          >
                            {CURRENCIES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.flag} {c.code}
                              </option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none" style={{ fontSize: "16px" }}>expand_more</span>
                        </div>

                        {/* Amount field */}
                        <div className="relative flex items-center flex-1">
                          <span className="absolute left-4 text-outline font-mono font-semibold text-sm pointer-events-none select-none">
                            {selectedCurrency?.symbol}
                          </span>
                          <input
                            className={`${inputCls} pl-9`}
                            id="priceAmount"
                            name="priceAmount"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            required
                            value={formData.priceAmount}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      {formData.priceAmount && (
                        <div className="flex items-center gap-1.5 text-secondary text-xs">
                          <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>info</span>
                          Listed at {selectedCurrency?.symbol}{Number(formData.priceAmount).toLocaleString()} {formData.priceCurrency}
                        </div>
                      )}
                    </div>
                  </div>

                </div>{/* end left col */}

                {/* ════════════════════════════════════════════════════
                    RIGHT COLUMN (desktop) — Images + Submit
                ════════════════════════════════════════════════════ */}
                <div className="flex flex-col gap-6">

                  {/* ── Section: Images ── */}
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold tracking-widest text-secondary uppercase">Product Images</span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs">
                          {filledImages}/7
                        </span>
                      </div>
                      <span className="text-xs text-outline">First = cover</span>
                    </div>

                    {/* Upload hint */}
                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <span className="material-symbols-outlined text-secondary shrink-0 mt-0.5" style={{ fontSize: "15px" }}>tips_and_updates</span>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Upload up to <strong className="text-on-surface">7 photos</strong>. Square images work best. The first image becomes the cover shown in listings.
                      </p>
                    </div>

                    {/*
                      Image grid — responsive columns:
                        Mobile  (< lg) : 4 cols, same as before
                        Desktop (>= lg): 4 cols but slots are larger because
                                         the right column is now wider
                      Cover slot (index 0) spans 2 cols × 2 rows.
                    */}
                    <div className="grid grid-cols-4 gap-3">
                      {/* Cover — col-span-2 row-span-2 */}
                      <div className="col-span-2 row-span-2">
                        <ImageSlot
                          index={0}
                          file={images[0]}
                          onAdd={handleAddImage}
                          onRemove={handleRemoveImage}
                        />
                      </div>
                      {/* Slots 1 – 6 */}
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <ImageSlot
                          key={i}
                          index={i}
                          file={images[i]}
                          onAdd={handleAddImage}
                          onRemove={handleRemoveImage}
                        />
                      ))}
                    </div>
                  </div>

                  {/* ── Progress + Submit ── */}
                  <div className="flex flex-col gap-4">
                    {/* Completeness card */}
                    <div className="rounded-2xl border border-surface-container-high p-4" style={{ background: "rgba(24,24,28,0.5)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-on-surface-variant">Listing Completeness</span>
                        <span className="text-xs font-bold text-primary">
                          {(formData.title ? 25 : 0) +
                           (formData.description ? 25 : 0) +
                           (formData.priceAmount ? 25 : 0) +
                           (filledImages > 0 ? 25 : 0)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{
                            width: `${
                              (formData.title ? 25 : 0) +
                              (formData.description ? 25 : 0) +
                              (formData.priceAmount ? 25 : 0) +
                              (filledImages > 0 ? 25 : 0)
                            }%`,
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-3 mt-3">
                        {[
                          { label: "Title",       done: !!formData.title },
                          { label: "Description", done: !!formData.description },
                          { label: "Price",       done: !!formData.priceAmount },
                          { label: "Images",      done: filledImages > 0 },
                        ].map((c) => (
                          <span key={c.label} className={`flex items-center gap-1 text-xs ${c.done ? "text-primary" : "text-outline"}`}>
                            <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
                              {c.done ? "check_circle" : "radio_button_unchecked"}
                            </span>
                            {c.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-primary text-on-primary rounded-full text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm hover:opacity-90 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="material-symbols-outlined animate-spin" style={{ fontSize: "18px" }}>progress_activity</span>
                          Publishing…
                        </>
                      ) : (
                        <>
                          Publish Product
                          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>rocket_launch</span>
                        </>
                      )}
                    </button>

                    {/* Security note */}
                    <div className="flex items-center justify-center gap-1.5 text-outline text-xs">
                      <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>lock</span>
                      Your product data is securely transmitted
                    </div>
                  </div>

                </div>{/* end right col */}

              </form>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-8 lg:px-10 py-6 border-t border-surface-container-high text-center">
              <p className="text-xs text-outline uppercase tracking-widest">Snitch Studio © 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;
