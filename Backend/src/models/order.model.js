import mongoose from "mongoose";
import priceSchema from "./price.Schema.js";

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true,
        },
        variant: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        selectedVariant: {
            type: Object,
        },
        title: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        price: {
            type: priceSchema,
            required: true,
        },
        subtotal: {
            type: Number,
            required: true,
        },
    },
    { _id: true }
);

const shippingAddressSchema = new mongoose.Schema(
    {
        fullname: { type: String, required: true },
        contact: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        items: [orderItemSchema],
        totalAmount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: "INR",
        },
        shippingAddress: {
            type: shippingAddressSchema,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "cancelled"],
            default: "pending",
        },
        orderStatus: {
            type: String,
            enum: ["created", "processing", "shipped", "delivered", "cancelled"],
            default: "created",
        },
        razorpayOrderId: {
            type: String,
            required: true,
            index: true,
        },
        razorpayPaymentId: {
            type: String,
            sparse: true,
        },
        razorpaySignature: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const orderModel = mongoose.model("order", orderSchema);

export default orderModel;
