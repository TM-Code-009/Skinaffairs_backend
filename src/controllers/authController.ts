import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/email";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, isAdmin } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin,
      isVerified: false, // Default to not verified
    });

    const token = jwt.sign({ email }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
    const verificationLink = `https://your-site.com/verify/${token}`;

    // Send verification email to the user
    const userSubject = "🌟 Verify Your Email - Skin Affairs";

const userText = `Hello ${name},

Welcome to Skin Affairs! 🎉

We're excited to have you with us. Please verify your email address by clicking the link below:
👉 ${verificationLink}

If you didn’t request this, please ignore this email.

Best regards,  
The Skin Affairs Team`;

const userHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      text-align: center;
      padding: 20px;
    }
    .email-container {
      max-width: 500px;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
      margin: auto;
    }
    h2 {
      color: #333;
    }
    p {
      color: #555;
      font-size: 16px;
    }
    .btn {
      display: inline-block;
      background-color: #007BFF;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 5px;
      text-decoration: none;
      font-size: 18px;
      margin-top: 15px;
      font-weight: bold;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <h2>Welcome to Skin Affairs! 🎉</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>We're excited to have you on board! Please verify your email address to activate your account.</p>
    <a class="btn" href="${verificationLink}" target="_blank">Verify Your Email</a>
    <p>If the button doesn’t work, click this link:</p>
    <p><a href="${verificationLink}" style="word-break: break-all;">${verificationLink}</a></p>
    <p class="footer">If you didn't sign up, you can safely ignore this email.</p>
    <p class="footer">© 2025 Skin Affairs. All rights reserved.</p>
  </div>
</body>
</html>
`;

    
    await sendEmail(email, userSubject, userText, userHtml);

    // Send notification email to the admin
    const adminSubject = `👤 New User Registered: ${name}`;

const adminText = `
Hello Admin,

A new user has signed up on Skin Affairs:

📌 Name: ${name}  
📧 Email: ${email}

Best regards,  
The Skin Affairs System
`;

const adminHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      text-align: center;
      padding: 20px;
    }
    .email-container {
      max-width: 500px;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
      margin: auto;
      text-align: left;
    }
    h2 {
      color: #333;
      text-align: center;
    }
    p {
      color: #555;
      font-size: 16px;
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    li {
      background: #f8f8f8;
      margin: 5px 0;
      padding: 10px;
      border-radius: 5px;
      font-size: 16px;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #888;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <h2>👤 New User Registration</h2>
    <p>A new user has signed up on Skin Affairs:</p>
    <ul>
      <li><strong>Name:</strong> ${name}</li>
      <li><strong>Email:</strong> ${email}</li>
    </ul>
    <p class="footer">This is an automated notification from Skin Affairs.</p>
  </div>
</body>
</html>
`;


    await sendEmail(ADMIN_EMAIL, adminSubject, adminText, adminHtml);

    res.status(201).json({ message: "User registered. Check email for verification link." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password || ""))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ message: "Email not verified. Check inbox." });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;

    if (!decoded.email) {
      res.status(400).json({ message: "Invalid token" });
      return;
    }

    await User.updateOne({ email: decoded.email }, { isVerified: true });

    res.json({ message: "Email verified. You can log in now." });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token." });
  }
};
