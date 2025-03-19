import express from "express";
import { getProducts, getProductById, createProduct } from "../controllers/productController";
const router = express.Router();

router.get("/getProduct", getProducts);
router.get("/:id", getProductById);
router.post("/createProduct", createProduct);

export default router;