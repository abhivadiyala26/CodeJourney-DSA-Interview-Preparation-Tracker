import MockInterview from '../models/MockInterview.js';

// @desc    Get all user mock interview feedback entries
// @route   GET /api/mocks
// @access  Private
export const getMockInterviews = async (req, res) => {
  try {
    const mocks = await MockInterview.find({ userId: req.user._id })
      .populate('problemsSolved', 'title platform difficulty')
      .sort({ date: -1 });
    res.json(mocks);
  } catch (error) {
    console.error('Fetch Mocks Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving mock interviews logs' });
  }
};

// @desc    Create a new mock interview feedback entry
// @route   POST /api/mocks
// @access  Private
export const createMockInterview = async (req, res) => {
  const {
    interviewerName,
    date,
    feedback,
    ratingCommunication,
    ratingProblemSolving,
    ratingCoding,
    problemsSolved,
  } = req.body;

  try {
    if (!interviewerName || !ratingCommunication || !ratingProblemSolving || !ratingCoding) {
      return res.status(400).json({ message: 'Interviewer name and all ratings (1-5) are required' });
    }

    const mock = new MockInterview({
      userId: req.user._id,
      interviewerName,
      date: date || new Date(),
      feedback: feedback || '',
      ratingCommunication: parseInt(ratingCommunication, 10),
      ratingProblemSolving: parseInt(ratingProblemSolving, 10),
      ratingCoding: parseInt(ratingCoding, 10),
      problemsSolved: problemsSolved || [],
    });

    const savedMock = await mock.save();
    
    // Fetch newly saved mock with populated problems details to send back to client
    const populatedMock = await MockInterview.findById(savedMock._id).populate(
      'problemsSolved',
      'title platform difficulty'
    );

    res.status(201).json(populatedMock);
  } catch (error) {
    console.error('Create Mock Error:', error.message);
    res.status(500).json({ message: 'Server error logging mock interview' });
  }
};

// @desc    Delete a mock interview feedback entry
// @route   DELETE /api/mocks/:id
// @access  Private
export const deleteMockInterview = async (req, res) => {
  try {
    const result = await MockInterview.deleteOne({ _id: req.params.id, userId: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Mock interview log not found' });
    }
    res.json({ message: 'Mock interview feedback removed successfully' });
  } catch (error) {
    console.error('Delete Mock Error:', error.message);
    res.status(500).json({ message: 'Server error deleting mock log' });
  }
};
