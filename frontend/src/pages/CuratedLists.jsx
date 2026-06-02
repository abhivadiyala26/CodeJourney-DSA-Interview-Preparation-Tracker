import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import api from '../utils/api.js';
import { 
  Sparkles, CheckCircle2, Circle, ExternalLink, Plus, BookOpen, 
  Search, Award, Layers, Loader2, ChevronRight 
} from 'lucide-react';

// Blind 75 problem list definition
const BLIND_75 = [
  { title: 'Two Sum', topic: 'Arrays', difficulty: 'Easy', link: 'https://leetcode.com/problems/two-sum/' },
  { title: 'Best Time to Buy and Sell Stock', topic: 'Sliding Window', difficulty: 'Easy', link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
  { title: 'Contains Duplicate', topic: 'Arrays', difficulty: 'Easy', link: 'https://leetcode.com/problems/contains-duplicate/' },
  { title: 'Product of Array Except Self', topic: 'Arrays', difficulty: 'Medium', link: 'https://leetcode.com/problems/product-of-array-except-self/' },
  { title: 'Maximum Subarray', topic: 'Arrays', difficulty: 'Medium', link: 'https://leetcode.com/problems/maximum-subarray/' },
  { title: '3Sum', topic: 'Two Pointers', difficulty: 'Medium', link: 'https://leetcode.com/problems/3sum/' },
  { title: 'Container With Most Water', topic: 'Two Pointers', difficulty: 'Medium', link: 'https://leetcode.com/problems/container-with-most-water/' },
  
  { title: 'Valid Palindrome', topic: 'Strings', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-palindrome/' },
  { title: 'Longest Substring Without Repeating Characters', topic: 'Sliding Window', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
  { title: 'Longest Repeating Character Replacement', topic: 'Sliding Window', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-repeating-character-replacement/' },
  { title: 'Minimum Window Substring', topic: 'Sliding Window', difficulty: 'Hard', link: 'https://leetcode.com/problems/minimum-window-substring/' },
  { title: 'Valid Anagram', topic: 'Strings', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-anagram/' },
  
  { title: 'Valid Parentheses', topic: 'Stack', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-parentheses/' },
  
  { title: 'Reverse Linked List', topic: 'Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/reverse-linked-list/' },
  { title: 'Linked List Cycle', topic: 'Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/linked-list-cycle/' },
  { title: 'Merge Two Sorted Lists', topic: 'Linked List', difficulty: 'Easy', link: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
  { title: 'Remove Nth Node From End of List', topic: 'Linked List', difficulty: 'Medium', link: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
  { title: 'Reorder List', topic: 'Linked List', difficulty: 'Medium', link: 'https://leetcode.com/problems/reorder-list/' },
  
  { title: 'Invert Binary Tree', topic: 'Trees', difficulty: 'Easy', link: 'https://leetcode.com/problems/invert-binary-tree/' },
  { title: 'Maximum Depth of Binary Tree', topic: 'Trees', difficulty: 'Easy', link: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
  { title: 'Same Tree', topic: 'Trees', difficulty: 'Easy', link: 'https://leetcode.com/problems/same-tree/' },
  { title: 'Subtree of Another Tree', topic: 'Trees', difficulty: 'Easy', link: 'https://leetcode.com/problems/subtree-of-another-tree/' },
  { title: 'Binary Tree Maximum Path Sum', topic: 'Trees', difficulty: 'Hard', link: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/' },
  { title: 'Lowest Common Ancestor of a Binary Search Tree', topic: 'Trees', difficulty: 'Easy', link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/' },
  
  { title: 'Clone Graph', topic: 'Graph', difficulty: 'Medium', link: 'https://leetcode.com/problems/clone-graph/' },
  { title: 'Course Schedule', topic: 'Graph', difficulty: 'Medium', link: 'https://leetcode.com/problems/course-schedule/' },
  { title: 'Number of Islands', topic: 'Graph', difficulty: 'Medium', link: 'https://leetcode.com/problems/number-of-islands/' },
  
  { title: 'Climbing Stairs', topic: 'DP', difficulty: 'Easy', link: 'https://leetcode.com/problems/climbing-stairs/' },
  { title: 'Coin Change', topic: 'DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/coin-change/' },
  { title: 'Longest Increasing Subsequence', topic: 'DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
  { title: 'House Robber', topic: 'DP', difficulty: 'Medium', link: 'https://leetcode.com/problems/house-robber/' },
];

// NeetCode 150 additionals
const NEETCODE_150 = [
  ...BLIND_75,
  { title: 'Group Anagrams', topic: 'Strings', difficulty: 'Medium', link: 'https://leetcode.com/problems/group-anagrams/' },
  { title: 'Top K Frequent Elements', topic: 'Arrays', difficulty: 'Medium', link: 'https://leetcode.com/problems/top-k-frequent-elements/' },
  { title: 'Valid Sudoku', topic: 'Arrays', difficulty: 'Medium', link: 'https://leetcode.com/problems/valid-sudoku/' },
  { title: 'Longest Consecutive Sequence', topic: 'Arrays', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-consecutive-sequence/' },
  { title: 'Two Sum II - Input Array Is Sorted', topic: 'Two Pointers', difficulty: 'Medium', link: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
  { title: 'Trapping Rain Water', topic: 'Two Pointers', difficulty: 'Hard', link: 'https://leetcode.com/problems/trapping-rain-water/' },
  { title: 'Min Stack', topic: 'Stack', difficulty: 'Medium', link: 'https://leetcode.com/problems/min-stack/' },
  { title: 'Generate Parentheses', topic: 'Stack', difficulty: 'Medium', link: 'https://leetcode.com/problems/generate-parentheses/' },
  { title: 'Daily Temperatures', topic: 'Stack', difficulty: 'Medium', link: 'https://leetcode.com/problems/daily-temperatures/' },
  { title: 'Car Fleet', topic: 'Stack', difficulty: 'Medium', link: 'https://leetcode.com/problems/car-fleet/' },
  { title: 'Largest Rectangle in Histogram', topic: 'Stack', difficulty: 'Hard', link: 'https://leetcode.com/problems/largest-rectangle-in-histogram/' },
  { title: 'Search a 2D Matrix', topic: 'Binary Search', difficulty: 'Medium', link: 'https://leetcode.com/problems/search-a-2d-matrix/' },
  { title: 'Koko Eating Bananas', topic: 'Binary Search', difficulty: 'Medium', link: 'https://leetcode.com/problems/koko-eating-bananas/' },
  { title: 'Search in Rotated Sorted Array', topic: 'Binary Search', difficulty: 'Medium', link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
  { title: 'Find Minimum in Rotated Sorted Array', topic: 'Binary Search', difficulty: 'Medium', link: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
  { title: 'Word Search', topic: 'Backtracking', difficulty: 'Medium', link: 'https://leetcode.com/problems/word-search/' },
  { title: 'K Closest Points to Origin', topic: 'Heap', difficulty: 'Medium', link: 'https://leetcode.com/problems/k-closest-points-to-origin/' },
  { title: 'Kth Largest Element in an Array', topic: 'Heap', difficulty: 'Medium', link: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
  { title: 'Number of 1 Bits', topic: 'Bit Manipulation', difficulty: 'Easy', link: 'https://leetcode.com/problems/number-of-1-bits/' },
  { title: 'Jump Game', topic: 'Greedy', difficulty: 'Medium', link: 'https://leetcode.com/problems/jump-game/' },
];

export default function CuratedLists() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('blind75'); // 'blind75' or 'neetcode150'
  const [solvedTitles, setSolvedTitles] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all solved problems to cross check title checklists
  useEffect(() => {
    const fetchSolvedProblems = async () => {
      try {
        const { data } = await api.get('/problems', {
          params: { limit: 1000, status: 'Solved' },
        });
        const titles = new Set(data.problems.map((p) => p.title.trim().toLowerCase()));
        setSolvedTitles(titles);
      } catch (error) {
        console.error(error);
        showToast('Error syncing checklist progress.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSolvedProblems();
  }, [showToast]);

  const currentQuestionsList = activeTab === 'blind75' ? BLIND_75 : NEETCODE_150;

  // Filter questions based on search
  const filteredQuestions = currentQuestionsList.filter(
    (q) =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered questions by topic
  const groupedQuestions = filteredQuestions.reduce((acc, q) => {
    if (!acc[q.topic]) acc[q.topic] = [];
    acc[q.topic].push(q);
    return acc;
  }, {});

  // Compute progress numbers
  const totalCount = currentQuestionsList.length;
  const solvedCount = currentQuestionsList.filter((q) =>
    solvedTitles.has(q.title.trim().toLowerCase())
  ).length;
  const progressPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  // Quick Action: Pre-populate problem log
  const handleQuickLog = (q) => {
    navigate('/problems/new', {
      state: {
        title: q.title,
        platform: 'LeetCode',
        problemLink: q.link,
        difficulty: q.difficulty,
        topic: q.topic,
        status: 'Solved',
      },
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-brand-500 w-8 h-8 mb-2" />
        <span className="text-sm text-slate-500">Syncing sheets with journal database...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-200 text-left">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Curated Study Sheets <Sparkles className="text-brand-500 w-6 h-6" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track industry-standard DSA sheets. Solved problems in your journal check off automatically.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-1 rounded-xl shadow-sm w-full md:w-auto">
          <button
            onClick={() => setActiveTab('blind75')}
            className={`flex-1 md:flex-none text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'blind75'
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-950'
            }`}
          >
            Blind 75 ({BLIND_75.filter(q => solvedTitles.has(q.title.trim().toLowerCase())).length}/75)
          </button>
          <button
            onClick={() => setActiveTab('neetcode150')}
            className={`flex-1 md:flex-none text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'neetcode150'
                ? 'bg-brand-600 text-white'
                : 'text-slate-600 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-950'
            }`}
          >
            NeetCode 150 ({NEETCODE_150.filter(q => solvedTitles.has(q.title.trim().toLowerCase())).length}/150)
          </button>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Progress Tracker Card */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-5 rounded-2xl glass-panel shadow-sm flex items-center gap-6">
          <div className="relative shrink-0 w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-slate-100 dark:stroke-slate-800 fill-transparent"
                strokeWidth="6"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-brand-500 fill-transparent transition-all duration-500"
                strokeWidth="6"
                strokeDasharray={213.6}
                strokeDashoffset={213.6 - (213.6 * progressPercent) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-black text-slate-800 dark:text-white">{progressPercent}%</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-200">
              {activeTab === 'blind75' ? 'Blind 75 Checklist' : 'NeetCode 150 Syllabus'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-450 max-w-sm">
              You have completed <strong>{solvedCount}</strong> out of <strong>{totalCount}</strong> standard problems. Syncs automatically.
            </p>
          </div>
        </div>

        {/* Search list card */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-5 rounded-2xl glass-panel shadow-sm h-full flex flex-col justify-center">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Search Syllabus</label>
          <div className="relative">
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
              placeholder="Search e.g. Valid Anagram, Sliding Window..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          </div>
        </div>
      </div>

      {/* Topics list layout */}
      {Object.keys(groupedQuestions).length === 0 ? (
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
          <p className="text-sm text-slate-500">No questions found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {Object.keys(groupedQuestions).map((topicName) => {
            const list = groupedQuestions[topicName];
            const solvedInTopic = list.filter((q) => solvedTitles.has(q.title.trim().toLowerCase())).length;
            const topicProgress = Math.round((solvedInTopic / list.length) * 100);

            return (
              <div key={topicName} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-5 rounded-2xl glass-panel shadow-sm space-y-4">
                
                {/* Topic Title bar */}
                <div className="flex justify-between items-baseline border-b border-slate-100 dark:border-slate-850 pb-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-850 dark:text-slate-250">{topicName}</h3>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {solvedInTopic} of {list.length} solved ({topicProgress}%)
                    </span>
                  </div>
                  <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${topicProgress}%` }}></div>
                  </div>
                </div>

                {/* Questions Grid items */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {list.map((q) => {
                    const isSolved = solvedTitles.has(q.title.trim().toLowerCase());
                    return (
                      <div 
                        key={q.title} 
                        className={`flex items-center justify-between p-3 border rounded-xl hover:border-slate-200 dark:hover:border-slate-800 transition-all ${
                          isSolved 
                            ? 'bg-emerald-500/5 border-emerald-500/10 dark:border-emerald-500/10' 
                            : 'bg-slate-50/50 border-slate-200 dark:bg-slate-950/20 dark:border-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 max-w-[70%]">
                          {isSolved ? (
                            <CheckCircle2 className="text-emerald-500 w-4 h-4 shrink-0" />
                          ) : (
                            <Circle className="text-slate-350 dark:text-slate-700 w-4 h-4 shrink-0" />
                          )}
                          <div className="flex flex-col leading-tight truncate">
                            <span className={`text-xs font-semibold truncate ${isSolved ? 'text-slate-655 line-through decoration-slate-400' : 'text-slate-800 dark:text-slate-250'}`}>
                              {q.title}
                            </span>
                            <a
                              href={q.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-slate-400 dark:text-slate-500 hover:text-brand-500 flex items-center gap-0.5 mt-0.5 font-semibold w-fit"
                            >
                              <span>LeetCode Link</span> <ExternalLink size={8} />
                            </a>
                          </div>
                        </div>

                        {/* Badges/Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            q.difficulty === 'Easy' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                              : q.difficulty === 'Medium' 
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-455'
                          }`}>
                            {q.difficulty}
                          </span>

                          {!isSolved && (
                            <button
                              onClick={() => handleQuickLog(q)}
                              className="p-1 border border-slate-200 dark:border-slate-800 hover:border-brand-500/40 rounded-lg hover:bg-white dark:hover:bg-slate-900 text-slate-400 hover:text-brand-500 transition-colors"
                              title="Pre-populate log solution"
                            >
                              <Plus size={10} />
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
