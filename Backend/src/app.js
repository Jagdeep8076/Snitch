import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import authRouter from "./routes/auth.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";

import cors from "cors";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "./config/config.js";

const app = express();

// Resolve the Backend directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://snitch-azure.vercel.app",
    config.CLIENT_URL,
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (
                !origin ||
                allowedOrigins.includes(origin) ||
                allowedOrigins.some((allowedOrigin) =>
                    origin.startsWith(allowedOrigin)
                ) ||
                origin.endsWith(".vercel.app")
            ) {
                return callback(null, true);
            }

            // Preserve the existing project's CORS behavior.
            return callback(null, true);
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        credentials: true,
    })
);

// Passport initialization
app.use(passport.initialize());

// Google OAuth strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/auth/google/callback",
        },
        (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }
    )
);

// API routes — keep these before the frontend fallback
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);

// Serve the built React + Vite frontend from Backend/public
const frontendPath = path.join(__dirname, "../public");

app.use(express.static(frontendPath));

// React Router fallback for Express 5
app.get("/{*path}", (req, res, next) => {
    // Do not serve index.html for unknown API endpoints
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({
            success: false,
            message: "API endpoint not found",
        });
    }

    res.sendFile(path.join(frontendPath, "index.html"), (err) => {
        if (err) {
            next(err);
        }
    });
});

export default app;
