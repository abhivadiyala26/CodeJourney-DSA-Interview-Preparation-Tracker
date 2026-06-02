import express from 'express';
import {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  getDashboardStats,
  exportProblemsCSV,
  loadDemoData,
  getProblemAIReview,
} from '../controllers/problemController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply JWT protection middleware to all problem routes
router.use(protect);

// Dashboard statistics
router.get('/dashboard/stats', getDashboardStats);

// CSV Export
router.get('/export/csv', exportProblemsCSV);

// Load Demo Seed Data
router.post('/demo', loadDemoData);

// Request AI Coach Code Review
router.post('/:id/ai-review', getProblemAIReview);

// Base CRUD routes
router.route('/')
  .get(getProblems)
  .post(createProblem);

router.route('/:id')
  .get(getProblemById)
  .put(updateProblem)
  .delete(deleteProblem);

export default router;
