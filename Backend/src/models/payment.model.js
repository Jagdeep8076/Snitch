import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        razorpay: {
            orderId: { type: String, required: true },
            paymentId: { type: String },
            signature: { type: String },
        },
        price: {
            amount: { type: Number, required: true },
            currency: { type: String, default: "INR" },
        },
        status: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
        orderItems: [
            {
                title: String,
                productId: mongoose.Schema.Types.ObjectId,
                variantId: mongoose.Schema.Types.ObjectId,
                quantity: Number,
                images: [Object],
                description: String,
                price: {
                    amount: Number,
                    currency: String,
                },
            },
        ],
    },
    { timestamps: true }
);

const paymentModel = mongoose.model("payment", paymentSchema);
export default paymentModel;
