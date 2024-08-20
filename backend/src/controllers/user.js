import mongoose from "mongoose";
import User from "../models/User.js";
import Podcast from '../models/Podcast.js';
import Episodes from '../models/Episode.js';
import { createError } from "../errors/error.js";
import bcrypt from 'bcrypt'

export const update = async (req, res, next) => {
    const { password, ...rest } = req.body;

    if (req.params.id === req.user.id) {
        try {
            if (password) {
                const salt = bcrypt.genSaltSync(10);
                const hashedPassword = bcrypt.hashSync(password, salt);
                rest.password = hashedPassword;
            }

            const updatedUser = await User.findByIdAndUpdate(
                req.params.id,
                { $set: rest },
                { new: true }
            );

            if (!updatedUser) {
                return next(createError(404, 'User not found'));
            }

            res.status(200).json(updatedUser);
        } catch (err) {
            next(err);
        }
    } else {
        return next(createError(403, 'You can update only your account!'));
    }
};

export async function ProfileUpdate (req, res) {
    const { id } = req.params;
    const { name, email } = req.body;
    let img = null

    if (req.file) {
        const mimeType = req.file.mimetype
        const base64String = req.file.buffer.toString('base64')
        img = `data:${mimeType};base64,${base64String}`
    }

    try {
        await User.findByIdAndUpdate(
            id,
            { name, email, img },
            { new: true }
        );
        res.status(200 || 201).send({ message: "User Profile updated successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: "podcasts",
            populate: {
                path: "creator",
                select: "name img",
            }
        }).populate(
            {
                path: "favorits",
                populate: {
                    path: "creator",
                    select: "name img",
                }
            }
        )
        res.status(200).json(user)
    } catch (err) {
        console.log(req.user)
        next(err);
    }
}

export const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).populate({
            path: "podcasts",
            populate: {
                path: "creator",
                select: "name img",
            }
        }).populate({
            path: "favorites",
            populate: {
                path: "creator",
                select: "name img",
            }
        });
        if (!user) {
            return next(createError(404, "User not found!"));
        }
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    const userId = req.params.id;

    if (userId === req.user.id) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const podcasts = await Podcast.find({ creator: userId });
            // if (podcasts.length === 0) {
            //     return res.status(404).json({ message: "No podcasts found for this user" });
            // }

            for (const podcast of podcasts) {
                await Episodes.deleteMany({ _id: { $in: podcast.episodes } });
            }

            await Podcast.deleteMany({ creator: userId });

            await User.findByIdAndDelete(userId);

            res.status(200).json({ message: "User and associated podcasts and episodes deleted successfully" });
        } catch (err) {
            next(err);
        }
    } else {
        return next(createError(403, "You can delete only your account!"));
    }
};