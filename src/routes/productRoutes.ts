import express, { Request, Response,RequestHandler } from "express";
import { getProducts, getProductById, createProduct, reviewProduct } from "../controllers/productController";
const router = express.Router();

const reviewProductHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    await reviewProduct(req, res); // Calls the existing reviewProduct function
  };
  

router.get("/getProduct", getProducts);
router.get("/:id", getProductById);
router.post("/createProduct", createProduct);
router.post("/:id/review", reviewProductHandler);

export default router;



