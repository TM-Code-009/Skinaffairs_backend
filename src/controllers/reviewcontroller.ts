import { Request, Response } from 'express';
import Review from '../models/Review';

export const addReview = async (req: Request, res: Response): Promise<void> => {
  const { rating, comment } = req.body;
  const userId = req.user?._id;

  try {
    const existingReview = await Review.findOne({ user: userId });
    if (existingReview) {
      res.status(400).json({ message: 'You have already submitted a review' });
      return;
    }

    const review = await Review.create({ user: userId, rating, comment });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getAllReviews = async (_req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find().populate('user', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  const { reviewId } = req.params;
  const userId = req.user?._id;

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    if (review.user.toString() !== userId?.toString()) {
      res.status(403).json({ message: 'You can only delete your own review' });
      return;
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateReview = async (req: Request, res: Response): Promise<void> => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user?._id;

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    if (review.user.toString() !== userId?.toString()) {
      res.status(403).json({ message: 'You can only update your own review' });
      return;
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
