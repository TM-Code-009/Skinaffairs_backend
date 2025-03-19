import express from "express";
import { RequestHandler } from "express";
import { 
  getOrderById, 
  createOrder, 
  updateOrderStatus, 
  deleteOrder 
} from "../controllers/orderController";

const router = express.Router();

// Explicitly cast handlers as `RequestHandler`
router.get("/:id", getOrderById as RequestHandler);
router.post("/", createOrder as RequestHandler);
router.put("/:id", updateOrderStatus as RequestHandler);
router.delete("/:id", deleteOrder as RequestHandler);

export default router;
