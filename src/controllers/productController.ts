import { Request, Response } from "express";
import Product from "../models/Products";
import sendEmail from "../utils/email";

const ADMIN_EMAIL = "osakweterrynduka@gmail.com"; // Replace with the actual admin email

export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, image, category, stock } = req.body;

    const product = new Product({ name, description, price, image, category, stock });
    const createdProduct = await product.save();

    // Send email to admin when a new product is added
    const subject = "🛍️ New Product Added!";
    const text = `
A new product has been added to the store.

Product Name: ${createdProduct.name}
Price: $${createdProduct.price}
Stock: ${createdProduct.stock}

Check the admin panel for details.
`;
    const html = `
    <h2>🛍️ New Product Added!</h2>
    <p><strong>Product Name:</strong> ${createdProduct.name}</p>
    <p><strong>Price:</strong> $${createdProduct.price}</p>
    <p><strong>Stock:</strong> ${createdProduct.stock}</p>
    <p>Check the admin panel for details.</p>
    `;

    await sendEmail(ADMIN_EMAIL, subject, text, html);

    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: "Error creating product" });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.stock -= quantity;
    await product.save();

    // Notify admin if stock runs out
    if (product.stock === 0) {
      const subject = "🚨 Stock Alert: Product Out of Stock!";

const text = `
Hello Admin,

⚠️ The stock for the following product has run out:

📦 Product Name: ${product.name}  
💲 Price: $${product.price}  

Please restock immediately to prevent order delays.

Best regards,  
The Skin Affairs System
`;

const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      text-align: center;
      padding: 20px;
    }
    .email-container {
      max-width: 500px;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
      margin: auto;
      text-align: left;
    }
    h2 {
      color: #d9534f;
      text-align: center;
    }
    p {
      color: #555;
      font-size: 16px;
    }
    .highlight {
      background: #f8d7da;
      padding: 10px;
      border-radius: 5px;
      font-size: 16px;
      font-weight: bold;
    }
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #888;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <h2>🚨 Stock Alert: Out of Stock</h2>
    <p class="highlight">⚠️ The following product is now out of stock:</p>
    <p><strong>📦 Product Name:</strong> ${product.name}</p>
    <p><strong>💲 Price:</strong> $${product.price}</p>
    <p>Please restock immediately to prevent order delays.</p>
    <p class="footer">This is an automated notification from Skin Affairs.</p>
  </div>
</body>
</html>
`;

      await sendEmail(ADMIN_EMAIL, subject, text, html);
    }

    res.status(200).json({ message: "Stock updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Error updating stock" });
  }
};
