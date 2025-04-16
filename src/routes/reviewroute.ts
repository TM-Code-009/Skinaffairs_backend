import express from 'express';
import {
  addReview,
  getAllReviews,
  deleteReview,
  updateReview,
} from '../controllers/reviewcontroller';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// POST /api/reviews — Add a site review (authenticated)
router.post('/addreview', protect, addReview);

// GET /api/reviews — Get all site reviews (public)
router.get('/getallreview', getAllReviews);

// PUT /api/reviews/:reviewId — Update a review (authenticated)
router.put('/updatereview/:reviewId', protect, updateReview);

// DELETE /api/reviews/:reviewId — Delete a review (authenticated)
router.delete('/deletereview/:reviewId', protect, deleteReview);

export default router;
