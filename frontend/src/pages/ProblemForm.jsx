import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import api from '../utils/api.js';
import { VALID_TOPICS, VALID_COMPANIES } from '../../../backend/models/Problem.js';
import { 
  Save, ArrowLeft, Loader2, Sparkles, Plus, Check, 
  Play, Pause, Clock, Bot, RotateCcw, AlertTriangle, ArrowRight 
} from 'lucide-react';

export default function ProblemForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { showToast } = useToast();
  const isEditMode = !!id;

  // Form states
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('LeetCode');
  const [customPlatform, setCustomPlatform] = useState('');
  const [problemLink, setProblemLink] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [topic, setTopic] = useState('Arrays');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [status, setStatus] = useState('Solved');
  const [notes, setNotes] = useState('');
  const [approach, setApproach] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [solvedDate, setSolvedDate] = useState(new Date().toISOString().split('T')[0]);
  const [revisionSchedule, setRevisionSchedule] = useState('tomorrow');
  
  // New extended fields states
  const [timeToSolve, setTimeToSolve] = useState(0); // in minutes
  const [code, setCode] = useState('');
  const [aiReview, setAiReview] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Stopwatch state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Fetch problem details if in Edit Mode
  useEffect(() => {
    if (isEditMode) {
      const fetchProblemDetails = async () => {
        setFetching(true);
        try {
          const { data } = await api.get(`/problems/${id}`);
          setTitle(data.title);
          
          const platforms = ['LeetCode', 'GeeksforGeeks', 'HackerRank', 'Codeforces', 'CodeChef'];
          if (platforms.includes(data.platform)) {
            setPlatform(data.platform);
          } else {
            setPlatform('Custom');
            setCustomPlatform(data.platform);
          }
          
          setProblemLink(data.problemLink || '');
          setDifficulty(data.difficulty);
          setTopic(data.topic);
          setSelectedCompanies(data.companies || []);
          setStatus(data.status);
          setNotes(data.notes || '');
          setApproach(data.approach || '');
          setMistakes(data.mistakes || '');
          setTimeToSolve(data.timeToSolve || 0);
          setTimerSeconds((data.timeToSolve || 0) * 60);
          setCode(data.code || '');
          
          if (data.solvedDate) {
            setSolvedDate(new Date(data.solvedDate).toISOString().split('T')[0]);
          }
        } catch (error) {
          console.error(error);
          showToast('Failed to load problem details.', 'error');
          navigate('/problems');
        } finally {
          setFetching(false);
        }
      };

      fetchProblemDetails();
    }
  }, [id, isEditMode, navigate, showToast]);

  // Load pre-populated location state if logging curated list item
  useEffect(() => {
    if (!isEditMode && location.state) {
      const { title, platform, problemLink, difficulty, topic, status } = location.state;
      if (title) setTitle(title);
      if (platform) setPlatform(platform);
      if (problemLink) setProblemLink(problemLink);
      if (difficulty) setDifficulty(difficulty);
      if (topic) setTopic(topic);
      if (status) setStatus(status);
      showToast(`Synced checklist parameters for "${title}"`, 'info');
    }
  }, [location, isEditMode, showToast]);

  // Stopwatch ticking hook
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          const next = prev + 1;
          // Dynamically set minutes ceil
          setTimeToSolve(Math.ceil(next / 60));
          return next;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleStartPauseTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setTimeToSolve(0);
  };

  const formatTimerDisplay = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCompanyToggle = (company) => {
    setSelectedCompanies((prev) =>
      prev.includes(company)
        ? prev.filter((c) => c !== company)
        : [...prev, company]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Problem name/title is required.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const finalPlatform = platform === 'Custom' ? customPlatform || 'Custom' : platform;

      const payload = {
        title,
        platform: finalPlatform,
        problemLink,
        difficulty,
        topic,
        companies: selectedCompanies,
        status,
        notes,
        approach,
        mistakes,
        timeToSolve: parseInt(timeToSolve, 10) || 0,
        code,
      };

      if (status === 'Solved') {
        payload.solvedDate = solvedDate;
      } else if (status === 'Revision Required') {
        payload.revisionSchedule = revisionSchedule;
      }

      if (isEditMode) {
        await api.put(`/problems/${id}`, payload);
        showToast('Problem updated successfully!', 'success');
      } else {
        await api.post('/problems', payload);
        showToast('Problem logged successfully!', 'success');
      }
      
      navigate('/problems');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to save problem';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Request AI Code Review from API
  const handleRequestAIReview = async () => {
    if (!isEditMode) return;
    
    setAiLoading(true);
    setAiReview(null);
    try {
      const { data } = await api.post(`/problems/${id}/ai-review`);
      setAiReview(data);
      showToast(
        data.isMock
          ? 'Local evaluation completed (API Key missing).'
          : 'AI Code review completed successfully!',
        'success'
      );
    } catch (error) {
      console.error(error);
      showToast('AI analysis query failed.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
        <Loader2 className="animate-spin text-brand-500 w-8 h-8 mb-2" />
        <span className="text-sm text-slate-500">Loading problem journal record...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Header Back controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/problems')}
          className="p-2 border border-slate-200 dark:border-slate-855 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-655 dark:text-slate-400 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="text-left">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {isEditMode ? 'Edit Solution Details' : 'Log New Solution'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isEditMode ? 'Update notes, mistakes, status, and revision intervals.' : 'Track a new DSA problem and document your mental maps.'}
          </p>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-6 rounded-2xl glass-panel shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        
        {/* Title Name */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Problem Name / Title *</label>
          <input
            type="text"
            required
            className="w-full bg-slate-50 dark:bg-slate-955/80 border border-slate-200 dark:border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
            placeholder="e.g. Reverse Linked List, 3Sum, edit sequence"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Platform Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Coding Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl py-3 px-4 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 transition-colors"
          >
            <option value="LeetCode">LeetCode</option>
            <option value="GeeksforGeeks">GeeksforGeeks</option>
            <option value="HackerRank">HackerRank</option>
            <option value="Codeforces">Codeforces</option>
            <option value="CodeChef">CodeChef</option>
            <option value="Custom">Custom / Other</option>
          </select>
        </div>

        {/* Custom platform input fallback */}
        {platform === 'Custom' ? (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Platform Name</label>
            <input
              type="text"
              required
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-450 focus:outline-none focus:border-brand-500"
              placeholder="e.g. InterviewBit, LintCode"
              value={customPlatform}
              onChange={(e) => setCustomPlatform(e.target.value)}
              disabled={loading}
            />
          </div>
        ) : (
          /* Stopwatch component placement to keep grid balanced */
          <div className="space-y-1.5 flex flex-col justify-end">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl p-2 h-[46px] select-none">
              <div className="flex items-center gap-2 pl-2">
                <Clock className="w-4 h-4 text-brand-500" />
                <span className="font-mono text-sm font-extrabold text-slate-800 dark:text-white">
                  {formatTimerDisplay(timerSeconds)}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={handleStartPauseTimer}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isTimerRunning 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20' 
                      : 'bg-brand-500/10 border-brand-500/30 text-brand-500 hover:bg-brand-500/20'
                  }`}
                >
                  {isTimerRunning ? <Pause size={12} /> : <Play size={12} />}
                </button>
                <button
                  type="button"
                  onClick={handleResetTimer}
                  className="p-1.5 border border-slate-200 dark:border-slate-800 hover:border-rose-500/20 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all"
                  title="Reset Timer"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Problem Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Problem Link URL</label>
          <input
            type="url"
            className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:border-brand-500"
            placeholder="https://leetcode.com/problems/..."
            value={problemLink}
            onChange={(e) => setProblemLink(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Time Entry Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time to Solve (Minutes)</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
              value={timeToSolve}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 0;
                setTimeToSolve(val);
                setTimerSeconds(val * 60);
              }}
              disabled={loading}
            />
            <span className="absolute right-4 top-3 text-xs text-slate-400 font-semibold">min</span>
          </div>
        </div>

        {/* Difficulty Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Difficulty Level</label>
          <div className="grid grid-cols-3 gap-2">
            {['Easy', 'Medium', 'Hard'].map((diff) => {
              const active = difficulty === diff;
              let activeColor = 'border-emerald-500 text-emerald-600 bg-emerald-500/10 dark:text-emerald-450';
              if (diff === 'Medium') activeColor = 'border-amber-500 text-amber-600 bg-amber-500/10 dark:text-amber-450';
              if (diff === 'Hard') activeColor = 'border-rose-500 text-rose-600 bg-rose-500/10 dark:text-rose-450';

              return (
                <button
                  type="button"
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 px-3 border rounded-xl font-bold text-xs transition-all ${
                    active 
                      ? activeColor 
                      : 'border-slate-250 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900/60 text-slate-600 dark:text-slate-400 bg-transparent'
                  }`}
                >
                  {diff}
                </button>
              );
            })}
          </div>
        </div>

        {/* DSA Topic Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">DSA Topic</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 transition-colors"
          >
            {VALID_TOPICS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Solve Status Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Solving Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 transition-colors"
          >
            <option value="Solved">Solved</option>
            <option value="Revision Required">Revision Required</option>
            <option value="Attempted">Attempted</option>
            <option value="Unsolved">Unsolved</option>
          </select>
        </div>

        {/* Conditional Field: Solved Date */}
        {status === 'Solved' ? (
          <div className="space-y-1.5 animate-slide-in">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Solved Date</label>
            <input
              type="date"
              required
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
              value={solvedDate}
              onChange={(e) => setSolvedDate(e.target.value)}
              disabled={loading}
            />
          </div>
        ) : status === 'Revision Required' ? (
          /* Conditional Field: Revision Schedule Spaced Repetition */
          <div className="space-y-1.5 animate-slide-in">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Spaced Repetition Schedule</label>
            <select
              value={revisionSchedule}
              onChange={(e) => setRevisionSchedule(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-3 px-4 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="tomorrow">Tomorrow (1 day)</option>
              <option value="3days">After 3 Days</option>
              <option value="7days">After 7 Days</option>
              <option value="30days">After 30 Days</option>
            </select>
          </div>
        ) : null}

        {/* Company Tags Pill toggling list */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Company Tags</label>
          <div className="flex flex-wrap gap-2 pt-1">
            {VALID_COMPANIES.map((comp) => {
              const selected = selectedCompanies.includes(comp);
              return (
                <button
                  type="button"
                  key={comp}
                  onClick={() => handleCompanyToggle(comp)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${
                    selected
                      ? 'bg-brand-500/10 border-brand-500/40 text-brand-600 dark:text-brand-400'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-955/80 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-450'
                  }`}
                >
                  {selected && <Check size={12} />}
                  <span>{comp}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pasted Solution Code block */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Solution Code</label>
          <textarea
            rows={8}
            className="w-full bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-xs text-brand-300 focus:outline-none focus:border-brand-500 transition-colors leading-relaxed"
            placeholder="// Paste your correct/attempted code solution here to let AI evaluation reviews suggest optimizations..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Detailed Notes */}
        <div className="md:col-span-2 space-y-1.5 pt-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Concept Notes</label>
          <textarea
            rows={3}
            className="w-full bg-slate-50 dark:bg-slate-955/80 border border-slate-200 dark:border-slate-855 rounded-xl py-3 px-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:border-brand-500 transition-colors"
            placeholder="Document runtime complexities, data structures utilized, edge cases, and quick syntax definitions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Mental Approach */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Logical Approach</label>
          <textarea
            rows={4}
            className="w-full bg-slate-50 dark:bg-slate-955/80 border border-slate-200 dark:border-slate-855 rounded-xl py-3 px-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-655 focus:outline-none focus:border-brand-500 transition-colors"
            placeholder="Map out the algorithms and key logic blocks. (e.g. 1. Initialize two pointers. 2. Traverse until duplicate...)"
            value={approach}
            onChange={(e) => setApproach(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Mistakes & Pitfalls */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Common Mistakes / Pitfalls</label>
          <textarea
            rows={4}
            className="w-full bg-slate-50 dark:bg-slate-955/80 border border-slate-200 dark:border-slate-855 rounded-xl py-3 px-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-655 focus:outline-none focus:border-brand-500 transition-colors"
            placeholder="Document what went wrong, bugs faced, index boundaries missed, or space overflow errors..."
            value={mistakes}
            onChange={(e) => setMistakes(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Submit triggers */}
        <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
          <button
            type="button"
            onClick={() => navigate('/problems')}
            className="px-5 py-3 border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-55 dark:bg-slate-950/80 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md shadow-brand-500/10 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving details...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>{isEditMode ? 'Update Problem' : 'Log Problem'}</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* AI Review Evaluation Panel - edit mode only */}
      {isEditMode && (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-6 rounded-2xl glass-panel shadow-sm space-y-6 text-left animate-slide-in">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-850/60 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                  AI Code Coach
                </h3>
                <p className="text-[10px] text-slate-450 mt-0.5">Automated FAANG-level complexity analysis and optimization evaluator.</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleRequestAIReview}
              disabled={aiLoading}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-100 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="text-yellow-500" />}
              <span>{aiLoading ? 'Evaluating Solution...' : 'Evaluate Solution Code'}</span>
            </button>
          </div>

          {/* Evaluation Results Rendering */}
          {aiLoading ? (
            <div className="py-8 text-center space-y-3 animate-pulse">
              <Loader2 className="animate-spin text-brand-500 w-7 h-7 mx-auto" />
              <div className="space-y-1.5 max-w-xs mx-auto">
                <div className="h-4 bg-slate-800 rounded"></div>
                <div className="h-3.5 bg-slate-850 rounded w-[80%] mx-auto"></div>
              </div>
            </div>
          ) : aiReview ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-in">
              {/* Complexities and Insights */}
              <div className="md:col-span-1 space-y-4">
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-200/50 dark:border-slate-850 rounded-xl space-y-3.5">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Time Complexity</span>
                    <span className="text-lg font-black text-brand-600 dark:text-brand-400 mt-0.5 block font-mono">{aiReview.complexity.time}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Space Complexity</span>
                    <span className="text-lg font-black text-brand-600 dark:text-brand-400 mt-0.5 block font-mono">{aiReview.complexity.space}</span>
                  </div>
                  <div className="border-t border-slate-200/50 dark:border-slate-850/60 pt-3">
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">{aiReview.complexity.details}</p>
                  </div>
                </div>

                {/* Star Warning for fallback */}
                {aiReview.isMock && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-3 rounded-xl flex items-start gap-2 text-[10px]">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>Using local evaluation fallback. Enter a <strong>GEMINI_API_KEY</strong> in your .env file for custom LLM reviews.</span>
                  </div>
                )}
              </div>

              {/* Insights and Optimizations */}
              <div className="md:col-span-2 space-y-5">
                {/* Insights list */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Code Evaluation Insights</span>
                  <div className="space-y-2">
                    {aiReview.keyInsights.map((ins, i) => (
                      <div key={i} className="flex gap-2 text-xs leading-relaxed text-slate-655 dark:text-slate-350 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/40 dark:border-slate-900/60">
                        <span className="text-brand-500 font-bold">•</span>
                        <span>{ins}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optimizations list */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Proposed Optimizations</span>
                  <div className="space-y-2">
                    {aiReview.optimizations.map((opt, i) => (
                      <div key={i} className="flex gap-2 text-xs leading-relaxed text-slate-655 dark:text-slate-350 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/40 dark:border-slate-900/60">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Approach */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-850/60">
                  <span className="text-[9px] font-bold text-slate-455 uppercase tracking-widest block">Coach Recommended Approach</span>
                  <pre className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/40 dark:border-slate-900/60 font-sans text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {aiReview.suggestedApproach}
                  </pre>
                </div>
              </div>

            </div>
          ) : (
            <div className="border border-dashed border-slate-200 dark:border-slate-850 rounded-xl p-8 text-center text-xs text-slate-500 italic">
              Click the button in the upper right to run automated FAANG evaluations on your solution code and notes.
            </div>
          )}

        </div>
      )}

    </div>
  );
}
