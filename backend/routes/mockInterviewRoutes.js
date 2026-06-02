import express from 'express';
import {
  getMockInterviews,
  createMockInterview,
  deleteMockInterview,
} from '../controllers/mockInterviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply JWT verification middleware to all mock routes
router.use(protect);

router.route('/')
  .get(getMockInterviews)
  .post(createMockInterview);

router.route('/:id')
  .delete(deleteMockInterview);

export default router;
