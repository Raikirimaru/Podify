import jwt from "jsonwebtoken";
import { createError } from "../errors/error.js";
import dotenv from 'dotenv'

dotenv.config({
    path: '.env.local'
})

export const verifyToken = async (req, res, next) => {
    try {
        if (!req.headers.authorization) return next(createError(401, "You are not authenticated!"));
        // Get the token from the header
        const token = req.headers.authorization.split(" ")[1];
        // Check if token exists
        if (!token) return next(createError(401, "You are not authenticated!"));

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        next();
    } catch (error) {
        console.log(error)
        res.status(402).json({ error: error.message })
    }
}

export const authenticate = async (req, res, next) => {
    try {
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
            return next(createError(401, "You are not authenticated!"));
        }

        const token = req.headers.authorization.split(" ")[1];
        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: "Token expired. Please log in again." });
            } else {
                return res.status(401).json({ error: "Invalid token." });
            }
        }

        req.user = decoded;
        if (!req.user) {
            return next(createError(401, "User not found!"));
        }

        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An internal server error occurred." });
    }
};
