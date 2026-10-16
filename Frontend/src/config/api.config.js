/**
 * Frontend API Configuration
 * 
 * - In local development: Vite proxy ('/api') forwards to backend.
 * - In production: Vercel rewrite in vercel.json ('/api/:path*') proxies to Render backend.
 * - If VITE_API_URL is provided, it can override the base URL.
 */
const rawBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/+$/, "")
    : "";

export const API_BASE_URL = rawBase ? `${rawBase}/api` : "/api";

export default {
    API_BASE_URL,
};
