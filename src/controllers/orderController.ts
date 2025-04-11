import { Request, Response } from "express";
import Order from "../models/Order";
import Product from "../models/Products";
import sendEmail from "../utils/email"; // Assuming email utility is in utils folder
import User from "../models/User"; // Import User model

// Get all orders
export const getOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find().populate("user", "name email").populate("products.product", "name price");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email").populate("products.product", "name price");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new order



export const createOrder = async (req: Request, res: Response) => {
    try {
        const { user, products, deliveryMethod, address } = req.body;

        // Validate delivery method
        if (!["pickup", "delivery"].includes(deliveryMethod)) {
            return res.status(400).json({ message: "Invalid delivery method. Choose 'pickup' or 'delivery'." });
        }

        // If delivery is chosen, address must be provided
        if (deliveryMethod === "delivery" && !address) {
            return res.status(400).json({ message: "Address is required for delivery." });
        }

        // Fetch user details
        const userData = await User.findById(user);
        if (!userData) return res.status(404).json({ message: "User not found" });

        const userName: any = userData.firstname;
        const userEmail: any = userData.email;

        // Validate products & calculate total price
        let total = 0;
        const detailedProducts = products.map(async (item: any) => {
            const product = await Product.findById(item.product);
            if (!product) throw new Error(`Product not found: ${item.product}`);

            total += product.price * item.quantity;

            return {
                product: product._id,
                productName: product.name,
                quantity: item.quantity,
            };
        });

        const resolvedProducts = await Promise.all(detailedProducts);

        // Create order
        const order = new Order({
            user,
            userName,
            products: resolvedProducts,
            total,
            deliveryMethod,
            address: deliveryMethod === "delivery" ? address : undefined,
        });

        const newOrder = await order.save();

        // 📩 Email to Admin
        const adminEmail = process.env.ADMIN_EMAIL!;
        const adminSubject = "📦 New Order Received";
        const adminText = `A new order has been placed by ${userName}. Total: $${total}`;
        
        const productDetails = resolvedProducts
            .map(
                (item) =>
                    `<tr>
                        <td style="border: 1px solid #ddd; padding: 8px;">${item.productName}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                    </tr>`
            )
            .join("");
        
        const adminHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
                <div style="background-color: #ffffff; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #007BFF; text-align: center;">📦 New Order Received</h2>
                    <p style="font-size: 16px; color: #333;"><strong>User Name:</strong> ${userName}</p>
                    <p style="font-size: 16px; color: #333;"><strong>User ID:</strong> ${user}</p>
                    <p style="font-size: 16px; color: #333;"><strong>User Email:</strong> ${userEmail}</p>
        
                    <h3 style="color: #007BFF;">🛍️ Products Ordered:</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 8px; background-color: #007BFF; color: white;">Product</th>
                            <th style="border: 1px solid #ddd; padding: 8px; background-color: #007BFF; color: white;">Quantity</th>
                        </tr>
                        ${productDetails}
                    </table>
        
                    <p style="font-size: 16px; color: #333;"><strong>Total Price:</strong> <span style="color: #28A745;">$${total}</span></p>
                    <p style="font-size: 16px; color: #333;"><strong>Delivery Method:</strong> ${deliveryMethod === "delivery" ? "🚚 Delivery" : "🏠 Pickup"}</p>
                    ${
                        deliveryMethod === "delivery"
                            ? `<p style="font-size: 16px; color: #333;"><strong>Delivery Address:</strong> ${address}</p>`
                            : ""
                    }
        
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="https://youradminpanel.com/orders" 
                           style="background-color: #007BFF; color: white; text-decoration: none; padding: 12px 20px; border-radius: 5px; font-size: 16px;">
                           View Order in Admin Panel
                        </a>
                    </div>
        
                    <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">
                        Check the admin panel for more details.
                    </p>
                </div>
            </div>
        `;
        

        await sendEmail(adminEmail, adminSubject, adminText, adminHtml);

        const userSubject = "🛍️ Order Confirmation - Thank You for Your Purchase!";
        const userText = `Thank you for your order, ${userName}! Your order status is: Pending.`;
        
        const userHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
                <div style="background-color: #ffffff; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #28a745; text-align: center;">🛍️ Thank You for Your Order, ${userName}!</h2>
                    <p style="font-size: 16px; color: #333; text-align: center;">
                        Your order has been successfully placed. We truly appreciate your support!
                    </p>
        
                    <div style="border: 1px solid #ddd; padding: 10px; border-radius: 5px; background-color: #f1f1f1;">
                        <p style="font-size: 18px; color: #333;"><strong>📝 Order Details:</strong></p>
                        <p style="font-size: 16px; color: #555;"><strong>Status:</strong> <span style="color: blue;">Pending</span></p>
                        <p style="font-size: 16px; color: #555;"><strong>Delivery Method:</strong> ${
                            deliveryMethod === "delivery" ? "🚚 Delivery" : "🏠 Pickup"
                        }</p>
                        ${
                            deliveryMethod === "delivery"
                                ? `<p style="font-size: 16px; color: #555;"><strong>Delivery Address:</strong> ${address}</p>`
                                : ""
                        }
                    </div>
        
                    <h3 style="color: #007BFF; margin-top: 20px;">🛒 Products Ordered:</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 8px; background-color: #007BFF; color: white;">Product</th>
                            <th style="border: 1px solid #ddd; padding: 8px; background-color: #007BFF; color: white;">Quantity</th>
                        </tr>
                        ${productDetails}
                    </table>
        
                    <p style="font-size: 16px; color: #333;"><strong>Total Price:</strong> <span style="color: #28A745;">$${total}</span></p>
        
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="https://yourwebsite.com/orders" 
                           style="background-color: #007BFF; color: white; text-decoration: none; padding: 12px 20px; border-radius: 5px; font-size: 16px;">
                           Track Your Order
                        </a>
                    </div>
        
                    <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">
                        We will notify you once your order is processed. Thank you for choosing us! 😊
                    </p>
                </div>
            </div>
        `;
        
        await sendEmail(userEmail, userSubject, userText, userHtml);

        res.status(201).json(newOrder);
    } catch (error: any) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


  

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Update order status
        order.status = status;
        await order.save();

        // Check if status changed to "Delivered"
        if (status === "Delivered") {
            const userEmail:any = await User.findById(order.user).select("email");
            const userName = order.userName;

            // 📩 Email to User
            const subject = "🎉 Your Order Has Been Delivered!";

const text = `Hello ${userName}, your order has been successfully delivered. We hope you enjoy your purchase!`;

const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
    <div style="background-color: #ffffff; padding: 20px; border-radius: 10px;">
      <h2 style="color: #4CAF50; text-align: center;">🎉 Your Order Has Been Delivered!</h2>
      <p style="font-size: 16px; color: #333; text-align: center;">Hi <strong>${userName}</strong>,</p>
      <p style="font-size: 16px; color: #333; text-align: center;">
        We are thrilled to let you know that your order has been successfully delivered! 🎁
      </p>
      
      <div style="text-align: center; margin: 20px 0;">
        <img src="https://cdn-icons-png.flaticon.com/512/633/633781.png" alt="Delivery Icon" width="100" />
      </div>

      <p style="font-size: 16px; color: #333; text-align: center;">
        We hope you love your purchase! If you have any questions or need support, feel free to reach out.
      </p>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="https://yourstore.com/orders" 
           style="background-color: #4CAF50; color: white; text-decoration: none; padding: 12px 20px; border-radius: 5px; font-size: 16px;">
           View Your Order
        </a>
      </div>

      <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">
        Thank you for shopping with us! ❤️ <br>
        Need help? <a href="mailto:support@yourstore.com" style="color: #4CAF50; text-decoration: none;">Contact Us</a>
      </p>
    </div>
  </div>
`;

            await sendEmail(userEmail?.email, subject, text, html);
        }

        res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error: any) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

  
// Delete an order
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await order.deleteOne();
    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
