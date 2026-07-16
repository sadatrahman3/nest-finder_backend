import { Router } from "express";
import {
  getAllUsers,
  deleteUser,
  deleteReview,
  toggleFeatured,
  toggleAvailable,
  getAllItemsAdmin,
} from "../controllers/adminController";
import { protect, adminOnly } from "../middleware/auth";

const router = Router();

router.use(protect);
router.use(adminOnly);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/items", getAllItemsAdmin);
router.delete("/items/:id/reviews/:reviewId", deleteReview);
router.patch("/items/:id/featured", toggleFeatured);
router.patch("/items/:id/available", toggleAvailable);

export default router;
