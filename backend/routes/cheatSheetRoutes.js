import express from 'express';
import {
  getCheatSheets,
  getCheatSheetById,
  createCheatSheet,
  updateCheatSheet,
  deleteCheatSheet,
} from '../controllers/cheatSheetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply JWT verification middleware to all cheatsheet routes
router.use(protect);

router.route('/')
  .get(getCheatSheets)
  .post(createCheatSheet);

router.route('/:id')
  .get(getCheatSheetById)
  .put(updateCheatSheet)
  .delete(deleteCheatSheet);

export default router;
