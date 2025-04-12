import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/email";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Incoming Request Body:", req.body);

    let { firstname, lastname, birthday, phonenumber, gender, email, password, isAdmin } = req.body;

    // Trim and format input fields
    firstname = firstname.trim();
    lastname = lastname.trim();
    email = email.trim().toLowerCase();
    phonenumber = phonenumber.toString().trim();

    // Validate inputs
    if (!firstname || !lastname || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    let user;
    try {
      user = await User.create({
        firstname,
        lastname,
        birthday: birthday ? new Date(birthday) : null, // Convert to Date if provided
        phonenumber,
        gender,
        email,
        password: hashedPassword,
        isAdmin: isAdmin || false,
        isVerified: false
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user" });
      return;
    }

    // Generate email verification token
    const token = jwt.sign({ email }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
    const verificationLink = `https://your-site.com/verify/${token}`;

    // Send verification email to the user
    const userSubject = "🌟 Verify Your Email - Skin Affairs";
    const userText = `Hello ${lastname} ${firstname},\n\nWelcome to Skin Affairs! 🎉\n\nPlease verify your email: ${verificationLink}`;
    const userHtml = `
      <html>
      <body>
        <h2>Welcome to Skin Affairs! 🎉</h2>
        <p>Hello <strong>${lastname} ${firstname}</strong>,</p>
        <p>Click the button below to verify your email:</p>
        <a href="${verificationLink}" style="background:#007BFF;color:#fff;padding:10px 20px;text-decoration:none;">Verify Your Email</a>
        <p>If the button doesn’t work, click this link: <a href="${verificationLink}">${verificationLink}</a></p>
      </body>
      </html>`;

    try {
      await sendEmail(email, userSubject, userText, userHtml);
    } catch (error) {
      console.error("Error sending user email:", error);
    }

    // Send notification email to the admin
    const adminSubject = `👤 New User Registered: ${lastname} ${firstname}`;
    const adminText = `A new user has registered:\n📌 Name: ${lastname} ${firstname}\n📧 Email: ${email}`;
    const adminHtml = `
      <html>
      <body>
        <h2>👤 New User Registration</h2>
        <p><strong>Name:</strong> ${lastname} ${firstname}</p>
        <p><strong>Email:</strong> ${email}</p>
      </body>
      </html>`;

    try {
      await sendEmail(ADMIN_EMAIL, adminSubject, adminText, adminHtml);
    } catch (error) {
      console.error("Error sending admin email:", error);
    }

    res.status(201).json({ message: "User registered. Check email for verification link." });

  } catch (error) {
    console.error("Registration Error:", error);
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


export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user: any = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Generate token valid for 1 hour
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const storeLink = `${process.env.FRONTEND_URL}`;

    const subject = "Reset Your SkinAffairs Password";
    const text = `Reset your password: ${resetLink}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 40px;">
        <h2 style="color: black;">Skinaffairs</h2>
        <p>To: ${user.lastname || "Name" } ${user.firstname || "Name"} </p>
        <p>Reply To: <a href="mailto:support@skinaffairs.com">support@skinaffairs.com</a></p>

        <h1 style="font-size: 28px;">Reset your password</h1>

        <p style="font-size: 16px; line-height: 1.5;">
          Follow this link to reset your customer account password at Skin Affairs.
          If you didn't request a new password, you can safely delete this email.
        </p>

        <div style="margin: 30px 0; display: flex; gap: 20px;">
          <a href="${resetLink}" style="background-color: black; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px;">Reset Password</a>
          <a href="${storeLink}" style="background-color: black; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px;">Visit Our Store</a>
        </div>

        <p style="font-size: 14px; margin-top: 40px;">
          If you have any questions, reply to this email or contact us at
          <a href="mailto:support@skinaffairs.com">support@skinaffairs.com</a>
        </p>
      </div>
    `;

    await sendEmail(user.email, subject, text, html);

    res.status(200).json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params; // token sent in URL param
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ message: "Password is required" });
      return;
    }

    // Decode and verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user:any = await User.findById(decoded.id);

    if (!user || user.resetPasswordToken !== token || user.resetPasswordExpires < new Date()) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
