import User from "../models/User.js";
import jwt from "jsonwebtoken";
import otpgenerator from "otp-generator";
import dotenv from "dotenv";
import { createError } from "../errors/error.js";
import bcrypt from "bcrypt";
import { transporter, sendAccountRegisteredEmail } from "../utils/sendMail.js"


dotenv.config({
    path: ".env.local",
});


export const signup = async (req, res, next) => {
    const { email, password, name } = req.body;

    if (!email) {
        return res.status(422).send({ message: 'Missing email.' });
    }

    if (!name) {
        return res.status(422).send({ message: 'Missing name.' });
    }

    if (!password) {
        return res.status(422).send({ message: 'Missing password.' });
    }

    try {
        const existingUser = await User.findOne({ email }).exec();

        if (existingUser) {
            return res.status(409).send({ message: 'User already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const newUser = new User({ email, password: hash, name: name });

        await newUser.save().then(function() {
            sendAccountRegisteredEmail(email)
            res.status(200 || 201).send({ message: 'User registered successfully. Please check your email to confirm your account.' });  
        }).catch(function(err) {
            next(err);
        })
    } catch (err) {
        next(err);
    }
};

export const signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return next(createError(400, "Email and password are required"));
        }

        const user = await User.findOne({ email });
        if (!user) {
            return next(createError(401, "User not found"));
        }

        if (user.googleSignIn) {
            return next(createError(403, "Entered email is signed up with a Google account. Please sign in with Google."));
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(createError(401, "Invalid Password"));
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });

        res.status(200 || 201).json({ token, user, message: "User logged in successfully." });
    } catch (error) {
        next(error);
    }
}


export const logout = (req, res) => {
    res.clearCookie("access_token").json({ message: "Logged out" });
}

export const googleAuthSignIn = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            try {
                const user = new User({ ...req.body, googleSignIn: true });
                await user.save();
                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                    expiresIn: "24h",
                });
                res.status(201).send({ token, user: user });
            } catch (err) {
                next(err)
            }    
        } else if (user.googleSignIn) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: "24h",
            });
            res.status(200).send({ token, user });
        } else if (user.googleSignIn === false) {
            return next(createError(403, "User already exists with normal signup. Please SignIn with normal signup."));
        }
    } catch (error) {
        next(error);
    }
}

export const generateOTP = async (req, res, next) => {
    req.app.locals.OTP = otpgenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
        digits: true,
    });

    const { email } = req.query;
    const { name } = req.query;
    const { reason } = req.query;

    const verifyOtp = {
        to: email,
        subject: 'Account Verification OTP',
        html: `
            <div style="font-family: Poppins, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
                <h1 style="font-size: 22px; font-weight: 500; color: #854CE6; text-align: center; margin-bottom: 30px;">Verify Your Podify Account</h1>
                <div style="background-color: #FFF; border: 1px solid #e5e5e5; border-radius: 5px; box-shadow: 0px 3px 6px rgba(0,0,0,0.05);">
                    <div style="background-color: #854CE6; border-top-left-radius: 5px; border-top-right-radius: 5px; padding: 20px 0;">
                        <h2 style="font-size: 28px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 10px;">Verification Code</h2>
                        <h1 style="font-size: 32px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 20px;">${req.app.locals.OTP}</h1>
                    </div>
                    <div style="padding: 30px;">
                        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Dear ${name},</p>
                        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Thank you for creating a Podify account. To activate your account, please enter the following verification code:</p>
                        <p style="font-size: 20px; font-weight: 500; color: #666; text-align: center; margin-bottom: 30px; color: #854CE6;">${req.app.locals.OTP}</p>
                        <p style="font-size: 12px; color: #666; margin-bottom: 20px;">Please enter this code in the Podify app to activate your account.</p>
                        <p style="font-size: 12px; color: #666; margin-bottom: 20px;">If you did not create a Podify account, please disregard this email.</p>
                    </div>
                </div>
                <br>
                <p style="font-size: 16px; color: #666; margin-bottom: 20px; text-align: center;">Best regards,<br>The Podify Team</p>
            </div>
        `
    };

    const resetPasswordOtp = {
        to: email,
        subject: 'Podify Reset Password Verification',
        html: `
            <div style="font-family: Poppins, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
                <h1 style="font-size: 22px; font-weight: 500; color: #854CE6; text-align: center; margin-bottom: 30px;">Reset Your Podify Account Password</h1>
                <div style="background-color: #FFF; border: 1px solid #e5e5e5; border-radius: 5px; box-shadow: 0px 3px 6px rgba(0,0,0,0.05);">
                    <div style="background-color: #854CE6; border-top-left-radius: 5px; border-top-right-radius: 5px; padding: 20px 0;">
                        <h2 style="font-size: 28px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 10px;">Verification Code</h2>
                        <h1 style="font-size: 32px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 20px;">${req.app.locals.OTP}</h1>
                    </div>
                    <div style="padding: 30px;">
                        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Dear ${name},</p>
                        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">To reset your Podify account password, please enter the following verification code:</p>
                        <p style="font-size: 20px; font-weight: 500; color: #666; text-align: center; margin-bottom: 30px; color: #854CE6;">${req.app.locals.OTP}</p>
                        <p style="font-size: 12px; color: #666; margin-bottom: 20px;">Please enter this code in the Podify app to reset your password.</p>
                        <p style="font-size: 12px; color: #666; margin-bottom: 20px;">If you did not request a password reset, please disregard this email.</p>
                    </div>
                </div>
                <br>
                <p style="font-size: 16px; color: #666; margin-bottom: 20px; text-align: center;">Best regards,<br>The Podify Team</p>
            </div>
        `
    };

    const mailOptions = reason === "FORGOTPASSWORD" ? resetPasswordOtp : verifyOtp;

    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            next(err);
        } else {
            res.status(200).send({ message: "OTP sent" });
        }
    });
}

export const verifyOtp = (req, res, next) => {
    const { code } = req.query;

    if (parseInt(code) === parseInt(req.app.locals.OTP)) {
        req.app.locals.OTP = null;
        req.app.locals.resetSession = true;
        res.status(200).send({ message: "OTP Verified" });
    } else {
        next(createError(401, "Wrong OTP Verification"));
    }
}


export const createResetSession = async (req, res, next) => {
    if (req.app.locals.resetSession) {
        req.app.locals.resetSession = false
        res.status(200).send({ message: "Reset Session Created" })
    }

    return res.status(400).send({ message: "Session expired"  })
}

export const findUserByEmail = async (req, res, next) => {
    const { email } = req.query;
    try {
        const user = await User.findOne({ email: email });
        if (user) {
            return res.status(200).send({
                message: "User found"
            });
        } else {
            return res.status(202).send({
                message: "User not found"
            });
        }
    } catch (err) {
        next(err);
    }
}


export const changePassword = async (req, res, next) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(newPassword, salt);

        await User.updateOne({ email }, { $set: { password: hashedPassword } });

        return res.status(200).send({ message: "Password changed successfully" });

    } catch (err) {
        next(err);
    }
}

export const resetPassword = async (req, res, next) => {

    if (!req.app.locals.resetSession) return res.status(400).send({ message: "Session expired" });

    const { email, password } = req.body;
    try {
        await User.findOne({ email }).then(async (user) => {
            if (user) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                User.updateOne({ email: email }, { $set: { password: hashedPassword } }).then(() => {
                    req.app.locals.resetSession = false;
                    return res.status(200).send({
                        message: "Password reset successfully"
                    });
                }).catch(err => {
                    next(err);
                });
            } else {
                return res.status(202).send({
                    message: "User not found"
                });
            }
        });
    } catch (err) {
        next(err);
    }
}