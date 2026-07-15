import { Router } from "express";
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  addReview,
  getMyItems,
} from "../controllers/itemController";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", getItems);
router.get("/my-items", protect, getMyItems);
router.get("/:id", getItemById);
router.post("/", protect, createItem);
router.put("/:id", protect, updateItem);
router.delete("/:id", protect, deleteItem);
router.post("/:id/reviews", protect, addReview);

export default router;
