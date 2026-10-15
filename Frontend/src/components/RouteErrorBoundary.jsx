import React from "react";
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

const RouteErrorBoundary = () => {
    const error = useRouteError();

    let title = "Something went wrong";
    let message = "An unexpected error occurred while loading this page.";
    let statusCode = null;

    if (isRouteErrorResponse(error)) {
        statusCode = error.status;
        if (error.status === 404) {
            title = "Page Not Found";
            message = error.data?.message || "The page you are looking for doesn't exist or has moved.";
        } else if (error.status === 401 || error.status === 403) {
            title = "Access Denied";
            message = "You don't have permission to access this page.";
        } else {
            title = error.statusText || "Request Error";
            message = error.data?.message || message;
        }
    } else if (error instanceof Error) {
        message = error.message;
    }

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
                    <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 48, color: statusCode === 404 ? "#94a3b8" : "#f87171" }}
                    >
                        {statusCode === 404 ? "explore_off" : "warning"}
                    </span>
                </div>

                <div className="space-y-2">
                    {statusCode && (
                        <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/40">
                            Error {statusCode}
                        </p>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        {title}
                    </h1>
                    <p className="text-sm text-white/50 leading-relaxed max-w-sm mx-auto">
                        {message}
                    </p>
                </div>

                {/* Recovery Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        to="/collections"
                        id="error-boundary-collections-btn"
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
                        id="error-boundary-home-btn"
                        className="w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-xs transition-all hover:bg-white/10 text-white/70 hover:text-white"
                        style={{ border: "1px solid rgba(255,255,255,0.14)" }}
                    >
                        Back to Home
                    </Link>

                    <Link
                        to="/cart"
                        id="error-boundary-cart-btn"
                        className="w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-xs transition-all hover:bg-white/10 text-white/70 hover:text-white"
                        style={{ border: "1px solid rgba(255,255,255,0.14)" }}
                    >
                        View Cart
                    </Link>
                </div>

                <div className="pt-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="text-xs text-white/30 hover:text-white/60 transition underline underline-offset-4"
                    >
                        Reload application
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RouteErrorBoundary;
