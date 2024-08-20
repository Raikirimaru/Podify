import express from 'express';
import { localVariables } from '../middlewares/AuthMiddleware.js'
import { authenticate } from '../middlewares/VerifyToken.js'
import { signin, signup, logout, changePassword, googleAuthSignIn, findUserByEmail, verifyOtp, createResetSession, resetPassword, generateOTP } from '../controllers/auth.js'

const router = express.Router()

//create a user
router.post("/signup", signup);
//signin
router.post("/signin", signin);
//logout
router.post("/logout", logout);
//google signin
router.post("/google", googleAuthSignIn);
//find user by email
router.get("/findbyemail", findUserByEmail);
//generate opt
router.get("/generateotp", localVariables, generateOTP);
//verify opt
router.get("/verifyotp", verifyOtp);
//create reset session
router.get("/createResetSession", createResetSession);
//forget password
router.patch("/forgetpassword", resetPassword);

// edit password
router.patch("/changePassword", authenticate, changePassword);




export default router;