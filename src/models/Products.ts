import mongoose, { Document } from "mongoose";

interface IReview {
  user: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
}

interface IProduct extends Document {
  name: string;
  price: number;
  shortdesc: string;
  description: string;
  category: string;
  image: string;
  stock: number;
  review: IReview[];
}

const reviewSchema = new mongoose.Schema<IReview>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    shortdesc: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    review: [reviewSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", productSchema);
