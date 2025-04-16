import express from "express";
import { registerUser, loginUser, verifyEmail, forgotPassword, resetPassword, addToWishlist, removeFromWishlist, addAddress, updateAddress, deleteAddress} from "../controllers/authController";
import {protect} from "../middleware/authMiddleware"
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/wishlist", protect, addToWishlist);
router.delete('/wishlist', protect, removeFromWishlist);
router.post("/address", protect, addAddress);
router.put("/address/:index", protect, updateAddress);
router.delete("/address/:index", protect, deleteAddress);


export default router;
