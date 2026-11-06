import express from "express";

import {
  addProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/products.js";
import { adminRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", adminRole, addProduct);
router.put("/:id", adminRole, updateProduct);
router.delete("/:id", adminRole, deleteProduct);

export default router;
