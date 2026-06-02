import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user. Note: password hashing happens in pre-save mongoose hook.
    // Setting default role to 'user'
    const user = await User.create({
      name,
      email,
      password,
      role: 'user'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        token: generateToken(user._id),
        createdAt: user.createdAt,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Check streak status on login to see if streak was broken (last active date was before yesterday)
      let streakUpdated = false;
      if (user.lastActiveDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastActive = new Date(user.lastActiveDate);
        lastActive.setHours(0, 0, 0, 0);
        
        const diffTime = today - lastActive;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
          // Reset current streak because user was inactive for more than a day
          user.currentStreak = 0;
          await user.save();
          streakUpdated = true;
        }
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        token: generateToken(user._id),
        createdAt: user.createdAt,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        lastActiveDate: user.lastActiveDate,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile Retrieval Error:', error.message);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      
      // If email is changing, make sure it is not already taken
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already in use' });
        }
        user.email = req.body.email;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        currentStreak: updatedUser.currentStreak,
        longestStreak: updatedUser.longestStreak,
        createdAt: updatedUser.createdAt,
        token: generateToken(updatedUser._id), // Regenerate token with updated details if needed
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile Update Error:', error.message);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword; // Hashing triggers inside mongoose save hook
      await user.save();
      res.json({ message: 'Password changed successfully' });
    } else {
      res.status(400).json({ message: 'Incorrect current password' });
    }
  } catch (error) {
    console.error('Password Change Error:', error.message);
    res.status(500).json({ message: 'Server error changing password' });
  }
};
