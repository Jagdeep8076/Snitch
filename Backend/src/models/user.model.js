import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        contact: {
            type: String,
            required: false,
            trim: true,
        },

        password: {
            type: String,
            required: function () {
                return !this.googleId;
            },
        },

        fullname: {
            type: String,
            required: true,
            trim: true,
        },

        role: {
            type: String,
            enum: ["buyer", "seller"],
            default: "buyer",
        },

        googleId: {
            type: String,
        },

        emailVerified: {
            type: Boolean,
            default: false,
        },

        verificationTokenHash: {
            type: String,
        },

        verificationTokenExpiresAt: {
            type: Date,
        },

        resetPasswordTokenHash: {
            type: String,
        },

        resetPasswordExpiresAt: {
            type: Date,
        },

        address: {
            type: String,
            required: false,
            trim: true,
        },

        city: {
            type: String,
            required: false,
            trim: true,
        },

        state: {
            type: String,
            required: false,
            trim: true,
        },

        pincode: {
            type: String,
            required: false,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) return;

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
});

userSchema.methods.comparePassword = async function (password) {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);

export default userModel;