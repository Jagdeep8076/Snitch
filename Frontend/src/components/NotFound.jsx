import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div
            className="min-h-screen font-[Plus_Jakarta_Sans] antialiased flex flex-col items-center justify-center p-6 text-center"
            style={{ background: "#111113", color: "#ffffff" }}
        >
            <div className="max-w-md w-full space-y-6">
                <div
                    className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center"
                    style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                    }}
                >
                    <span className="material-symbols-outlined text-white/30" style={{ fontSize: 48 }}>
                        location_off
                    </span>
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/40">
                        404 Error
                    </p>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">
                        Page Not Found
                    </h1>
                    <p className="text-sm text-white/50 leading-relaxed max-w-sm mx-auto">
                        The page or drop you were looking for doesn&apos;t exist, was removed, or has moved to a new collection.
                    </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        to="/collections"
                        id="notfound-continue-shopping-btn"
                        className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all hover:opacity-90 active:scale-[0.98] inline-flex items-center justify-center gap-2"
                        style={{ background: "#ffffff", color: "#111113" }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                            shopping_bag
                        </span>
                        Browse Collections
                    </Link>

                    <Link
                        to="/"
                        id="notfound-home-btn"
                        className="w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-xs transition-all hover:bg-white/10 text-white/70 hover:text-white"
                        style={{ border: "1px solid rgba(255,255,255,0.14)" }}
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
