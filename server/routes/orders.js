import express from "express";

import {
  createOrder,
  getOrders,
  getUserOrders,
  getOrder,
  confirmOrder,
  updateOrderStatus,
  deleteOrder,
  assignOrder,
  getStaffOrders,
  updateOrderQuantity,
  addOrderTimeline,
} from "../controllers/orders.js";
import { protect, adminOnly, adminRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", adminOnly, getOrders);
router.get("/my-orders", protect, getUserOrders);
router.get("/staff/my-orders", adminOnly, getStaffOrders);
router.get("/:id", adminOnly, getOrder);
router.post("/:id/assign", adminOnly, assignOrder);
router.post("/:id/confirm", adminOnly, confirmOrder);
router.put("/:id/status", adminOnly, updateOrderStatus);
router.put("/:id/quantity", adminOnly, updateOrderQuantity);
router.post("/:id/timeline", adminOnly, addOrderTimeline);
router.delete("/:id", adminRole, deleteOrder);

export default router;
