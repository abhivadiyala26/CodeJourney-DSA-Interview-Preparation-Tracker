import mongoose from 'mongoose';

const VALID_TOPICS = [
  'Arrays', 'Strings', 'Hashing', 'Linked List', 'Stack', 'Queue',
  'Trees', 'BST', 'Heap', 'Graph', 'DP', 'Greedy', 'Recursion',
  'Backtracking', 'Sliding Window', 'Binary Search', 'Bit Manipulation'
];

const VALID_COMPANIES = [
  'Amazon', 'Google', 'Microsoft', 'Adobe', 'Atlassian', 'Oracle',
  'Meta', 'Apple', 'Netflix', 'Uber'
];

const problemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a problem name/title'],
      trim: true,
    },
    platform: {
      type: String,
      required: [true, 'Please specify the coding platform (e.g. LeetCode)'],
      trim: true,
    },
    problemLink: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: {
        values: ['Easy', 'Medium', 'Hard'],
        message: '{VALUE} is not a valid difficulty level',
      },
    },
    topic: {
      type: String,
      required: true,
      enum: {
        values: VALID_TOPICS,
        message: '{VALUE} is not a valid topic',
      },
    },
    companies: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.every(company => VALID_COMPANIES.includes(company));
        },
        message: props => `${props.value} contains invalid company tags`,
      },
      default: [],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['Solved', 'Revision Required', 'Attempted', 'Unsolved'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Unsolved',
    },
    notes: {
      type: String,
      default: '',
    },
    approach: {
      type: String,
      default: '',
    },
    mistakes: {
      type: String,
      default: '',
    },
    solvedDate: {
      type: Date,
      default: null,
    },
    revisionDate: {
      type: Date,
      default: null,
    },
    timeToSolve: {
      type: Number,
      default: 0,
    },
    code: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching, filtering, and stats aggregation
problemSchema.index({ userId: 1, createdAt: -1 });
problemSchema.index({ userId: 1, status: 1 });
problemSchema.index({ userId: 1, difficulty: 1 });
problemSchema.index({ userId: 1, solvedDate: -1 });
problemSchema.index({ userId: 1, topic: 1 });

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;
export { VALID_TOPICS, VALID_COMPANIES };
