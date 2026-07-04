import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import api from '../utils/api.js';
import { VALID_TOPICS, VALID_COMPANIES } from '../utils/constants.js';
import { 
  Search, Filter, ArrowUpDown, Plus, Download, Edit2, Trash2, ExternalLink, 
  RotateCcw, SlidersHorizontal, ChevronLeft, ChevronRight, BookOpen, AlertCircle
} from 'lucide-react';

export default function ProblemList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Core problem lists states
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProblems, setTotalProblems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);

  // Filters from url searchParams or defaults
  const search = searchParams.get('search') || '';
  const difficulty = searchParams.get('difficulty') || '';
  const status = searchParams.get('status') || '';
  const platform = searchParams.get('platform') || '';
  const company = searchParams.get('company') || '';
  const topic = searchParams.get('topic') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Local filter inputs to allow typing before submitting, or instant filtering
  const [localSearch, setLocalSearch] = useState(search);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        difficulty,
        status,
        platform,
        company,
        topic,
        sortBy,
        order,
        page,
        limit: 10,
      };
      
      const { data } = await api.get('/problems', { params });
      setProblems(data.problems);
      setTotalPages(data.pages);
      setTotalProblems(data.totalProblems);
    } catch (error) {
      console.error('Failed to retrieve problems:', error);
      showToast('Error loading problems journal.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [search, difficulty, status, platform, company, topic, sortBy, order, page]);

  // Sync local search when URL changes
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Handle URL parameter changes helper
  const updateParam = (key, value, resetPage = true) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (resetPage) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  // Trigger search on submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', localSearch);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setLocalSearch('');
    setSearchParams(new URLSearchParams({ page: '1' }));
  };

  // Delete Problem
  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await api.delete(`/problems/${id}`);
        showToast('Problem removed from journal.', 'success');
        fetchProblems();
      } catch (error) {
        console.error('Delete problem failed:', error);
        showToast('Failed to delete problem.', 'error');
      }
    }
  };

  // Sort toggle helper
  const handleSort = (field) => {
    const isCurrent = sortBy === field;
    const newOrder = isCurrent && order === 'desc' ? 'asc' : 'desc';
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', field);
    newParams.set('order', newOrder);
    setSearchParams(newParams);
  };

  // Client-side Blob compiler to download CSV
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const { data } = await api.get('/problems/export/csv');
      
      if (data.length === 0) {
        showToast('No problems found to export.', 'warning');
        return;
      }

      const headers = [
        'Title', 'Platform', 'Problem Link', 'Difficulty', 'Topic', 
        'Companies', 'Status', 'Notes', 'Approach', 'Mistakes', 
        'Solved Date', 'Revision Date', 'Created At'
      ];

      const csvRows = [headers.join(',')];

      data.forEach((p) => {
        const row = [
          p.title,
          p.platform,
          p.problemLink || '',
          p.difficulty,
          p.topic,
          (p.companies || []).join('; '),
          p.status,
          p.notes || '',
          p.approach || '',
          p.mistakes || '',
          p.solvedDate ? new Date(p.solvedDate).toISOString().split('T')[0] : '',
          p.revisionDate ? new Date(p.revisionDate).toISOString().split('T')[0] : '',
          new Date(p.createdAt).toISOString().split('T')[0]
        ];

        // Format quotes and escape newlines
        const escaped = row.map((val) => {
          const formatted = String(val).replace(/"/g, '""');
          return `"${formatted}"`;
        });

        csvRows.push(escaped.join(','));
      });

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'CodeJourney_DSA_Journal.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('CSV journal downloaded successfully!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to export CSV.', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200">
      
      {/* Title Header area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Problems Journal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage, filter, and schedule revisions for your DSA solutions.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex-1 sm:flex-initial bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
          <button
            onClick={() => navigate('/problems/new')}
            className="flex-1 sm:flex-initial bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-brand-500/10 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
          >
            <Plus size={16} />
            <span>Add Problem</span>
          </button>
        </div>
      </div>

      {/* Searching, Quick Filter, and Toggle Drawer bar */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl glass-panel shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <input
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="Search by title, topics, company tags, or approach..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            {localSearch !== search && (
              <button type="submit" className="absolute right-2 top-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                Apply
              </button>
            )}
          </form>

          {/* Controls toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border flex items-center gap-1.5 transition-all ${
                showFiltersPanel || difficulty || status || platform || company || topic
                  ? 'bg-brand-500/10 border-brand-500/30 text-brand-600 dark:text-brand-400'
                  : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              {(difficulty || status || platform || company || topic) && (
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              )}
            </button>

            {(search || difficulty || status || platform || company || topic) && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                title="Clear all filters"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible filters drawer panel */}
        {(showFiltersPanel || difficulty || status || platform || company || topic) && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-850 grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-left animate-slide-in">
            {/* Difficulty Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => updateParam('difficulty', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Solve Status</label>
              <select
                value={status}
                onChange={(e) => updateParam('status', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500"
              >
                <option value="">All Statuses</option>
                <option value="Solved">Solved</option>
                <option value="Revision Required">Revision Required</option>
                <option value="Attempted">Attempted</option>
                <option value="Unsolved">Unsolved</option>
              </select>
            </div>

            {/* Platform Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Platform</label>
              <select
                value={platform}
                onChange={(e) => updateParam('platform', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500"
              >
                <option value="">All Platforms</option>
                <option value="LeetCode">LeetCode</option>
                <option value="GeeksforGeeks">GeeksforGeeks</option>
                <option value="HackerRank">HackerRank</option>
                <option value="Codeforces">Codeforces</option>
                <option value="CodeChef">CodeChef</option>
                <option value="Custom">Custom / Other</option>
              </select>
            </div>

            {/* Topic Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">DSA Topic</label>
              <select
                value={topic}
                onChange={(e) => updateParam('topic', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500"
              >
                <option value="">All Topics</option>
                {VALID_TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Company Tag Filter */}
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Target Company</label>
              <select
                value={company}
                onChange={(e) => updateParam('company', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500"
              >
                <option value="">All Companies</option>
                {VALID_COMPANIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main problems content (Loading -> Empty state -> Table rendering) */}
      {loading ? (
        <TableSkeleton />
      ) : problems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-16 text-center max-w-lg mx-auto space-y-4 shadow-sm glass-panel">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-850 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto">
            <BookOpen size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No matching problems found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xs mx-auto">
              We couldn't find any items matching your active filter constraints. Try clearing filters or searching for something else.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-brand-500 dark:text-brand-400 hover:underline font-bold text-xs flex items-center justify-center gap-1 mx-auto"
          >
            <RotateCcw size={12} />
            <span>Reset filter settings</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Datatable Wrapper */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden glass-panel shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-850/60 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-900/30">
                    <th className="py-4 px-5 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors" onClick={() => handleSort('title')}>
                      <div className="flex items-center gap-1">
                        <span>Problem Title</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="py-4 px-3 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors" onClick={() => handleSort('platform')}>
                      <div className="flex items-center gap-1">
                        <span>Platform</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="py-4 px-3 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors" onClick={() => handleSort('difficulty')}>
                      <div className="flex items-center gap-1">
                        <span>Difficulty</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="py-4 px-3">DSA Topic</th>
                    <th className="py-4 px-3">Status</th>
                    <th className="py-4 px-3">Target Companies</th>
                    <th className="py-4 px-3 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200" onClick={() => handleSort('solvedDate')}>
                      <div className="flex items-center gap-1">
                        <span>Solved Date</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 text-xs">
                  {problems.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                      {/* Title */}
                      <td className="py-4 px-5 font-bold text-slate-800 dark:text-slate-200 max-w-[200px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="truncate">{p.title}</span>
                          {p.problemLink && (
                            <a
                              href={p.problemLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-brand-500 hover:text-brand-650 dark:text-brand-400 dark:hover:text-brand-350 flex items-center gap-0.5 font-semibold w-fit"
                            >
                              <span>Open link</span> <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Platform */}
                      <td className="py-4 px-3 font-semibold text-slate-600 dark:text-slate-400">{p.platform}</td>

                      {/* Difficulty */}
                      <td className="py-4 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.difficulty === 'Easy'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : p.difficulty === 'Medium'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {p.difficulty}
                        </span>
                      </td>

                      {/* Topic */}
                      <td className="py-4 px-3 font-semibold text-slate-700 dark:text-slate-300">{p.topic}</td>

                      {/* Status */}
                      <td className="py-4 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'Solved'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : p.status === 'Revision Required'
                              ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20'
                              : p.status === 'Attempted'
                              ? 'bg-amber-500/10 text-amber-650 dark:text-amber-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {p.status}
                        </span>
                        {/* Overdue Revision warning inside row */}
                        {p.status === 'Revision Required' && p.revisionDate && new Date(p.revisionDate) < new Date() && (
                          <span className="block text-[9px] text-rose-500 font-bold mt-1">⚠️ Overdue</span>
                        )}
                      </td>

                      {/* Companies tags */}
                      <td className="py-4 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {p.companies && p.companies.length > 0 ? (
                            p.companies.map((c) => (
                              <span key={c} className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 px-1.5 py-0.5 rounded text-[9px] font-semibold text-slate-600 dark:text-slate-450">
                                {c}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 dark:text-slate-650">-</span>
                          )}
                        </div>
                      </td>

                      {/* Solved / Revision Date */}
                      <td className="py-4 px-3 text-slate-500 dark:text-slate-450 font-medium">
                        {p.status === 'Solved' && p.solvedDate ? (
                          new Date(p.solvedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                        ) : p.status === 'Revision Required' && p.revisionDate ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-slate-400">Revise on:</span>
                            <span className="font-semibold text-brand-500 dark:text-brand-400">
                              {new Date(p.revisionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        ) : (
                          <span className="italic text-slate-400">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right font-medium">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => navigate(`/problems/${p._id}/edit`)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 rounded-lg transition-colors"
                            title="Edit solution details"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id, p.title)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/20 dark:hover:bg-rose-955/35 text-rose-600 dark:text-rose-400 rounded-lg transition-colors"
                            title="Delete problem"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Row */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-450">
              Showing <strong>{problems.length}</strong> of <strong>{totalProblems}</strong> problem solutions
            </span>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateParam('page', String(page - 1), false)}
                disabled={page === 1}
                className="p-2 border border-slate-200 dark:border-slate-850 rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 disabled:opacity-40 disabled:pointer-events-none text-slate-600 dark:text-slate-350 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Simple page numbers */}
              {Array.from({ length: totalPages }).map((_, i) => {
                const pNum = i + 1;
                const isCurrent = pNum === page;
                return (
                  <button
                    key={pNum}
                    onClick={() => updateParam('page', String(pNum), false)}
                    className={`w-9 h-9 text-xs font-bold rounded-lg transition-colors border ${
                      isCurrent
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'border-slate-200 dark:border-slate-850 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350'
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}

              <button
                onClick={() => updateParam('page', String(page + 1), false)}
                disabled={page === totalPages}
                className="p-2 border border-slate-200 dark:border-slate-850 rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 disabled:opacity-40 disabled:pointer-events-none text-slate-600 dark:text-slate-350 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

// Inline Table skeleton loader
function TableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-56 bg-slate-900/60 border border-slate-850 rounded-2xl"></div>
      <div className="flex justify-between items-center">
        <div className="h-4 w-32 bg-slate-800 rounded"></div>
        <div className="h-9 w-40 bg-slate-800 rounded-lg"></div>
      </div>
    </div>
  );
}
