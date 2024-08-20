import { getUser, ProfileUpdate, getUserById, deleteUser } from "../controllers/user.js";
import { authenticate } from "../middlewares/VerifyToken.js";
import { uploadFile } from "../middlewares/UploadImage.js";
import express from "express";

const router = express.Router();


router.patch('/update/:id', uploadFile, authenticate, ProfileUpdate);
router.get("/get", authenticate, getUser);
router.get('/get/:id', authenticate, getUserById); // For getting any user by ID
router.delete('/delete/:id', authenticate, deleteUser);


export default router;