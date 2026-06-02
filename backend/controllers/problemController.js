import Problem, { VALID_TOPICS, VALID_COMPANIES } from '../models/Problem.js';
import User from '../models/User.js';

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Recalculate streak based on problem history
const recalculateUserStreak = async (userId) => {
  try {
    const solvedProblems = await Problem.find({
      userId,
      status: 'Solved',
      solvedDate: { $ne: null },
    }).select('solvedDate');

    if (solvedProblems.length === 0) {
      await User.findByIdAndUpdate(userId, {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
      });
      return { current: 0, longest: 0 };
    }

    // Get unique sorted dates (descending - newest first)
    const uniqueDates = Array.from(
      new Set(
        solvedProblems.map((p) => {
          const d = new Date(p.solvedDate);
          return getLocalDateString(d);
        })
      )
    ).sort((a, b) => new Date(b) - new Date(a));

    const todayStr = getLocalDateString(new Date());
    const yesterdayStr = getLocalDateString(new Date(Date.now() - 86400000));

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate longest streak using sorted ascending list
    const sortedDatesAsc = [...uniqueDates].reverse();
    if (sortedDatesAsc.length > 0) {
      tempStreak = 1;
      longestStreak = 1;
      for (let i = 1; i < sortedDatesAsc.length; i++) {
        const prev = new Date(sortedDatesAsc[i - 1]);
        const curr = new Date(sortedDatesAsc[i]);
        const diffTime = curr - prev;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
    }

    // Calculate current streak (must have solved today or yesterday to continue)
    if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prev = new Date(uniqueDates[i - 1]);
        const curr = new Date(uniqueDates[i]);
        const diffTime = prev - curr;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break; // streak broke
        }
      }
    } else {
      currentStreak = 0;
    }

    const lastActiveDate = new Date(uniqueDates[0]);
    await User.findByIdAndUpdate(userId, {
      currentStreak,
      longestStreak: Math.max(currentStreak, longestStreak),
      lastActiveDate,
    });

    return { current: currentStreak, longest: Math.max(currentStreak, longestStreak) };
  } catch (error) {
    console.error('Streak Recalculation Error:', error);
    return { current: 0, longest: 0 };
  }
};

// Calculate next revision date
const getRevisionDate = (schedule) => {
  const now = new Date();
  if (schedule === 'tomorrow') {
    return new Date(now.setDate(now.getDate() + 1));
  } else if (schedule === '3days') {
    return new Date(now.setDate(now.getDate() + 3));
  } else if (schedule === '7days') {
    return new Date(now.setDate(now.getDate() + 7));
  } else if (schedule === '30days') {
    return new Date(now.setDate(now.getDate() + 30));
  }
  return null;
};

// @desc    Get all user problems with search, filtering, sorting, pagination
// @route   GET /api/problems
// @access  Private
export const getProblems = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      search,
      difficulty,
      status,
      platform,
      company,
      topic,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter query
    const query = { userId };

    // Text search (search in title, topic, companies, notes)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { companies: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    if (difficulty) query.difficulty = difficulty;
    if (status) query.status = status;
    if (platform) query.platform = { $regex: `^${platform}$`, $options: 'i' };
    if (topic) query.topic = topic;
    if (company) query.companies = company;

    // Sorting
    let sortOptions = {};
    if (sortBy === 'solvedDate') {
      sortOptions.solvedDate = order === 'desc' ? -1 : 1;
    } else if (sortBy === 'title') {
      sortOptions.title = order === 'desc' ? -1 : 1;
    } else if (sortBy === 'difficulty') {
      // Custom difficulty sort in JS might be needed, but simple query sort here
      sortOptions.difficulty = order === 'desc' ? -1 : 1;
    } else {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Problem.countDocuments(query);
    const problems = await Problem.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      problems,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      totalProblems: total,
    });
  } catch (error) {
    console.error('Fetch Problems Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving problems list' });
  }
};

// @desc    Get details of a single problem
// @route   GET /api/problems/:id
// @access  Private
export const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    console.error('Fetch Problem ID Error:', error.message);
    res.status(500).json({ message: 'Server error retrieving problem details' });
  }
};

// @desc    Add a new problem
// @route   POST /api/problems
// @access  Private
export const createProblem = async (req, res) => {
  const {
    title,
    platform,
    problemLink,
    difficulty,
    topic,
    companies,
    status,
    notes,
    approach,
    mistakes,
    solvedDate,
    revisionSchedule, // 'tomorrow', '3days', '7days', '30days'
    timeToSolve,
    code,
  } = req.body;

  try {
    const isSolved = status === 'Solved';
    const computedSolvedDate = isSolved ? (solvedDate ? new Date(solvedDate) : new Date()) : null;

    let computedRevisionDate = null;
    if (status === 'Revision Required' && revisionSchedule) {
      computedRevisionDate = getRevisionDate(revisionSchedule);
    }

    const problem = new Problem({
      userId: req.user._id,
      title,
      platform,
      problemLink,
      difficulty,
      topic,
      companies: companies || [],
      status: status || 'Unsolved',
      notes: notes || '',
      approach: approach || '',
      mistakes: mistakes || '',
      solvedDate: computedSolvedDate,
      revisionDate: computedRevisionDate,
      timeToSolve: timeToSolve || 0,
      code: code || '',
    });

    const savedProblem = await problem.save();

    // Trigger streak recalculation if this problem is Solved
    if (isSolved) {
      await recalculateUserStreak(req.user._id);
    }

    res.status(201).json(savedProblem);
  } catch (error) {
    console.error('Create Problem Error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error creating problem' });
  }
};

// @desc    Update a problem
// @route   PUT /api/problems/:id
// @access  Private
export const updateProblem = async (req, res) => {
  const {
    title,
    platform,
    problemLink,
    difficulty,
    topic,
    companies,
    status,
    notes,
    approach,
    mistakes,
    solvedDate,
    revisionSchedule, // 'tomorrow', '3days', '7days', '30days'
  } = req.body;

  try {
    const problem = await Problem.findOne({ _id: req.params.id, userId: req.user._id });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const originalStatus = problem.status;

    // Update fields
    if (title !== undefined) problem.title = title;
    if (platform !== undefined) problem.platform = platform;
    if (problemLink !== undefined) problem.problemLink = problemLink;
    if (difficulty !== undefined) problem.difficulty = difficulty;
    if (topic !== undefined) problem.topic = topic;
    if (companies !== undefined) problem.companies = companies;
    if (notes !== undefined) problem.notes = notes;
    if (approach !== undefined) problem.approach = approach;
    if (mistakes !== undefined) problem.mistakes = mistakes;
    if (timeToSolve !== undefined) problem.timeToSolve = timeToSolve;
    if (code !== undefined) problem.code = code;

    // Status / date updates
    if (status !== undefined) {
      problem.status = status;
      if (status === 'Solved') {
        if (!problem.solvedDate || solvedDate) {
          problem.solvedDate = solvedDate ? new Date(solvedDate) : new Date();
        }
        problem.revisionDate = null; // Clear revision if solved
      } else if (status === 'Revision Required') {
        problem.solvedDate = null;
        if (revisionSchedule) {
          problem.revisionDate = getRevisionDate(revisionSchedule);
        }
      } else {
        problem.solvedDate = null;
        problem.revisionDate = null;
      }
    } else if (problem.status === 'Revision Required' && revisionSchedule) {
      // If status didn't change but new schedule provided
      problem.revisionDate = getRevisionDate(revisionSchedule);
    }

    const updatedProblem = await problem.save();

    // Trigger streak recalculation if status changed to/from 'Solved' or solve date updated
    if (originalStatus === 'Solved' || status === 'Solved') {
      await recalculateUserStreak(req.user._id);
    }

    res.json(updatedProblem);
  } catch (error) {
    console.error('Update Problem Error:', error.message);
    res.status(500).json({ message: 'Server error updating problem' });
  }
};

// @desc    Delete a problem
// @route   DELETE /api/problems/:id
// @access  Private
export const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findOne({ _id: req.params.id, userId: req.user._id });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const originalStatus = problem.status;
    await Problem.deleteOne({ _id: req.params.id });

    // Recalculate streak if we deleted a solved problem
    if (originalStatus === 'Solved') {
      await recalculateUserStreak(req.user._id);
    }

    res.json({ message: 'Problem removed successfully' });
  } catch (error) {
    console.error('Delete Problem Error:', error.message);
    res.status(500).json({ message: 'Server error deleting problem' });
  }
};

// @desc    Get dashboard metrics & charts statistics
// @route   GET /api/problems/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Difficulty distribution
    const difficultyCounts = await Problem.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          solved: {
            $sum: { $cond: [{ $eq: ['$status', 'Solved'] }, 1, 0] },
          },
        },
      },
    ]);

    const stats = {
      total: 0,
      solved: 0,
      easy: { total: 0, solved: 0 },
      medium: { total: 0, solved: 0 },
      hard: { total: 0, solved: 0 },
    };

    difficultyCounts.forEach((d) => {
      const type = d._id.toLowerCase();
      if (stats[type]) {
        stats[type].total = d.count;
        stats[type].solved = d.solved;
      }
      stats.total += d.count;
      stats.solved += d.solved;
    });

    // 2. Revision Counts
    const today = new Date();
    const overdueRevisions = await Problem.countDocuments({
      userId,
      status: 'Revision Required',
      revisionDate: { $lt: today },
    });

    const upcomingRevisions = await Problem.countDocuments({
      userId,
      status: 'Revision Required',
      revisionDate: { $gte: today },
    });

    // 3. User streaks (refresh from user model)
    const user = await User.findById(userId);

    // 4. Topic-wise progress (solved / total per valid topic)
    const topicAggregations = await Problem.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$topic',
          total: { $sum: 1 },
          solved: { $sum: { $cond: [{ $eq: ['$status', 'Solved'] }, 1, 0] } },
        },
      },
    ]);

    const topicStats = VALID_TOPICS.map((topic) => {
      const match = topicAggregations.find((t) => t._id === topic);
      return {
        topic,
        total: match ? match.total : 0,
        solved: match ? match.solved : 0,
        percentage: match && match.total > 0 ? Math.round((match.solved / match.total) * 100) : 0,
      };
    });

    // 5. Monthly Activity Chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlySolves = await Problem.aggregate([
      {
        $match: {
          userId,
          status: 'Solved',
          solvedDate: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$solvedDate' },
            month: { $month: '$solvedDate' },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats = [];
    for (let i = 0; i < 6; i++) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() - (5 - i));
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1; // JS month 0-indexed, Mongo $month 1-indexed

      const match = monthlySolves.find((m) => m._id.year === year && m._id.month === month);

      monthlyStats.push({
        name: `${monthNames[month - 1]} ${year}`,
        solved: match ? match.count : 0,
      });
    }

    // 6. GitHub-style heatmap data (all solves in the last 365 days)
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    oneYearAgo.setHours(0, 0, 0, 0);

    const dailySolvesAgg = await Problem.aggregate([
      {
        $match: {
          userId,
          status: 'Solved',
          solvedDate: { $gte: oneYearAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$solvedDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const heatmapData = {};
    dailySolvesAgg.forEach((item) => {
      heatmapData[item._id] = item.count;
    });

    // 7. Company tag stats
    const companyAggregations = await Problem.aggregate([
      { $match: { userId } },
      { $unwind: '$companies' },
      {
        $group: {
          _id: '$companies',
          total: { $sum: 1 },
          solved: { $sum: { $cond: [{ $eq: ['$status', 'Solved'] }, 1, 0] } },
        },
      },
    ]);

    const companyStats = VALID_COMPANIES.map((company) => {
      const match = companyAggregations.find((c) => c._id === company);
      return {
        company,
        total: match ? match.total : 0,
        solved: match ? match.solved : 0,
      };
    });

    res.json({
      stats: {
        totalSolved: stats.solved,
        totalProblems: stats.total,
        easySolved: stats.easy.solved,
        easyTotal: stats.easy.total,
        mediumSolved: stats.medium.solved,
        mediumTotal: stats.medium.total,
        hardSolved: stats.hard.solved,
        hardTotal: stats.hard.total,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        revisionDue: overdueRevisions,
        revisionUpcoming: upcomingRevisions,
      },
      difficultyStats: [
        { name: 'Easy', solved: stats.easy.solved, total: stats.easy.total, color: '#10B981' },
        { name: 'Medium', solved: stats.medium.solved, total: stats.medium.total, color: '#F59E0B' },
        { name: 'Hard', solved: stats.hard.solved, total: stats.hard.total, color: '#EF4444' },
      ],
      topicStats,
      monthlyStats,
      heatmapData,
      companyStats,
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error.message);
    res.status(500).json({ message: 'Server error generating dashboard analytics' });
  }
};

// @desc    Export problems as CSV data (Returns CSV text or JSON to be formatted on frontend)
// @route   GET /api/problems/export/csv
// @access  Private
export const exportProblemsCSV = async (req, res) => {
  try {
    const problems = await Problem.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // Format fields for frontend to parse or send directly as CSV attachment
    // Let's send it as standard JSON arrays which frontend can cleanly compile into a downloadable file.
    // This avoids formatting issues with commas/quotes and enables smooth client-side download.
    res.json(problems);
  } catch (error) {
    console.error('CSV Export Error:', error.message);
    res.status(500).json({ message: 'Server error generating export data' });
  }
};

// @desc    Load Demo Data for user
// @route   POST /api/problems/demo
// @access  Private
export const loadDemoData = async (req, res) => {
  const userId = req.user._id;

  try {
    // 1. Clear any existing problems for a clean slate, or keep? Let's just delete existing to let demo load cleanly.
    await Problem.deleteMany({ userId });

    const topicsList = VALID_TOPICS;
    const companiesList = VALID_COMPANIES;
    const platforms = ['LeetCode', 'GeeksforGeeks', 'HackerRank', 'Codeforces'];

    // 2. Generate staggered dates for solved dates (past 60 days)
    const generatePastDate = (daysAgo) => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      // Give it random hours
      date.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
      return date;
    };

    const demoProblems = [
      // 1. Easy Array LeetCode - Solved 15 days ago
      {
        title: 'Two Sum',
        platform: 'LeetCode',
        problemLink: 'https://leetcode.com/problems/two-sum/',
        difficulty: 'Easy',
        topic: 'Arrays',
        companies: ['Amazon', 'Google', 'Meta'],
        status: 'Solved',
        notes: 'Classic hashing approach to find index. Time: O(N), Space: O(N)',
        approach: 'Use a hash map to store elements we have seen and their index. Check if target - current exists in map.',
        mistakes: 'None, very straightforward.',
        solvedDate: generatePastDate(15),
      },
      // 2. Medium LinkedList LeetCode - Solved 14 days ago
      {
        title: 'Add Two Numbers',
        platform: 'LeetCode',
        problemLink: 'https://leetcode.com/problems/add-two-numbers/',
        difficulty: 'Medium',
        topic: 'Linked List',
        companies: ['Amazon', 'Microsoft', 'Oracle'],
        status: 'Solved',
        notes: 'Sum values node by node, taking care of carry.',
        approach: 'Traverse lists, add values + carry. Create new node with sum % 10. carry = sum / 10.',
        mistakes: 'Forgot to handle carry at the end of the loop when both lists are exhausted.',
        solvedDate: generatePastDate(14),
      },
      // 3. Hard Trees LeetCode - Solved 13 days ago
      {
        title: 'Binary Tree Maximum Path Sum',
        platform: 'LeetCode',
        problemLink: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
        difficulty: 'Hard',
        topic: 'Trees',
        companies: ['Google', 'Meta', 'Netflix'],
        status: 'Solved',
        notes: 'Post-order DFS traversal. Tough recursion details.',
        approach: 'At each node, calculate max gain from left and right subtrees. Update global max with node.val + leftGain + rightGain.',
        mistakes: 'Initially returned total path sum instead of maximum branch gain from helper.',
        solvedDate: generatePastDate(13),
      },
      // 4. Medium Dynamic Programming - Solved 12 days ago
      {
        title: 'Longest Palindromic Substring',
        platform: 'LeetCode',
        problemLink: 'https://leetcode.com/problems/longest-palindromic-substring/',
        difficulty: 'Medium',
        topic: 'DP',
        companies: ['Microsoft', 'Amazon', 'Adobe'],
        status: 'Solved',
        notes: 'Can solve with DP table or expanding around center (space optimized).',
        approach: 'Expanded around center for O(1) space. O(N^2) time complexity.',
        mistakes: 'Confused index boundaries in expansion helper.',
        solvedDate: generatePastDate(12),
      },
      // 5. Medium String LeetCode - Solved 8 days ago
      {
        title: 'Longest Substring Without Repeating Characters',
        platform: 'LeetCode',
        problemLink: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
        difficulty: 'Medium',
        topic: 'Sliding Window',
        companies: ['Amazon', 'Google', 'Apple'],
        status: 'Solved',
        notes: 'Sliding window using a set or map for tracking character positions.',
        approach: 'Left and right pointers. If duplicate seen, contract left pointer.',
        mistakes: 'Felt slow. Optimize by storing character indexes in map directly.',
        solvedDate: generatePastDate(8),
      },
      // 6. Easy BST GeeksForGeeks - Solved 7 days ago
      {
        title: 'Search in a BST',
        platform: 'GeeksforGeeks',
        problemLink: 'https://www.geeksforgeeks.org/binary-search-tree-set-1-search-and-insertion/',
        difficulty: 'Easy',
        topic: 'BST',
        companies: ['Oracle', 'Microsoft'],
        status: 'Solved',
        notes: 'Simple recursion or iteration. O(H) time.',
        approach: 'Go left if target < node.val, go right if target > node.val.',
        mistakes: 'Easy problem.',
        solvedDate: generatePastDate(7),
      },
      // 7. Medium Graph LeetCode - Solved 6 days ago
      {
        title: 'Number of Islands',
        platform: 'LeetCode',
        problemLink: 'https://leetcode.com/problems/number-of-islands/',
        difficulty: 'Medium',
        topic: 'Graph',
        companies: ['Amazon', 'Microsoft', 'Google', 'Meta', 'Atlassian'],
        status: 'Solved',
        notes: 'DFS or BFS to visit connected grid components.',
        approach: 'Iterate grid, whenever 1 is hit, start DFS to sink the entire island (set 1s to 0s). Count islands.',
        mistakes: 'Watch for string "1" vs integer 1 boundary cases on LeetCode grid.',
        solvedDate: generatePastDate(6),
      },
      // 8. Medium Stack LeetCode - Solved 5 days ago
      {
        title: 'Min Stack',
        platform: 'LeetCode',
        problemLink: 'https://leetcode.com/problems/min-stack/',
        difficulty: 'Medium',
        topic: 'Stack',
        companies: ['Uber', 'Apple', 'Atlassian'],
        status: 'Solved',
        notes: 'Design stack supporting push, pop, top, getMin in O(1) time.',
        approach: 'Use an auxiliary stack or store pairs [value, currentMin] in the main stack.',
        mistakes: 'Made helper values dynamic instead of static, which wasted memory.',
        solvedDate: generatePastDate(5),
      },
      // 9. Medium Binary Search - Solved 4 days ago
      {
        title: 'Search in Rotated Sorted Array',
        platform: 'LeetCode',
        problemLink: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
        difficulty: 'Medium',
        topic: 'Binary Search',
        companies: ['Google', 'Meta', 'Uber'],
        status: 'Solved',
        notes: 'Binary search with check to see which half is sorted.',
        approach: 'Mid index splits array. Check if left or right is sorted, adjust left/right bounds accordingly.',
        mistakes: 'Handling equal to signs on bounds comparison can be tricky.',
        solvedDate: generatePastDate(4),
      },
      // 10. Easy Bit Manipulation - Solved 3 days ago
      {
        title: 'Number of 1 Bits',
        platform: 'LeetCode',
        problemLink: 'https://leetcode.com/problems/number-of-1-bits/',
        difficulty: 'Easy',
        topic: 'Bit Manipulation',
        companies: ['Apple', 'Microsoft'],
        status: 'Solved',
        notes: 'Brian Kernighan algorithm or simple bit shifts.',
        approach: 'Loop until n becomes 0. Perform n = n & (n - 1) to clear lowest set bit.',
        mistakes: 'No mistakes.',
        solvedDate: generatePastDate(3),
      },
      // 11. Medium Greedy - Solved 2 days ago
      {
        title: 'Jump Game',
        platform: 'LeetCode',
        problemLink: 'https://leetcode.com/problems/jump-game/',
        difficulty: 'Medium',
        topic: 'Greedy',
        companies: ['Amazon', 'Google'],
        status: 'Solved',
        notes: 'Greedy solution tracking max reachable index. O(N) time.',
        approach: 'Iterate index i, if i is reachable, update maxReachable = max(maxReachable, i + nums[i]).',
        mistakes: 'Initially wrote a recursion + memoization DP which hit stack overflow.',
        solvedDate: generatePastDate(2),
      },
      // 12. Medium Heap - Solved 1 day ago
      {
        title: 'K Closest Points to Origin',
        platform: 'LeetCode',
        problemLink: 'https://leetcode.com/problems/k-closest-points-to-origin/',
        difficulty: 'Medium',
        topic: 'Heap',
        companies: ['Amazon', 'Meta'],
        status: 'Solved',
        notes: 'Use a Max Heap of size K to retain closest elements.',
        approach: 'Build Max Heap. Insert points. If heap size > K, pop. Remaining items in heap are the K closest.',
        mistakes: 'Verify euclidean formula calculations to avoid negative math.',
        solvedDate: generatePastDate(1),
      },
      // 13. Easy String HackerRank - Solved Today
      {
        title: 'Valid Palindrome',
        platform: 'LeetCode',
        problemLink: 'https://leetcode.com/problems/valid-palindrome/',
        difficulty: 'Easy',
        topic: 'Strings',
        companies: ['Microsoft', 'Facebook'],
        status: 'Solved',
        notes: 'Two pointer clean iteration.',
        approach: 'Filter non-alphanumeric, convert lowercase. Left and right pointer compare inwards.',
        mistakes: 'Regex pattern was stripping numbers initially.',
        solvedDate: generatePastDate(0),
      },
      // 14. Medium Recursion - Revision Required (Overdue)
      {
        title: 'Subsets',
        platform: 'LeetCode',
        problemLink: 'https://leetcode.com/problems/subsets/',
        difficulty: 'Medium',
        topic: 'Recursion',
        companies: ['Amazon', 'Facebook', 'Oracle'],
        status: 'Revision Required',
        notes: 'Need to revise backtracking choice pattern.',
        approach: 'Backtracking recursion template. Solve by branching: include / exclude.',
        mistakes: 'Kept appending references to same list instead of copying.',
        solvedDate: null,
        revisionDate: generatePastDate(2), // 2 days ago, so it is OVERDUE
      },
      // 15. Hard Graph - Revision Required (Upcoming)
      {
        title: 'Word Ladder',
        platform: 'LeetCode',
        problemLink: 'https://leetcode.com/problems/word-ladder/',
        difficulty: 'Hard',
        topic: 'Graph',
        companies: ['Amazon', 'Google', 'Meta'],
        status: 'Revision Required',
        notes: 'Shortest path in unweighted graph = BFS.',
        approach: 'Use queue, change one letter at a time, check if in word list.',
        mistakes: 'DFS is too slow for word ladders. Must use BFS.',
        solvedDate: null,
        revisionDate: new Date(Date.now() + 3 * 86400000), // 3 days in the future (Upcoming)
      },
    ];

    // Insert all demo problems
    const problemsWithUser = demoProblems.map((prob) => ({
      ...prob,
      userId,
    }));

    await Problem.insertMany(problemsWithUser);

    // Recalculate streak to match this seeded list
    await recalculateUserStreak(userId);

    res.json({ message: 'Demo data loaded successfully' });
  } catch (error) {
    console.error('Demo Loader Error:', error.message);
    res.status(500).json({ message: 'Server error seeding demo data' });
  }
};

// Local fallback high-fidelity review generator when Gemini key is missing
const generateMockAIReview = (problem) => {
  const defaultInsights = [
    `Common pattern: this problem is classified under ${problem.topic}. Key algorithms usually involve ${
      problem.topic === 'Arrays' ? 'sliding window, two-pointer, or frequency hashing' :
      problem.topic === 'DP' ? 'identifying subproblem recursion and populating tabulation matrices' :
      problem.topic === 'Trees' ? 'post-order DFS traversals or node verification algorithms' :
      problem.topic === 'Graph' ? 'BFS layers or DFS path search backtracking' :
      'appropriate mathematical indices checks and stack space configurations'
    }.`,
    `Platform check: ${problem.platform} requires handling of standard integer overflows and pointer validation.`,
    problem.mistakes 
      ? `Analysis of your documented mistake: "${problem.mistakes}". Make sure to write guard clauses for boundaries first.` 
      : 'Excellent work logging null constraints and boundary conditions.'
  ];

  const defaultOptimizations = [
    `Verify if sorting inputs enables O(N log N) time solutions with O(1) space.`,
    `Can we use space-time tradeoffs? Storing indices in a HashMap could optimize searching search states from quadratic O(N^2) to linear O(N).`
  ];

  const defaultApproach = `Recommended Step-by-Step Approach for ${problem.title || 'this problem'}:
1. Check edge cases: verify if input is empty, null, or has size less than the bounds.
2. Initialize pointers/structures: ${
    problem.topic === 'Arrays' ? 'set up left and right pointers or indices hash map.' :
    problem.topic === 'DP' ? 'define state variables DP[i] and find state transition functions.' :
    problem.topic === 'Trees' ? 'implement recursion helpers returning maximum depth or subtree values.' :
    'allocate structures (Queue, Set) to record visited elements.'
  }
3. Iterate and evaluate: update parameters, handle indices, and return target results.`;

  return {
    complexity: {
      time: problem.difficulty === 'Easy' ? 'O(N)' : problem.difficulty === 'Medium' ? 'O(N log N) or O(N)' : 'O(N * 2^N) or O(V + E)',
      space: problem.difficulty === 'Easy' ? 'O(1)' : 'O(N)',
      details: `Your approach for this ${problem.difficulty} problem is solid. Under standard bounds, utilizing ${
        problem.difficulty === 'Hard' ? 'caching or memoization' : 'linear scans'
      } keeps runtime from degrading.`
    },
    keyInsights: defaultInsights,
    optimizations: defaultOptimizations,
    suggestedApproach: defaultApproach,
    isMock: true
  };
};

// @desc    Get AI Code Review and Optimization Suggestions (Gemini support with local fallback)
// @route   POST /api/problems/:id/ai-review
// @access  Private
export const getProblemAIReview = async (req, res) => {
  try {
    const problem = await Problem.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Try to run real Gemini API if key is present
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are a FAANG software engineering interviewer and DSA coach.
Provide a professional evaluation of the student's solution:
Problem Title: ${problem.title}
Platform: ${problem.platform}
DSA Topic: ${problem.topic}
Difficulty: ${problem.difficulty}
User's Notes: ${problem.notes || 'None logged'}
User's documented Mistakes: ${problem.mistakes || 'None logged'}
User's logical Approach: ${problem.approach || 'None logged'}
User's Solution Code:
\`\`\`
${problem.code || '// No solution code pasted yet.'}
\`\`\`

Analyze their solution code and notes. Respond with a JSON object.
CRITICAL: You must return ONLY valid JSON matching this schema, without any Markdown enclosing code blocks (do not wrap in \`\`\`json):
{
  "complexity": {
    "time": "O(N) etc",
    "space": "O(1) etc",
    "details": "Complexity explanation"
  },
  "keyInsights": ["Insight 1", "Insight 2"],
  "optimizations": ["Optimization suggestion 1", "Optimization suggestion 2"],
  "suggestedApproach": "Step-by-step optimal algorithm explanation"
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json"
              }
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const responseText = data.candidates[0].content.parts[0].text;
          const parsedReview = JSON.parse(responseText);
          return res.json({ ...parsedReview, isMock: false });
        } else {
          console.warn(`Gemini API returned error status ${geminiRes.status}, fallback to mock review.`);
        }
      } catch (geminiError) {
        console.error('Gemini API query failed, falling back to mock:', geminiError.message);
      }
    }

    // Default Fallback
    const mockReview = generateMockAIReview(problem);
    res.json(mockReview);

  } catch (error) {
    console.error('AI Review Endpoint Error:', error.message);
    res.status(500).json({ message: 'Server error generating AI review' });
  }
};
