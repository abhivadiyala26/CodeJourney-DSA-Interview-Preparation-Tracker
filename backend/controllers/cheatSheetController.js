import CheatSheet from '../models/CheatSheet.js';

// @desc    Get all user cheat sheets
// @route   GET /api/cheatsheets
// @access  Private
export const getCheatSheets = async (req, res) => {
  try {
    const sheets = await CheatSheet.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(sheets);
  } catch (error) {
    console.error('Fetch CheatSheets Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving cheat sheets' });
  }
};

// @desc    Get a single cheat sheet details
// @route   GET /api/cheatsheets/:id
// @access  Private
export const getCheatSheetById = async (req, res) => {
  try {
    const sheet = await CheatSheet.findOne({ _id: req.params.id, userId: req.user._id });
    if (!sheet) {
      return res.status(404).json({ message: 'Cheat sheet not found' });
    }
    res.json(sheet);
  } catch (error) {
    console.error('Fetch CheatSheet ID Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving cheat sheet' });
  }
};

// @desc    Create a new cheat sheet
// @route   POST /api/cheatsheets
// @access  Private
export const createCheatSheet = async (req, res) => {
  const { title, topic, content } = req.body;

  try {
    if (!title || !topic) {
      return res.status(400).json({ message: 'Title and topic are required' });
    }

    const sheet = new CheatSheet({
      userId: req.user._id,
      title,
      topic,
      content: content || '',
    });

    const savedSheet = await sheet.save();
    res.status(201).json(savedSheet);
  } catch (error) {
    console.error('Create CheatSheet Error:', error.message);
    res.status(500).json({ message: 'Server error saving cheat sheet' });
  }
};

// @desc    Update a cheat sheet
// @route   PUT /api/cheatsheets/:id
// @access  Private
export const updateCheatSheet = async (req, res) => {
  const { title, topic, content } = req.body;

  try {
    const sheet = await CheatSheet.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!sheet) {
      return res.status(404).json({ message: 'Cheat sheet not found' });
    }

    if (title !== undefined) sheet.title = title;
    if (topic !== undefined) sheet.topic = topic;
    if (content !== undefined) sheet.content = content;

    const updatedSheet = await sheet.save();
    res.json(updatedSheet);
  } catch (error) {
    console.error('Update CheatSheet Error:', error.message);
    res.status(500).json({ message: 'Server error updating cheat sheet' });
  }
};

// @desc    Delete a cheat sheet
// @route   DELETE /api/cheatsheets/:id
// @access  Private
export const deleteCheatSheet = async (req, res) => {
  try {
    const result = await CheatSheet.deleteOne({ _id: req.params.id, userId: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Cheat sheet not found' });
    }
    res.json({ message: 'Cheat sheet removed successfully' });
  } catch (error) {
    console.error('Delete CheatSheet Error:', error.message);
    res.status(500).json({ message: 'Server error deleting cheat sheet' });
  }
};
