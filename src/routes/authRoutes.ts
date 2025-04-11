import express from "express";
import { registerUser, loginUser, verifyEmail, forgotPassword} from "../controllers/authController";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.get("/verify-email/:token", verifyEmail);

export default router;
