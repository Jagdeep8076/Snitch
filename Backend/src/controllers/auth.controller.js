import crypto from "crypto";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { config } from "../config/config.js";
import { sendVerificationEmail } from "../services/email.service.js";

/**
 * Standard HTTP-only cookie options for JWT session persistence.
 */
export const getAuthCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
});

/**
 * Issues JWT cookie and returns sanitized user payload.
 */
export async function sendTokenResponse(user, res, message) {
    const token = jwt.sign(
        { id: user._id },
        config.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.cookie("token", token, getAuthCookieOptions());

    const userPayload = {
        id: user._id,
        email: user.email,
        contact: user.contact,
        fullname: user.fullname,
        role: user.role,
        emailVerified: user.emailVerified,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
    };

    return res.status(200).json({
        message,
        success: true,
        user: userPayload,
        ...userPayload,
    });
}

/**
 * Phase 2: Register user with email & password.
 * Generates single-use crypto verification token and sends verification email.
 * Does NOT establish a session until verified.
 */
export const register = async (req, res) => {
    const {
        email,
        contact,
        password,
        fullname,
        address,
        city,
        state,
        pincode,
        isSeller,
    } = req.body;

    try {
        const normalizedEmail = (email || "").trim().toLowerCase();

        const query = [{ email: normalizedEmail }];
        if (contact && contact.trim()) {
            query.push({ contact: contact.trim() });
        }

        const existingUser = await userModel.findOne({ $or: query });

        if (existingUser) {
            // If existing account is unverified and matches email, re-issue verification email
            if (!existingUser.emailVerified && existingUser.email === normalizedEmail) {
                const rawToken = crypto.randomBytes(32).toString("hex");
                const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

                existingUser.verificationTokenHash = hashedToken;
                existingUser.verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
                if (password) {
                    existingUser.password = password;
                }
                if (fullname) {
                    existingUser.fullname = fullname.trim();
                }
                await existingUser.save();

                await sendVerificationEmail({
                    email: existingUser.email,
                    fullname: existingUser.fullname,
                    token: rawToken,
                });

                return res.status(200).json({
                    success: true,
                    message: "Registration successful! Please check your email to verify your account.",
                    email: existingUser.email,
                });
            }

            return res.status(400).json({
                success: false,
                message: "User with this email or contact already exists",
            });
        }

        // Generate cryptographically secure single-use verification token
        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const user = await userModel.create({
            email: normalizedEmail,
            contact: contact ? contact.trim() : undefined,
            password,
            fullname: fullname.trim(),
            address: address ? address.trim() : undefined,
            city: city ? city.trim() : undefined,
            state: state ? state.trim() : undefined,
            pincode: pincode ? pincode.trim() : undefined,
            role: isSeller ? "seller" : "buyer",
            emailVerified: false,
            verificationTokenHash: hashedToken,
            verificationTokenExpiresAt: expiresAt,
        });

        // Send branded verification email (token is never stored plaintext or leaked to client)
        await sendVerificationEmail({
            email: user.email,
            fullname: user.fullname,
            token: rawToken,
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful! Please check your email to verify your account.",
            email: user.email,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "User with this email or contact already exists",
            });
        }
        console.error("REGISTER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

/**
 * Phase 3: Validate verification token, activate account, and establish authenticated session.
 */
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token || typeof token !== "string") {
            return res.status(400).json({
                success: false,
                message: "Verification token is required",
            });
        }

        const hashedToken = crypto.createHash("sha256").update(token.trim()).digest("hex");

        const user = await userModel.findOne({
            verificationTokenHash: hashedToken,
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or already-used verification link.",
            });
        }

        if (!user.verificationTokenExpiresAt || user.verificationTokenExpiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Verification link has expired. Please request a new verification email.",
                expired: true,
                email: user.email,
            });
        }

        // Activate user and invalidate verification token
        user.emailVerified = true;
        user.verificationTokenHash = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        // Establish session and issue cookie
        return sendTokenResponse(
            user,
            res,
            "Your SNITCH account has been verified successfully! You are now logged in."
        );
    } catch (error) {
        console.error("EMAIL VERIFICATION ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during email verification",
        });
    }
};

/**
 * Phase 3: Resend verification email for an unverified account.
 */
export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = (email || "").trim().toLowerCase();

        if (!normalizedEmail) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const user = await userModel.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email. Please register first.",
                notRegistered: true,
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: "This account is already verified. Please sign in.",
                alreadyVerified: true,
            });
        }

        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        user.verificationTokenHash = hashedToken;
        user.verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        await sendVerificationEmail({
            email: user.email,
            fullname: user.fullname,
            token: rawToken,
        });

        return res.status(200).json({
            success: true,
            message: "A new verification email has been sent. Please check your inbox.",
        });
    } catch (error) {
        console.error("RESEND VERIFICATION ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while resending verification email",
        });
    }
};

/**
 * Phase 4: Login user with email & password.
 * Checks password and enforces verified status.
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const normalizedEmail = (email || "").trim().toLowerCase();
        const user = await userModel.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Login failed. Invalid email or password.",
                notRegistered: true,
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Login failed. Invalid email or password.",
            });
        }

        if (!user.emailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in.",
                isUnverified: true,
                email: user.email,
            });
        }

        return sendTokenResponse(
            user,
            res,
            "User logged in successfully"
        );
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

/**
 * Phase 5 & 6: Google OAuth callback.
 * Explicitly separates Registration from Login semantics via OAuth state.
 */
export const googleCallback = async (req, res) => {
    try {
        let stateObj = { action: "login", redirect: "/" };
        if (req.query.state) {
            try {
                stateObj = JSON.parse(Buffer.from(req.query.state, "base64").toString("utf8"));
            } catch (_) {}
        }

        const action = stateObj.action || "login";

        // Sanitize redirect to prevent open redirects (must start with / and not //)
        let redirectTarget = stateObj.redirect || "/";
        if (typeof redirectTarget !== "string" || !redirectTarget.startsWith("/") || redirectTarget.startsWith("//")) {
            redirectTarget = "/";
        }

        const email = req.user?.emails?.[0]?.value?.toLowerCase()?.trim();
        const fullname = req.user?.displayName || "Google User";
        const googleId = req.user?.id;

        if (!email) {
            return res.redirect(
                `http://localhost:5173/${action === "register" ? "register" : "login"}?error=google_email_missing`
            );
        }

        let user = await userModel.findOne({ email });

        if (action === "register") {
            // PHASE 5: Explicit Google Registration
            if (!user) {
                user = await userModel.create({
                    email,
                    fullname,
                    googleId,
                    role: "buyer",
                    emailVerified: true,
                });
            } else {
                // Account already exists with this email: link Google ID safely
                if (!user.googleId) {
                    user.googleId = googleId;
                }
                user.emailVerified = true;
                await user.save();
            }

            const token = jwt.sign(
                { id: user._id },
                config.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.cookie("token", token, getAuthCookieOptions());

            const separator = redirectTarget.includes("?") ? "&" : "?";
            return res.redirect(`http://localhost:5173${redirectTarget}${separator}auth=google_success`);
        } else {
            // PHASE 6: Explicit Google Login - DO NOT silently register unknown users!
            if (!user) {
                const message = encodeURIComponent("No account found. Please register with Google first.");
                return res.redirect(`http://localhost:5173/register?error=no_account&message=${message}`);
            }

            // Existing account: authenticate and link googleId if missing
            if (!user.googleId) {
                user.googleId = googleId;
            }
            user.emailVerified = true;
            await user.save();

            const token = jwt.sign(
                { id: user._id },
                config.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.cookie("token", token, getAuthCookieOptions());

            return res.redirect(`http://localhost:5173${redirectTarget}`);
        }
    } catch (error) {
        console.error("GOOGLE AUTH ERROR:", error);
        return res.redirect("http://localhost:5173/login?error=google_auth_failed");
    }
};

/**
 * Phase 7: Fetch current authenticated user.
 */
export const getMe = async (req, res) => {
    const user = req.user;

    res.status(200).json({
        message: "User Fetched Successfully",
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role,
            emailVerified: user.emailVerified,
            address: user.address,
            city: user.city,
            state: user.state,
            pincode: user.pincode,
        },
    });
};

/**
 * Phase 7: Logout user by clearing authentication cookie.
 */
export const logout = async (req, res) => {
    try {
        res.clearCookie("token", getAuthCookieOptions());

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("LOGOUT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
