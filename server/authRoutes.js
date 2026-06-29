import sql from "./db.js";
import express from "express";
import { register, login, forgotPassword, resetPassword } from "./authController.js";
import authMiddleware from "./authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await sql`
      SELECT user_id, name, email, phone, created_at
      FROM users
      WHERE user_id = ${req.user.user_id}
    `;

    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: user[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;