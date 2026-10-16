import { Router } from "express";
import passport from "passport";
import {
    validateLoginUser,
    validateRegisterUser,
    validateVerifyEmail,
    validateResendVerification,
} from "../validator/auth.validator.js";
import {
    getMe,
    googleCallback,
    login,
    register,
    verifyEmail,
    resendVerification,
    logout,
} from "../controllers/auth.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router();

// Phase 2: Registration
router.post("/register", validateRegisterUser, register);

// Phase 3: Email Verification
router.post("/verify-email", validateVerifyEmail, verifyEmail);
router.post("/resend-verification", validateResendVerification, resendVerification);

// Phase 4: Login
router.post("/login", validateLoginUser, login);

// Phase 5 & 6: Google OAuth with explicit action (register vs login) & redirect preservation
router.get("/google", (req, res, next) => {
    const action = req.query.action === "register" ? "register" : "login";
    const redirect = typeof req.query.redirect === "string" ? req.query.redirect : "/";
    const statePayload = Buffer.from(JSON.stringify({ action, redirect })).toString("base64");

    passport.authenticate("google", {
        scope: ["profile", "email"],
        state: statePayload,
    })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
    // If the user cancelled Google authentication or an error occurred
    if (req.query.error) {
        let returnUrl = "http://localhost:5173/login?cancelled=true";
        try {
            if (req.query.state) {
                const parsed = JSON.parse(Buffer.from(req.query.state, "base64").toString("utf8"));
                if (parsed.action === "register") {
                    returnUrl = "http://localhost:5173/register?cancelled=true";
                }
            }
        } catch (_) {}
        return res.redirect(returnUrl);
    }

    passport.authenticate("google", {
        session: false,
        failureRedirect: "http://localhost:5173/login?error=google-auth-failed",
    })(req, res, next);
}, googleCallback);

// Phase 7: Session management
router.post("/logout", logout);
router.get("/me", authenticateUser, getMe);

export default router;