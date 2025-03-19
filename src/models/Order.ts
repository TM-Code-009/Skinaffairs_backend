import mongoose, { Document } from "mongoose";

interface IOrder extends Document {
  user: mongoose.Schema.Types.ObjectId|{ email: string };
  userName: string;
  products: { product: mongoose.Schema.Types.ObjectId; productName: string; quantity: number }[];
  total: number;
  status: string;
  deliveryMethod: string; // "pickup" or "delivery"
  address?: string; // Required only for delivery
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Shipped", "Delivered"], default: "Pending" },
    deliveryMethod: { type: String, enum: ["pickup", "delivery"], required: true },
    address: { type: String },
  },
  { timestamps: true }
);


export default mongoose.model<IOrder>("Order", orderSchema);
