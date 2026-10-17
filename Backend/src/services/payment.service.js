import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "../config/config.js";

let razorpayClient = null;

export const getRazorpayClient = () => {
    if (!razorpayClient) {
        const RazorpayClass = typeof Razorpay === "function" ? Razorpay : Razorpay?.default;
        if (!RazorpayClass) {
            throw new Error("Razorpay SDK constructor could not be initialized");
        }
        if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
            throw new Error("Razorpay credentials are not defined in environment variables");
        }
        razorpayClient = new RazorpayClass({
            key_id: config.RAZORPAY_KEY_ID,
            key_secret: config.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayClient;
};

export const createOrder = async ({ amount, currency = "INR", receipt, notes = {} }) => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new Error("A valid order amount greater than zero is required.");
    }

    const client = getRazorpayClient();
    const options = {
        amount: Math.round(numericAmount * 100), // convert to paise
        currency: (currency || "INR").trim(),
        receipt: receipt || `rcpt_${Date.now()}`,
        notes,
    };

    const order = await client.orders.create(options);
    return order;
};

export const verifyPaymentSignature = ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
}) => {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return false;
    }

    const secret = config.RAZORPAY_KEY_SECRET;
    if (!secret) {
        throw new Error("RAZORPAY_KEY_SECRET is not configured");
    }

    const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    const generatedBuffer = Buffer.from(generatedSignature, "utf-8");
    const signatureBuffer = Buffer.from(String(razorpay_signature), "utf-8");

    if (generatedBuffer.length !== signatureBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(generatedBuffer, signatureBuffer);
};