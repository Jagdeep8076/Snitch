import React from "react";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────
   Snitch – About Page
   Theme: original dark #111113 + indigo/violet accent (preserved)
   Improvements: richer sections, proper spacing, stat strip,
   process table, builder card, editorial feel — no new colors
───────────────────────────────────────────────────────────────*/

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .sn-about {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #111113;
    color: #e8e8ea;
    -webkit-font-smoothing: antialiased;
  }
  .sn-about *, .sn-about *::before, .sn-about *::after { box-sizing: border-box; }

  /* Ticker */
  .sn-ticker-wrap { overflow: hidden; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); padding: 11px 0; }
  .sn-ticker-track { display: flex; white-space: nowrap; animation: snTicker 22s linear infinite; }
  @keyframes snTicker { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  /* Gradient text */
  .sn-grad { background: linear-gradient(115deg, #e8e8ea 0%, #a5b4fc 55%, #c7d2fe 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

  /* Cards */
  .sn-card { background: rgba(22,22,27,0.7); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; }
  .sn-card-sm { background: rgba(22,22,27,0.55); border: 1px solid rgba(255,255,255,0.055); border-radius: 14px; }

  /* Step rows */
  .sn-step:not(:last-child) { border-bottom: 1px solid rgba(255,255,255,0.05); }

  /* Role badge */
  .sn-badge-seller { background: rgba(165,180,252,0.1); border: 1px solid rgba(165,180,252,0.2); color: #a5b4fc; border-radius: 6px; padding: 3px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; }
  .sn-badge-buyer  { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); border-radius: 6px; padding: 3px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; }

  /* Pill tags */
  .sn-pill { display: inline-block; padding: 5px 13px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 999px; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.45); letter-spacing: 0.03em; }

  /* Buttons */
  .sn-btn-primary { display: inline-flex; align-items: center; justify-content: center; padding: 14px 32px; background: #fff; color: #111113; font-family: 'Plus Jakarta Sans',sans-serif; font-weight: 800; font-size: 13px; letter-spacing: 0.04em; text-transform: uppercase; border-radius: 999px; text-decoration: none; transition: background 0.15s, transform 0.1s; }
  .sn-btn-primary:hover { background: rgba(255,255,255,0.88); }
  .sn-btn-ghost  { display: inline-flex; align-items: center; justify-content: center; padding: 13px 32px; border: 1px solid rgba(255,255,255,0.14); color: rgba(255,255,255,0.65); font-family: 'Plus Jakarta Sans',sans-serif; font-weight: 800; font-size: 13px; letter-spacing: 0.04em; text-transform: uppercase; border-radius: 999px; text-decoration: none; transition: border-color 0.15s, color 0.15s; }
  .sn-btn-ghost:hover { border-color: rgba(255,255,255,0.3); color: #fff; }

  /* Divider */
  .sn-divider { border: none; border-top: 1px solid rgba(255,255,255,0.05); margin: 0; }

  /* Icon circle */
  .sn-icon-wrap { width: 44px; height: 44px; border-radius: 12px; background: rgba(165,180,252,0.1); border: 1px solid rgba(165,180,252,0.18); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

  /* Stat label */
  .sn-stat-num { font-size: clamp(36px, 5vw, 52px); font-weight: 800; color: #fff; letter-spacing: -0.04em; line-height: 1; margin: 0 0 6px; }
  .sn-stat-label { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.3); margin: 0; }

  /* Glow orbs */
  .sn-orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(110px); opacity: 0.12; }

  @media (max-width: 768px) {
    .sn-grid-2 { grid-template-columns: 1fr !important; }
    .sn-grid-4 { grid-template-columns: 1fr 1fr !important; }
    .sn-step { grid-template-columns: 40px 1fr !important; }
    .sn-step .sn-step-badge { display: none; }
    .sn-step .sn-step-desc { grid-column: 2 !important; }
    .sn-hero-text { font-size: clamp(44px, 12vw, 72px) !important; }
  }
`;

/* ── Ticker ──────────────────────────────────────────── */
const Ticker = () => {
  const words = [
    "Independent Sellers", "Exclusive Drops", "Zero Restocks",
    "Authentic Streetwear", "No Fast Fashion", "Curated Only",
    "Independent Sellers", "Exclusive Drops", "Zero Restocks",
    "Authentic Streetwear", "No Fast Fashion", "Curated Only",
  ];
  return (
    <div className="sn-ticker-wrap">
      <div className="sn-ticker-track" style={{ gap: "0 40px" }}>
        {words.map((w, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.18)", textTransform: "uppercase" }}>{w}</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(165,180,252,0.5)", display: "inline-block", flexShrink: 0 }} />
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── Feature card ────────────────────────────────────── */
const FeatureCard = ({ icon, title, desc }) => (
  <div className="sn-card-sm" style={{ padding: "24px" }}>
    <div className="sn-icon-wrap" style={{ marginBottom: 16 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#a5b4fc" }}>{icon}</span>
    </div>
    <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>{title}</p>
    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.65, margin: 0 }}>{desc}</p>
  </div>
);

/* ── Stat block ──────────────────────────────────────── */
const StatBlock = ({ num, label }) => (
  <div style={{ padding: "36px 32px", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
    <p className="sn-stat-num sn-grad">{num}</p>
    <p className="sn-stat-label">{label}</p>
  </div>
);

/* ── Main ────────────────────────────────────────────── */
const About = () => {

  const features = [
    { icon: "storefront",      title: "Seller Marketplace",  desc: "Independent sellers create their own storefronts, upload product images, and manage stock directly." },
    { icon: "local_shipping",  title: "Free 3–5 Day Delivery",desc: "Every order ships free. No minimum cart value, no surprise fees at checkout." },
    { icon: "verified",        title: "Authenticity Guaranteed", desc: "Every item is listed directly by its creator. No resellers, no grey imports, no fakes." },
    { icon: "style",           title: "Limited Drops Only",  desc: "Once a size sells out it's gone. No restocks, no reprints — exclusivity is the product." },
  ];

  const steps = [
    { n: "01", who: "Seller", title: "List a product",      desc: "Sellers register, create a product listing, upload images via cloud storage, and add variants — size, colour, material — along with individual stock counts and pricing per variant." },
    { n: "02", who: "Buyer",  title: "Discover the drop",   desc: "Buyers browse Collections or New Arrivals, or search by name. Each product card surfaces the image, price, and available sizes so decisions happen before clicking through." },
    { n: "03", who: "Buyer",  title: "Select a variant",    desc: "On the product detail page, the buyer chooses the exact combination they want. Unavailable combinations are visually disabled to prevent dead-end selections." },
    { n: "04", who: "Buyer",  title: "Add to bag",          desc: "The system validates live stock before adding. Duplicate entries are caught silently and a clear confirmation message appears in place of a noisy modal." },
    { n: "05", who: "Buyer",  title: "Manage bag",          desc: "Buyers adjust quantities with real-time stock enforcement, remove individual items, or clear the bag entirely. Every change reflects immediately without a page reload." },
    { n: "06", who: "Buyer",  title: "Checkout",            desc: "The buyer reviews the itemised order, enters delivery details, and completes the purchase in a single clean flow — no account wall, no hidden steps." },
  ];

  const stack = ["React", "Redux Toolkit", "Node.js", "Express.js", "MongoDB", "JWT Auth", "ImageKit", "Three.js", "GSAP", "TailwindCSS"];

  return (
    <div className="sn-about">
      <style>{STYLES}</style>

      {/* spacer for fixed nav */}
      <div style={{ height: 72 }} />

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── HERO ── */}
      <section style={{ position: "relative", padding: "100px 24px 80px", textAlign: "center", overflow: "hidden" }}>
        <div className="sn-orb" style={{ width: 700, height: 700, background: "#4f46e5", top: -260, left: "50%", transform: "translateX(-50%)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto" }}>
          <h1
            className="sn-hero-text"
            style={{ fontWeight: 800, fontSize: "clamp(48px,7vw,88px)", letterSpacing: "-0.04em", lineHeight: 1.0, color: "#fff", margin: "0 0 28px" }}
          >
            About{" "}
            <span className="sn-grad">Snitch</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, maxWidth: 560, margin: "0 auto 40px" }}>
            A marketplace built for the streets. Snitch connects independent fashion sellers with buyers who live for exclusive drops, premium quality, and a look that's genuinely theirs.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/collections" className="sn-btn-primary">Browse Collections</Link>
            <Link to="/new-arrivals" className="sn-btn-ghost">New Arrivals</Link>
          </div>
        </div>
      </section>

      {/* ── STAT STRIP ── */}
      <div style={{ background: "rgba(16,16,20,0.8)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }} className="sn-grid-4">
          <StatBlock num="100%" label="Authenticity guaranteed on every item" />
          <StatBlock num="3–5d"  label="Standard delivery, always free" />
          <StatBlock num="Zero"  label="Restocks — if it's gone, it's gone" />
          <div style={{ padding: "36px 32px" }}>
            <p className="sn-stat-num" style={{ color: "#fff" }}>∞</p>
            <p className="sn-stat-label">Independent sellers on the platform</p>
          </div>
        </div>
      </div>

      {/* ── WHAT IS SNITCH ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "start" }} className="sn-grid-2">
          {/* Left */}
          <div>
            <h2 style={{ fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>
              Your go-to destination for streetwear culture
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, margin: "0 0 16px" }}>
              Snitch solves a real problem — finding authentic, high-quality streetwear from independent designers has always meant bouncing between a dozen Instagram pages and Depop storefronts with no unified experience.
            </p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, margin: "0 0 32px" }}>
              We bring every independent seller into one platform with proper inventory management, variant selection, and a checkout that actually works. No noise. No fast fashion. Just curated pieces from sellers who care.
            </p>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <div style={{ height: 40, width: 1, background: "rgba(255,255,255,0.08)" }} />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: 0, lineHeight: 1.6 }}>
                Every listing is reviewed. Every seller is verified. Every piece is one-of-a-kind.
              </p>
            </div>
          </div>

          {/* Right: feature cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      <hr className="sn-divider" />

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: "rgba(14,14,18,0.6)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px" }}>

          {/* Section header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56, gap: 24, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.1, margin: 0 }}>
              How Snitch works
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", margin: 0, maxWidth: 340, lineHeight: 1.6 }}>
              The complete buyer–seller flow, from first listing to doorstep delivery.
            </p>
          </div>

          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "52px 1fr 2.2fr 72px", gap: 20, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 4 }}>
            {["Step", "Action", "Details", "Role"].map((h) => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</span>
            ))}
          </div>

          {/* Step rows */}
          <div>
            {steps.map((s) => (
              <div
                key={s.n}
                className="sn-step"
                style={{ display: "grid", gridTemplateColumns: "52px 1fr 2.2fr 72px", gap: 20, alignItems: "center", padding: "22px 0" }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.2)", fontVariantNumeric: "tabular-nums" }}>{s.n}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{s.title}</span>
                <span className="sn-step-desc" style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.65 }}>{s.desc}</span>
                <span className="sn-step-badge" style={{ textAlign: "right" }}>
                  <span className={s.who === "Seller" ? "sn-badge-seller" : "sn-badge-buyer"}>{s.who}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="sn-divider" />

      {/* ── WHO BUILT THIS ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }} className="sn-grid-2">
          {/* Left: copy */}
          <div>
            <h2 style={{ fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>
              Built by one person, end to end.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, margin: "0 0 16px" }}>
              Snitch is a solo full-stack project by Jagdeep — designed and built as a production-grade marketplace demonstrating a complete multi-role architecture: seller product management, buyer cart and checkout, JWT-based authentication, and cloud image storage.
            </p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.8 }}>
              MERN stack at the core, Redux Toolkit for predictable state, ImageKit for cloud media, and Three.js + GSAP for the visual layer.
            </p>
          </div>

          {/* Right: card */}
          <div className="sn-card" style={{ padding: 36 }}>
            {/* Builder identity */}
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28, paddingBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: "linear-gradient(135deg, #e8e8ea, #a5b4fc)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 800, color: "#111113",
              }}>J</div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: "0 0 3px" }}>Jagdeep</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: 0, fontWeight: 500 }}>Full-Stack Developer · Snitch Creator</p>
              </div>
            </div>

            {/* What was built */}
            <div style={{ marginBottom: 24 }}>
              {[
                { label: "Architecture", value: "MERN (MongoDB, Express, React, Node)" },
                { label: "Auth",         value: "JWT — role-based (Seller / Buyer)" },
                { label: "Media",        value: "ImageKit cloud storage & CDN" },
                { label: "Visual layer", value: "Three.js + GSAP animations" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", fontWeight: 600 }}>{row.label}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Tech stack pills */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Full stack</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {stack.map((t) => <span className="sn-pill" key={t}>{t}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "96px 24px", textAlign: "center" }}>
          <div className="sn-card" style={{ padding: "64px 48px" }}>
            <h2 style={{ fontSize: "clamp(26px,3.5vw,36px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.15, margin: "0 0 16px" }}>
              Ready to explore?
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.38)", lineHeight: 1.75, margin: "0 0 36px" }}>
              Browse the collection and find your next statement piece — curated drops from independent sellers who actually care about what they make.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/collections" className="sn-btn-primary">Browse Collections</Link>
              <Link to="/new-arrivals" className="sn-btn-ghost">New Arrivals</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;