import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import userModel from "../models/user.model.js";

export const authenticateUser = async (req, res, next) => {
    const token =
        req.cookies?.token ||
        (req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : null);

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);

        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
};

export const authenticateSeller = async (req, res, next) => {
    const token =
        req.cookies?.token ||
        (req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : null);

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);

        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (user.role !== "seller") {
            return res.status(403).json({ success: false, message: "Forbidden: Seller role required" });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
};