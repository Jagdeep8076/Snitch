import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import ThreeBackground from "../../../components/ThreeBackground";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const redirectParam = searchParams.get("redirect");
  const safeDestination =
    redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : "/";
  const navigate = useNavigate();

  const { handleVerifyEmail, handleResendVerification } = useAuth();

  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState(""); // "" | "sending" | "sent" | "error"
  const [resendMsg, setResendMsg] = useState("");
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    let isMounted = true;

    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage("Verification link is missing a token. Please request a new verification email.");
        return;
      }

      try {
        const result = await handleVerifyEmail({ token });

        if (!isMounted) return;

        if (result && !result.error) {
          setStatus("success");
          setMessage("Your SNITCH account has been verified successfully! You are now logged in.");
        } else {
          setStatus("error");
          setMessage(result?.message || "Invalid or expired verification link. Please request a new one.");
          if (result?.email) {
            setResendEmail(result.email);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        setStatus("error");
        setMessage(err.message || "Failed to verify email. Please try again.");
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Countdown auto-redirect on success
  useEffect(() => {
    if (status !== "success") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(safeDestination);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate, safeDestination]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setResendStatus("sending");
    setResendMsg("");

    const res = await handleResendVerification({ email: resendEmail.trim() });

    if (res && !res.error) {
      setResendStatus("sent");
      setResendMsg("A fresh verification link has been dispatched to your inbox.");
    } else {
      setResendStatus("error");
      setResendMsg(res?.message || "Could not resend email. Please check your address.");
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen antialiased font-[Plus_Jakarta_Sans] relative flex flex-col justify-between">
      <ThreeBackground variant="login" />

      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-2xl"
        style={{ background: "rgba(17,17,19,0.72)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white">SNITCH</span>
            <span className="text-[10px] uppercase tracking-widest text-secondary px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
              Verification
            </span>
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main card */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div
          className="w-full max-w-md rounded-3xl border border-white/10 p-5 sm:p-8 md:p-10 text-center relative overflow-hidden shadow-2xl backdrop-blur-2xl"
          style={{ background: "rgba(20,20,24,0.75)" }}
        >
          {/* Subtle glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

          {/* VERIFYING STATE */}
          {status === "verifying" && (
            <div className="flex flex-col items-center py-6">
              <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-2xl">
                  hourglass_top
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Verifying Your Account</h2>
              <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
                Please wait while we validate your cryptographic verification token...
              </p>
            </div>
          )}

          {/* SUCCESS STATE */}
          {status === "success" && (
            <div className="flex flex-col items-center py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-emerald-400/20"
                style={{ background: "rgba(16, 185, 129, 0.12)" }}
              >
                <span className="material-symbols-outlined text-emerald-400 text-3xl">
                  verified
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Verified
              </div>

              <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                Account Activated!
              </h2>

              <p className="text-sm text-emerald-300 font-medium mb-4 max-w-sm">
                &ldquo;{message}&rdquo;
              </p>

              <p className="text-xs text-on-surface-variant mb-6">
                Redirecting you to the studio in{" "}
                <span className="text-white font-bold">{countdown}s</span>...
              </p>

              <button
                type="button"
                onClick={() => navigate(safeDestination)}
                className="w-full h-12 bg-white text-black font-bold text-sm uppercase tracking-wider rounded-full shadow-lg hover:bg-gray-100 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                Continue Shopping
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          )}

          {/* ERROR STATE */}
          {status === "error" && (
            <div className="flex flex-col items-center py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-red-400/20"
                style={{ background: "rgba(239, 68, 68, 0.12)" }}
              >
                <span className="material-symbols-outlined text-red-400 text-3xl">
                  link_off
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-400/20 bg-red-500/10 text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Verification Failed
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight mb-2">
                Invalid or Expired Link
              </h2>

              <p className="text-sm text-red-300 mb-6 max-w-sm leading-relaxed">
                {message}
              </p>

              {/* Resend form */}
              <form onSubmit={handleResend} className="w-full flex flex-col gap-3 text-left">
                <label className="text-xs font-medium text-white/70" htmlFor="resendEmail">
                  Need a new verification link?
                </label>

                <div className="flex gap-2">
                  <input
                    id="resendEmail"
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 h-11 bg-surface-container border border-surface-container-high rounded-xl px-3.5 text-xs text-on-surface placeholder:text-outline outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={resendStatus === "sending"}
                    className="h-11 px-4 bg-primary text-on-primary rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition"
                  >
                    {resendStatus === "sending" ? "Sending..." : "Resend"}
                  </button>
                </div>

                {resendMsg && (
                  <p
                    className={`text-xs mt-1 ${
                      resendStatus === "sent" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {resendMsg}
                  </p>
                )}
              </form>

              <div className="mt-8 pt-6 border-t border-white/10 w-full flex items-center justify-between text-xs text-on-surface-variant">
                <Link to="/login" className="hover:text-white transition">
                  Back to Login
                </Link>
                <Link to="/register" className="hover:text-white transition">
                  Create New Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-outline border-t border-white/5">
        &copy; {new Date().getFullYear()} SNITCH Studio. All rights reserved.
      </footer>
    </div>
  );
};

export default VerifyEmail;
