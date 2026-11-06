import jwt from "jsonwebtoken";
import User from "../models/users.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "No token provided, authorization denied",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    return next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};

export const adminOnly = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "No token provided, authorization denied",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (user.role !== "admin" && user.role !== "staff") {
      return res.status(403).json({
        error: "Access denied. Admin or staff only.",
      });
    }

    req.userId = decoded.userId;
    req.user = user;
    req.userRole = user.role;
    return next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};

export const adminRole = async (req, res, next) => {
  return adminOnly(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Access denied. Admin only.",
      });
    }

    return next();
  });
};

export const optional = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      req.userRole = decoded.role;
    }

    return next();
  } catch (err) {
    return next();
  }
};
