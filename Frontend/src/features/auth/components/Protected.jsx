import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * Protected route component.
 * - If no user, redirect to /login.
 * - If role is specified and user.role does not match, redirect to /.
 * - If no role specified, any authenticated user can pass.
 */
const Protected = ({ children, role }) => {
    const user = useSelector(state => state.auth.user);
    const loading = useSelector(state => state.auth.loading);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-sm text-white/50 animate-pulse">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If a specific role is required, check it
    if (role && user.role !== role) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default Protected;
