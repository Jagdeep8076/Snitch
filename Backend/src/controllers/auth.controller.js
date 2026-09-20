import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

async function sendTokenResponse(user, res, message) {
    const token = jwt.sign(
        {
            id: user._id
        },
        config.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
        message,
        success: true,
        id: user._id,
        email: user.email,
        contact: user.contact,
        fullname: user.fullname,
        role: user.role
    });
}

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
        isSeller
    } = req.body;

    try {
        const existingUser = await userModel.findOne({
            $or: [
                { email },
                { contact }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email or contact already exists"
            });
        }

      const user = await userModel.create({
    email,
    contact,
    password,
    fullname,
    address,
    city,
    state,
    pincode,
    role: isSeller ? "seller" : "buyer"
});

console.log("REGISTER SUCCESS");
console.log("User ID:", user._id);
console.log("Email:", user.email);

return res.status(201).json({
    success: true,
    message: "Registration successful",
    user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        role: user.role
    }
});

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        console.log("LOGIN SUCCESS:", user.email);

        return sendTokenResponse(
            user,
            res,
            "User logged in successfully"
        );

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const googleCallback = async (req, res) =>{
    console.log(req.user)

    res.redirect("http://localhost:5173/dashboard")
}

