import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import api from '../utils/api.js';
import { VALID_TOPICS } from '../../../backend/models/Problem.js';
import { 
  BookOpen, Plus, Save, Trash2, Edit2, FileText, Eye, EyeOff, 
  Loader2, ArrowLeft, ChevronRight, Hash, Compass 
} from 'lucide-react';

// Custom Markdown parser supporting headers, bold, italics, lists, code, and codeblocks
const parseMarkdownToHTML = (text) => {
  if (!text) return '<p class="text-slate-500 italic text-xs">Start writing notes on the left panel to see the preview live here...</p>';
  
  // Escape html strings to prevent injections
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks (multiline)
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-xs text-brand-300 overflow-x-auto my-3">$1</pre>');

  // Headers (#, ##, ###)
  html = html.replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-slate-100 mt-4 mb-2 flex items-center gap-1"><span class="text-brand-500">#</span> $1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="text-base font-extrabold text-slate-100 mt-6 mb-2.5 border-b border-slate-850 pb-1.5">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="text-lg font-black text-white mt-8 mb-4">$1</h2>');

  // Bold (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-brand-400">$1</strong>');
  
  // Italics (*text*)
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-350">$1</em>');

  // Inline Code (`code`)
  html = html.replace(/`(.*?)`/g, '<code class="bg-slate-950 dark:bg-slate-900 border border-slate-900 dark:border-slate-800 px-1.5 py-0.5 rounded font-mono text-xs text-rose-400 font-semibold">$1</code>');

  // Bullet Points (- list item or * list item)
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="list-disc ml-5 text-slate-300 text-xs my-1">$1</li>');
  html = html.replace(/^\s*\*\s+(.*$)/gim, '<li class="list-disc ml-5 text-slate-300 text-xs my-1">$1</li>');

  // Support single breaks
  return html.replace(/\n/g, '<br/>');
};

export default function CheatSheetHub() {
  const { showToast } = useToast();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Active workspace state
  const [activeSheet, setActiveSheet] = useState(null); // Selected sheet object or null
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(true); // Split view or editor only
  const [filterTopic, setFilterTopic] = useState('');

  // Form states for creating/editing sheets
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('Arrays');
  const [content, setContent] = useState('');

  // Mock template variables
  const sampleTemplate = `# Dynamic Programming Cheat Sheet

## 1. Core Framework
DP is an optimization over recursion. Always check:
- **Overlapping Subproblems**: Identical subproblems evaluated repeatedly.
- **Optimal Substructure**: The global optimal solution can be built from optimal subproblems.

## 2. 1D DP Template (e.g. Climbing Stairs)
State Definition: \`DP[i]\` = maximum ways to reach step \`i\`.
Recurrence Relation:
\`\`\`
DP[i] = DP[i - 1] + DP[i - 2]
\`\`\`

## 3. Key Tips
- Top-Down = Recursion + Memoization Table.
- Bottom-Up = Iterative DP Tabulation.
- Space Optimization: Can we store only \`prev\` and \`prevPrev\` instead of a whole array?
`;

  const fetchSheets = async () => {
    try {
      const { data } = await api.get('/cheatsheets');
      setSheets(data);
    } catch (error) {
      console.error(error);
      showToast('Error retrieving cheat sheets.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheets();
  }, []);

  // Handle sheet selection
  const handleSelectSheet = (sheet) => {
    setActiveSheet(sheet);
    setTitle(sheet.title);
    setTopic(sheet.topic);
    setContent(sheet.content);
    setIsEditing(true);
  };

  // Start new sheet creation
  const handleStartCreateNew = () => {
    setActiveSheet(null);
    setTitle('');
    setTopic('Arrays');
    setContent(sampleTemplate);
    setIsEditing(true);
  };

  // Cancel edit
  const handleCancel = () => {
    setIsEditing(false);
    setActiveSheet(null);
  };

  // Save/Update sheet
  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Title and content are required.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = { title, topic, content };
      if (activeSheet) {
        // Update
        const { data } = await api.put(`/cheatsheets/${activeSheet._id}`, payload);
        showToast('Cheat sheet updated successfully!', 'success');
        setSheets((prev) => prev.map((s) => (s._id === data._id ? data : s)));
        setActiveSheet(data);
      } else {
        // Create
        const { data } = await api.post('/cheatsheets', payload);
        showToast('Cheat sheet saved!', 'success');
        setSheets((prev) => [data, ...prev]);
        setActiveSheet(data);
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to save cheat sheet.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete sheet
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await api.delete(`/cheatsheets/${id}`);
        showToast('Cheat sheet deleted.', 'success');
        setSheets((prev) => prev.filter((s) => s._id !== id));
        if (activeSheet?._id === id) {
          handleCancel();
        }
      } catch (error) {
        console.error(error);
        showToast('Failed to delete cheat sheet.', 'error');
      }
    }
  };

  // Filter sheets
  const filteredSheets = sheets.filter(
    (s) => !filterTopic || s.topic === filterTopic
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-brand-500 w-8 h-8 mb-2" />
        <span className="text-sm text-slate-500">Loading cheatsheet workspace...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-200 text-left">
      
      {/* Title Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Cheat Sheet Hub <BookOpen className="text-brand-500 w-6 h-6" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Author and organize study logs using markdown. Review patterns before coding sessions.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleStartCreateNew}
            className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
          >
            <Plus size={16} />
            <span>Create Cheat Sheet</span>
          </button>
        )}
      </div>

      {/* Main split dashboard workspace */}
      {!isEditing ? (
        <div className="space-y-6">
          {/* Filters strip */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setFilterTopic('')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors shrink-0 flex items-center gap-1 ${
                !filterTopic 
                  ? 'bg-brand-500/10 border-brand-500/40 text-brand-600 dark:text-brand-400' 
                  : 'bg-white hover:bg-slate-55 dark:bg-slate-900 border-slate-200 dark:border-slate-850'
              }`}
            >
              <Compass size={12} />
              <span>All Topics</span>
            </button>
            {VALID_TOPICS.map((top) => {
              const hasSheets = sheets.some((s) => s.topic === top);
              if (!hasSheets) return null; // Only show topics that have sheets to filter
              return (
                <button
                  key={top}
                  onClick={() => setFilterTopic(top)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors shrink-0 ${
                    filterTopic === top
                      ? 'bg-brand-500/10 border-brand-500/40 text-brand-600 dark:text-brand-400' 
                      : 'bg-white hover:bg-slate-55 dark:bg-slate-900 border-slate-200 dark:border-slate-850'
                  }`}
                >
                  {top}
                </button>
              );
            })}
          </div>

          {/* Catalog grid */}
          {filteredSheets.length === 0 ? (
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-16 text-center max-w-xl mx-auto space-y-4 shadow-sm glass-panel">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-850 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                <FileText size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No cheat sheets found</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xs mx-auto">
                  Get started by creating your first general study sheet to summarize algorithm templates.
                </p>
              </div>
              <button
                onClick={handleStartCreateNew}
                className="bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-colors"
              >
                Create Study Sheet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredSheets.map((s) => (
                <div 
                  key={s._id} 
                  className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl glass-panel shadow-sm flex flex-col justify-between h-44 hover:border-brand-500/45 transition-colors group"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        {s.topic}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity">
                        <button
                          onClick={() => handleSelectSheet(s)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-250"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(s._id, s.title)}
                          className="p-1 hover:bg-rose-50 dark:hover:bg-rose-955/20 rounded text-slate-400 hover:text-rose-500"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-850 dark:text-white line-clamp-2">{s.title}</h3>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-850/60 pt-3 flex justify-between items-center text-[10px] text-slate-400">
                    <span>Last updated: {new Date(s.updatedAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleSelectSheet(s)}
                      className="text-brand-500 dark:text-brand-400 font-bold hover:underline flex items-center gap-0.5"
                    >
                      <span>Open Workspace</span> <ChevronRight size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Workspace Editor Split Screen */
        <div className="space-y-5 animate-slide-in">
          
          {/* Control Options bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-850 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="p-1.5 border border-slate-200 dark:border-slate-850 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-450 transition-colors"
                title="Back to Catalog"
              >
                <ArrowLeft size={14} />
              </button>
              <div className="text-xs font-mono text-slate-400">
                {activeSheet ? 'Workspace / Edit' : 'Workspace / Create'}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex-1 sm:flex-initial px-3.5 py-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-655 flex items-center justify-center gap-1"
              >
                {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
                <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-initial bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1 transition-colors"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                <span>{activeSheet ? 'Save Changes' : 'Save Sheet'}</span>
              </button>
            </div>
          </div>

          {/* Form input headers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Title</label>
              <input
                type="text"
                required
                className="w-full bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                placeholder="e.g. Graph BFS Templates"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DSA Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3.5 text-xs text-slate-700 dark:text-slate-350 focus:outline-none focus:border-brand-500"
              >
                {VALID_TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Editor Grid Panels */}
          <div className={`grid grid-cols-1 ${showPreview ? 'lg:grid-cols-2' : ''} gap-5`}>
            {/* Left Markdown Editor */}
            <div className="space-y-1 flex flex-col">
              <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 border-b-0 px-4 py-2 rounded-t-xl text-[10px] font-bold uppercase tracking-wider text-slate-450">
                <span>Markdown Editor</span>
                <span className="font-mono text-[9px]">Markdown rules apply</span>
              </div>
              <textarea
                className="w-full min-h-[450px] bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-b-xl p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 focus:border-t-0 resize-y"
                placeholder="Write cheatsheet in Markdown format... use #, ##, **, -, codeblocks"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={saving}
              />
            </div>

            {/* Right HTML rendering Preview panel */}
            {showPreview && (
              <div className="space-y-1 flex flex-col">
                <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 border-b-0 px-4 py-2 rounded-t-xl text-[10px] font-bold uppercase tracking-wider text-slate-450">
                  Document Preview
                </div>
                <div
                  className="w-full min-h-[450px] bg-slate-100/50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-b-xl p-6 overflow-y-auto leading-relaxed text-slate-800 dark:text-slate-200 max-h-[500px]"
                  dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(content) }}
                />
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
