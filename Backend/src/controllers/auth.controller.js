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

        return sendTokenResponse(
            user,
            res,
            "User registered successfully"
        );

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const login = async (req, res) =>{
    const { email, password } =req.body;

    const user  = await userModel.findOne({ email });

    if(!user){
        return res.status(400).json({
            message: "Invalid Email Or  Password"
        })
    }
const isMatch = await user.coamparePassword(password)

if( !isMatch){
    return res.status(400).json({
        message: " Invalid Email or Password"
    })
}
await sendTokenResponse(user, res, "User LoggedIn Successfully" )
}

