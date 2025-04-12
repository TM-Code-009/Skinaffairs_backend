import express from "express";
import { registerUser, loginUser, verifyEmail, forgotPassword, resetPassword} from "../controllers/authController";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);

export default router;
