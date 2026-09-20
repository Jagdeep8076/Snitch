import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { useAuth } from "../hook/useAuth";
import ThreeBackground from "../../../components/ThreeBackground";
import StudioPass3D from "../../../components/StudioPass3D";

const Login = () => {
    const { handleLogin } = useAuth();
    const navigate = useNavigate();

    const { loading, error } = useSelector(
        (state) => state.auth
    );

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = await handleLogin({
            email: formData.email,
            password: formData.password,
        });

        if (data?.success) {
            console.log("LOGIN SUCCESS → HOME");

            navigate("/", {
                replace: true,
            });
        }
    };

    return (
        <div className="bg-background text-on-surface min-h-screen antialiased font-[Plus_Jakarta_Sans]">

            <ThreeBackground variant="login" />

            <div className="relative z-10">

                <header
                    className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-2xl"
                    style={{
                        background: "rgba(17,17,19,0.72)",
                    }}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

                        <Link
                            to="/"
                            className="flex items-center gap-1.5"
                        >
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
                            <span className="text-xs text-outline hidden sm:inline">
                                New to Snitch?
                            </span>

                            <Link
                                to="/register"
                                className="text-sm font-semibold text-primary hover:underline underline-offset-4 transition-colors"
                            >
                                Create Account
                            </Link>
                        </div>

                    </div>
                </header>

                <div className="min-h-[calc(100vh-3.5rem)] grid lg:grid-cols-[1fr_520px] xl:grid-cols-[1fr_580px]">

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
                            <span className="text-2xl font-bold tracking-tight text-on-surface">
                                Snitch
                            </span>
                        </div>

                        <div className="relative flex flex-col gap-6">

                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 w-fit"
                                style={{
                                    background: "rgba(255,255,255,0.04)",
                                }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />

                                <span className="text-xs font-semibold tracking-widest text-secondary uppercase">
                                    Studio Access
                                </span>
                            </div>

                            <div>

                                <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-on-surface leading-[1.1] mb-2">
                                    Welcome back to
                                    <br />

                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                        Snitch Studio.
                                    </span>
                                </h1>

                                <p className="text-on-surface-variant text-xs xl:text-sm leading-relaxed max-w-sm">
                                    Access your account, manage your collections,
                                    track orders, and continue your Snitch journey.
                                </p>

                            </div>

                            <div
                                className="relative rounded-2xl border border-white/10 p-4"
                                style={{
                                    background: "rgba(24,24,28,0.5)",
                                    backdropFilter: "blur(12px)",
                                }}
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

                        </div>

                        <div className="relative">
                            <p className="text-xs text-outline">
                                © 2025 Snitch. All rights reserved.
                            </p>
                        </div>

                    </div>

                    <div
                        className="flex flex-col min-h-[calc(100vh-3.5rem)]"
                        style={{
                            background: "rgba(17,17,20,0.65)",
                            backdropFilter: "blur(24px)",
                            WebkitBackdropFilter: "blur(24px)",
                        }}
                    >

                        <div className="flex-1 flex items-center">

                            <div className="w-full px-4 sm:px-8 lg:px-10 xl:px-12 py-10">

                                <div className="lg:hidden mb-10 text-center">

                                    <span className="text-2xl font-bold text-on-surface">
                                        Snitch
                                    </span>

                                    <p className="text-sm text-on-surface-variant mt-1">
                                        Access your Studio
                                    </p>

                                </div>

                                <div className="mb-8">

                                    <div className="flex items-center gap-2 mb-4">

                                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />

                                        <span className="text-xs font-semibold tracking-widest text-secondary uppercase">
                                            Secure Authentication
                                        </span>

                                    </div>

                                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
                                        Welcome Back
                                    </h2>

                                    <p className="text-sm text-on-surface-variant mt-1">
                                        Access your Snitch Studio account.
                                    </p>

                                </div>

                                {error && (
                                    <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 flex items-start gap-3">

                                        <span
                                            className="material-symbols-outlined text-red-400"
                                            style={{ fontSize: "18px" }}
                                        >
                                            error
                                        </span>

                                        <p className="text-sm text-red-300">
                                            {error}
                                        </p>

                                    </div>
                                )}

                                <form
                                    onSubmit={handleSubmit}
                                    className="flex flex-col gap-6"
                                >

                                    <div className="flex flex-col gap-1.5">

                                        <label
                                            className="text-sm font-medium text-on-surface"
                                            htmlFor="email"
                                        >
                                            Email Address
                                        </label>

                                        <input
                                            className="w-full h-12 bg-surface-container border border-surface-container-high rounded-xl px-4 text-sm text-on-surface placeholder:text-outline focus:bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 outline-none"
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="you@example.com"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                        />

                                    </div>

                                    <div className="flex flex-col gap-1.5">

                                        <label
                                            className="text-sm font-medium text-on-surface"
                                            htmlFor="password"
                                        >
                                            Password
                                        </label>

                                        <div className="relative">

                                            <input
                                                className="w-full h-12 bg-surface-container border border-surface-container-high rounded-xl px-4 pr-12 text-sm text-on-surface placeholder:text-outline focus:bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 outline-none"
                                                id="password"
                                                name="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                autoComplete="current-password"
                                                placeholder="Enter your password"
                                                required
                                                minLength={6}
                                                value={formData.password}
                                                onChange={handleChange}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        (prev) => !prev
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                                            >
                                                <span
                                                    className="material-symbols-outlined"
                                                    style={{
                                                        fontSize: "18px",
                                                    }}
                                                >
                                                    {showPassword
                                                        ? "visibility_off"
                                                        : "visibility"}
                                                </span>
                                            </button>

                                        </div>

                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 bg-primary text-on-primary rounded-full text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm hover:opacity-90 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >

                                        {loading ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin">
                                                    progress_activity
                                                </span>

                                                AUTHENTICATING...
                                            </>
                                        ) : (
                                            <>
                                                ENTER STUDIO

                                                <span
                                                    className="material-symbols-outlined"
                                                    style={{
                                                        fontSize: "18px",
                                                    }}
                                                >
                                                    arrow_forward
                                                </span>
                                            </>
                                        )}

                                    </button>

<div className="flex items-center gap-4 my-1">
    <div className="flex-1 h-px bg-surface-container-high" />
    <span className="text-xs text-outline uppercase tracking-wider">
        Or continue with
    </span>
    <div className="flex-1 h-px bg-surface-container-high" />
</div>

<a
    href="/api/auth/google"
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

                                </form>

                                <div className="mt-8 text-center">

                                    <p className="text-sm text-on-surface-variant">
                                        New to Snitch?{" "}

                                        <Link
                                            to="/register"
                                            className="font-semibold text-primary hover:underline underline-offset-4 transition-colors"
                                        >
                                            Create an account
                                        </Link>
                                    </p>

                                </div>

                                <div className="mt-8 flex items-center justify-center gap-1.5 text-outline text-xs">

                                    <span
                                        className="material-symbols-outlined"
                                        style={{ fontSize: "13px" }}
                                    >
                                        lock
                                    </span>

                                    Secure authentication · Your data is protected

                                </div>

                            </div>

                        </div>

                        <div className="px-4 sm:px-8 lg:px-10 py-6 border-t border-surface-container-high text-center">

                            <p className="text-xs text-outline uppercase tracking-widest">
                                Snitch Studio © 2026
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Login;