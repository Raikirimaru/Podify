import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Load environment variables from.env.local file
dotenv.config({
    path: ".env.local",
});

export const transporter = nodemailer.createTransport({
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    port: 587,
    secure: false,
    host: "smtp.gmail.com",
});

export const sendAccountRegisteredEmail = async (to) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Account Registration Confirmation',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Account Registration Confirmation</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f9;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                    }
                    .container {
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        text-align: center;
                        width: 100%;
                        max-width: 400px;
                    }
                    .logo {
                        width: 100px;
                        margin-bottom: 20px;
                    }
                    h1 {
                        font-size: 24px;
                        margin-bottom: 20px;
                        color: #333;
                    }
                    p {
                        font-size: 16px;
                        color: #555;
                        margin-bottom: 20px;
                    }
                    .button {
                        background-color: #1a64db;
                        color: #ffffff;
                        text-color: #ffffff
                        padding: 10px 20px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 16px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <img src=${'../resource/image/logo.svg'} alt="Company Logo" class="logo">
                    <h1>Account Registered</h1>
                    <p>Thank you for registering! Your account has been successfully created.</p>
                    <p>Please check your email for further instructions to confirm your email address.</p>
                    <a href="https://podify-togocom.vercel.app" class="button">Go to Login</a>
                </div>
            </body>
            </html>
        `,
    };

    transporter.sendMail(mailOptions, (error, info, res) => {
        if (error) {
            return console.log(error);
        }
        res.status(401).send({ message: `${info.response}` })
        console.log('Email sent: ' + info.response);
    });
};
