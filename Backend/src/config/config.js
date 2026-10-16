import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load from Backend/.env relative to this file first, then fall back to cwd
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined on environment variables");
}
if(!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables" )
}

if(!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables" )
}
if(!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_SECRET is not defined in environment variables" )
}
if(!process.env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is not defined in environment variables" )
}
if(!process.env.RAZORPAY_KEY_ID) {
    throw new Error("RAZORPAY_KEY_ID is not defined in environment variables" )
}
if(!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("RAZORPAY_KEY_SECRET is not defined in environment variables" )
}
export const config = {
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    IMAGEKIT_PRIVATE_KEY:process.env.IMAGEKIT_PRIVATE_KEY,
    RAZORPAY_KEY_ID:process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET:process.env.RAZORPAY_KEY_SECRET,
    CLIENT_URL: process.env.CLIENT_URL || process.env.FRONTEND_URL || (process.env.NODE_ENV === "production" ? "https://snitch-azure.vercel.app" : "http://localhost:5173"),
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || (process.env.NODE_ENV === "production" ? "https://snitch-backend-19po.onrender.com/api/auth/google/callback" : "http://localhost:3000/api/auth/google/callback"),
};