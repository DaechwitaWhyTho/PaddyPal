import jwt from "jsonwebtoken";

// Single user type for OnnoProhori — no role to branch on, just the user_id
export const generateToken = (userId) => {
  const payload = { user_id: userId };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  return token;
};