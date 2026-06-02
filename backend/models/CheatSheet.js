import mongoose from 'mongoose';
import { VALID_TOPICS } from './Problem.js';

const cheatSheetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title for the cheat sheet'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Please specify a DSA topic'],
      enum: {
        values: VALID_TOPICS,
        message: '{VALUE} is not a valid topic',
      },
    },
    content: {
      type: String,
      required: [true, 'Please provide content for the cheat sheet'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

cheatSheetSchema.index({ userId: 1, topic: 1 });

const CheatSheet = mongoose.model('CheatSheet', cheatSheetSchema);
export default CheatSheet;
