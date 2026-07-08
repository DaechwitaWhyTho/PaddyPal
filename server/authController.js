import sql from "./db.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { generateToken } from "./generateToken.js";

/**
 * POST /api/auth/register
 * Body: { name, email, password, phone }
 * OnnoProhori has a single user type — every account can scan crops
 * and chat about the results, so there's no role/address/store logic.
 */
export const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and password are required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  try {
    const existingUser = await sql`
      SELECT user_id FROM users WHERE email = ${email}
    `;
    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const newUser = await sql`
      INSERT INTO users (name, email, password_hash, phone)
      VALUES (${name}, ${email}, ${hashedPass}, ${phone || null})
      RETURNING user_id, name, email, phone, created_at
    `;
    const createdUser = newUser[0];

    const token = generateToken(createdUser.user_id);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: createdUser,
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user.user_id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Optional bonus flow carried over from the previous project.
 * Only wire this in if there's time for the Gmail App Password setup.
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;

    // Always return 200 to avoid leaking which emails are registered
    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: "If that email is registered, an OTP has been sent.",
      });
    }

    const user = users[0];
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min window

    await sql`
      UPDATE users
      SET reset_otp = ${otp}, otp_expires_at = ${expiresAt}
      WHERE user_id = ${user.user_id}
    `;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Google App Password, not your account password
      },
    });

    await transporter.sendMail({
      from: `"OnnoProhori" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your OnnoProhori Password Reset OTP",
      text: `Your OTP is: ${otp}\n\nThis code expires in 5 minutes. Do not share it with anyone.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #555;">Use the OTP below to reset your OnnoProhori password. It expires in <strong>5 minutes</strong>.</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 6px; color: #111;">
            ${otp}
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "If that email is registered, an OTP has been sent.",
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * POST /api/auth/reset-password
 * Body: { email, otp, newPassword }
 */
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "email, otp, and newPassword are all required.",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "newPassword must be at least 6 characters.",
    });
  }

  try {
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const user = users[0];

    if (!user.reset_otp || !user.otp_expires_at) {
      return res.status(400).json({
        success: false,
        message: "No OTP was requested for this account. Please request one first.",
      });
    }

    if (user.reset_otp !== String(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      await sql`
        UPDATE users SET reset_otp = NULL, otp_expires_at = NULL
        WHERE user_id = ${user.user_id}
      `;
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await sql`
      UPDATE users
      SET password_hash = ${hashedPassword}, reset_otp = NULL, otp_expires_at = NULL
      WHERE user_id = ${user.user_id}
    `;

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};