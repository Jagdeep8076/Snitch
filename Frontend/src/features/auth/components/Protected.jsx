import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Protected route component.
 * - Preserves user's current destination in location.state.from so they can return after login.
 * - If no user, redirect to /login.
 * - If role is specified and user.role does not match, redirect to /.
 * - If no role specified, any authenticated user can pass.
 */
const Protected = ({ children, role }) => {
    const user = useSelector((state) => state.auth.user);
    const loading = useSelector((state) => state.auth.loading);
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-xs text-white/50 animate-pulse font-mono tracking-widest uppercase">
                    Loading studio...
                </p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If a specific role is required, check it
    if (role && user.role !== role) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default Protected;
