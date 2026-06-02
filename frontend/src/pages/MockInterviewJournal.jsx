import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import api from '../utils/api.js';
import { 
  ShieldCheck, Plus, Trash2, Calendar, Star, MessageSquare, 
  Code2, Loader2, ArrowLeft, ChevronDown, Check, Search, AlertCircle 
} from 'lucide-react';

// Star Rating Component
function StarSelector({ label, rating, setRating, disabled }) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((val) => {
          const active = val <= rating;
          return (
            <button
              type="button"
              key={val}
              disabled={disabled}
              onClick={() => setRating(val)}
              className={`text-xl transition-all ${
                disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
              } ${active ? 'text-amber-500' : 'text-slate-250 dark:text-slate-800'}`}
            >
              ★
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MockInterviewJournal() {
  const { showToast } = useToast();
  const [mocks, setMocks] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form fields
  const [interviewerName, setInterviewerName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [feedback, setFeedback] = useState('');
  const [ratingCommunication, setRatingCommunication] = useState(3);
  const [ratingProblemSolving, setRatingProblemSolving] = useState(3);
  const [ratingCoding, setRatingCoding] = useState(3);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [problemSearch, setProblemSearch] = useState('');

  // Fetch mock logs and solved problems
  const fetchMockData = async () => {
    try {
      const mocksRes = await api.get('/mocks');
      setMocks(mocksRes.data);
      
      const problemsRes = await api.get('/problems', {
        params: { limit: 1000, status: 'Solved' },
      });
      setSolvedProblems(problemsRes.data.problems);
    } catch (error) {
      console.error(error);
      showToast('Error retrieving mock interview logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMockData();
  }, []);

  const handleProblemToggle = (id) => {
    setSelectedProblems((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSaveMock = async (e) => {
    e.preventDefault();
    if (!interviewerName.trim()) {
      showToast('Interviewer name or platform is required.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        interviewerName,
        date,
        feedback,
        ratingCommunication,
        ratingProblemSolving,
        ratingCoding,
        problemsSolved: selectedProblems,
      };

      const { data } = await api.post('/mocks', payload);
      showToast('Mock interview feedback logged!', 'success');
      setMocks((prev) => [data, ...prev]);
      
      // Reset form
      setInterviewerName('');
      setDate(new Date().toISOString().split('T')[0]);
      setFeedback('');
      setRatingCommunication(3);
      setRatingProblemSolving(3);
      setRatingCoding(3);
      setSelectedProblems([]);
      setShowAddForm(false);
    } catch (error) {
      console.error(error);
      showToast('Failed to save mock interview feedback.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMock = async (id, name) => {
    if (window.confirm(`Delete mock log with "${name}"?`)) {
      try {
        await api.delete(`/mocks/${id}`);
        showToast('Mock interview entry deleted.', 'success');
        setMocks((prev) => prev.filter((m) => m._id !== id));
      } catch (error) {
        console.error(error);
        showToast('Failed to delete mock log.', 'error');
      }
    }
  };

  // Calculations for averages
  const calculateAverages = () => {
    if (mocks.length === 0) return { comm: 0, solve: 0, code: 0, overall: 0 };
    let totalComm = 0, totalSolve = 0, totalCode = 0;
    mocks.forEach((m) => {
      totalComm += m.ratingCommunication;
      totalSolve += m.ratingProblemSolving;
      totalCode += m.ratingCoding;
    });
    const comm = (totalComm / mocks.length).toFixed(1);
    const solve = (totalSolve / mocks.length).toFixed(1);
    const code = (totalCode / mocks.length).toFixed(1);
    const overall = ((totalComm + totalSolve + totalCode) / (mocks.length * 3)).toFixed(1);
    return { comm, solve, code, overall };
  };

  const averages = calculateAverages();

  // Filter solved problems in selection box
  const filteredProblemsToSelect = solvedProblems.filter((p) =>
    p.title.toLowerCase().includes(problemSearch.toLowerCase())
  );

  const renderStarsRating = (rating) => {
    return (
      <div className="flex text-amber-500 select-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="text-sm">{i < rating ? '★' : '☆'}</span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-brand-500 w-8 h-8 mb-2" />
        <span className="text-sm text-slate-500">Loading interview journal records...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-200 text-left">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Mock Interviews <ShieldCheck className="text-brand-500 w-6 h-6" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log feedback, track peer evaluation ratings, and link problems solved under time constraints.
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
          >
            <Plus size={16} />
            <span>Log Interview Session</span>
          </button>
        )}
      </div>

      {/* Workspace Display (Forms or Averages + Logs Grid) */}
      {showAddForm ? (
        /* Log Form Panel */
        <form onSubmit={handleSaveMock} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-6 rounded-2xl glass-panel shadow-sm space-y-6 animate-slide-in">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1.5 border border-slate-200 dark:border-slate-850 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-450 transition-colors"
            >
              <ArrowLeft size={14} />
            </button>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Log Interview Feedback</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Interviewer */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Interviewer Name / Platform *</label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                placeholder="e.g. Pramp, Alex (Google Senior SWE)"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                disabled={saving}
              />
            </div>
            {/* Date */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Session Date</label>
              <input
                type="date"
                required
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl py-3 px-4 text-xs text-slate-855 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {/* Stars Selectors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-slate-100 dark:border-slate-850/60 py-4">
            <StarSelector
              label="Communication Rating"
              rating={ratingCommunication}
              setRating={setRatingCommunication}
              disabled={saving}
            />
            <StarSelector
              label="Problem Solving Rating"
              rating={ratingProblemSolving}
              setRating={setRatingProblemSolving}
              disabled={saving}
            />
            <StarSelector
              label="Coding Speed & Cleanliness"
              rating={ratingCoding}
              setRating={setRatingCoding}
              disabled={saving}
            />
          </div>

          {/* Linking Solved Problems checklist area */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Link Problems Solved</label>
            <p className="text-[10px] text-slate-450">Search and check off problems from your Solved journal list completed during this session.</p>
            
            <div className="border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 bg-slate-50 dark:bg-slate-950/40 space-y-3.5">
              <div className="relative max-w-sm">
                <input
                  type="text"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:outline-none"
                  placeholder="Search solved problems..."
                  value={problemSearch}
                  onChange={(e) => setProblemSearch(e.target.value)}
                />
                <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
              </div>

              <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1">
                {filteredProblemsToSelect.length === 0 ? (
                  <span className="text-[10px] text-slate-500 italic">No solved problems match search.</span>
                ) : (
                  filteredProblemsToSelect.map((p) => {
                    const active = selectedProblems.includes(p._id);
                    return (
                      <button
                        type="button"
                        key={p._id}
                        onClick={() => handleProblemToggle(p._id)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold border flex items-center gap-1 transition-all ${
                          active
                            ? 'bg-brand-500/10 border-brand-500/35 text-brand-600 dark:text-brand-400 font-extrabold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-450'
                        }`}
                      >
                        {active && <Check size={10} />}
                        <span>{p.title}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Feedback notes */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Session Feedback & Comments</label>
            <textarea
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-250 placeholder-slate-400 focus:outline-none focus:border-brand-500"
              placeholder="Paste reviews received. Highlight what went well (e.g. good dry runs) and areas to improve (e.g. ask clarifying questions first)..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={saving}
            />
          </div>

          {/* Save/Cancel triggers */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-950/80 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-405"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : null}
              <span>Save Log</span>
            </button>
          </div>

        </form>
      ) : (
        /* Dashboard Averages + Logs Grid View */
        <div className="space-y-8 text-left">
          
          {/* Cumulative Averages display banner */}
          {mocks.length > 0 && (
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-5 rounded-2xl glass-panel shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-center items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Overall Score</span>
                <span className="text-2xl font-black text-brand-600 dark:text-brand-450 mt-1 block">{averages.overall} <span className="text-xs font-normal text-slate-400">/ 5</span></span>
              </div>
              <div className="border-t border-slate-100 md:border-t-0 md:border-l dark:border-slate-850 pt-3 md:pt-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Communication</span>
                <span className="text-lg font-extrabold text-slate-800 dark:text-slate-200 mt-1 block">{averages.comm} <span className="text-xs font-normal text-slate-550">★</span></span>
              </div>
              <div className="border-t border-slate-100 md:border-t-0 md:border-l dark:border-slate-850 pt-3 md:pt-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Problem Solving</span>
                <span className="text-lg font-extrabold text-slate-800 dark:text-slate-200 mt-1 block">{averages.solve} <span className="text-xs font-normal text-slate-550">★</span></span>
              </div>
              <div className="border-t border-slate-100 md:border-t-0 md:border-l dark:border-slate-850 pt-3 md:pt-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Coding Speed</span>
                <span className="text-lg font-extrabold text-slate-800 dark:text-slate-200 mt-1 block">{averages.code} <span className="text-xs font-normal text-slate-550">★</span></span>
              </div>
            </div>
          )}

          {/* List display */}
          {mocks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-16 text-center max-w-xl mx-auto space-y-4 shadow-sm glass-panel mt-6">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-850 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                <MessageSquare size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No mock interview feedback found</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xs mx-auto">
                  Keep a logs of mock session comments, performance ratings, and check your progress under pressure.
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-colors"
              >
                Log Your First Session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mocks.map((m) => (
                <div 
                  key={m._id} 
                  className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl glass-panel shadow-sm flex flex-col justify-between hover:border-brand-500/45 transition-all group relative"
                >
                  {/* Delete button top right */}
                  <button
                    onClick={() => handleDeleteMock(m._id, m.interviewerName)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg border border-slate-100 hover:border-rose-500/20 dark:border-slate-850 bg-slate-50 hover:bg-rose-50 dark:bg-slate-950 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete log"
                  >
                    <Trash2 size={12} />
                  </button>

                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] text-slate-450">
                        <Calendar size={12} />
                        <span>{new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-855 dark:text-white truncate max-w-[85%]">{m.interviewerName}</h4>
                    </div>

                    {/* Star scores details */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-900/60">
                      <div>
                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Comm</span>
                        {renderStarsRating(m.ratingCommunication)}
                      </div>
                      <div className="border-l border-slate-200 dark:border-slate-850/60 pl-2">
                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Solving</span>
                        {renderStarsRating(m.ratingProblemSolving)}
                      </div>
                      <div className="border-l border-slate-200 dark:border-slate-850/60 pl-2">
                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Coding</span>
                        {renderStarsRating(m.ratingCoding)}
                      </div>
                    </div>

                    {/* Linked Problems List */}
                    {m.problemsSolved && m.problemsSolved.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          <Code2 size={10} /> <span>Problems Solved</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {m.problemsSolved.map((prob) => (
                            <span key={prob._id} className="bg-slate-100 dark:bg-slate-950 border border-slate-250/60 dark:border-slate-850/80 px-2 py-0.5 rounded-full text-[9px] font-semibold text-slate-655 dark:text-slate-350">
                              {prob.title} ({prob.difficulty})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Feedback Comments */}
                    {m.feedback && (
                      <div className="space-y-1 text-xs border-t border-slate-100 dark:border-slate-850/60 pt-3">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          <MessageSquare size={10} /> <span>Interviewer Feedback</span>
                        </span>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed line-clamp-3 italic">
                          "{m.feedback}"
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
