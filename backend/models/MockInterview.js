import mongoose from 'mongoose';

const mockInterviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    interviewerName: {
      type: String,
      required: [true, 'Please provide the name of the interviewer or platform'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide the interview date'],
      default: Date.now,
    },
    feedback: {
      type: String,
      default: '',
    },
    ratingCommunication: {
      type: Number,
      required: [true, 'Please rate communication skills (1-5)'],
      min: 1,
      max: 5,
    },
    ratingProblemSolving: {
      type: Number,
      required: [true, 'Please rate problem-solving skills (1-5)'],
      min: 1,
      max: 5,
    },
    ratingCoding: {
      type: Number,
      required: [true, 'Please rate coding skills (1-5)'],
      min: 1,
      max: 5,
    },
    problemsSolved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
      },
    ],
  },
  {
    timestamps: true,
  }
);

mockInterviewSchema.index({ userId: 1, date: -1 });

const MockInterview = mongoose.model('MockInterview', mockInterviewSchema);
export default MockInterview;
