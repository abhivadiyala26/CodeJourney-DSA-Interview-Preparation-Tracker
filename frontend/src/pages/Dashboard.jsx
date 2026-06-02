import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api from '../utils/api.js';
import Heatmap from '../components/Heatmap.jsx';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ChartTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Flame, Plus, RotateCcw, Award, ChevronRight, CheckSquare, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user, seedDemoData } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [seeding, setSeeding] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/problems/dashboard/stats');
      setStatsData(data);
    } catch (error) {
      console.error('Failed to load dashboard statistics:', error);
      showToast('Error loading dashboard analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLoadDemo = async () => {
    setSeeding(true);
    try {
      await seedDemoData();
      await fetchStats(); // Refresh dashboard stats
    } catch (error) {
      console.error(error);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const { stats, difficultyStats, topicStats, monthlyStats, heatmapData } = statsData;
  const hasData = stats.totalProblems > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200">
      
      {/* Welcome banner & Quick CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Hey, {user?.name}! <Sparkles className="text-yellow-500 w-6 h-6 animate-pulse" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your DSA solutions, revise concepts, and monitor your consistency.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {!hasData && (
            <button
              onClick={handleLoadDemo}
              disabled={seeding}
              className="flex-1 sm:flex-initial bg-slate-900 hover:bg-slate-800 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-100 font-semibold text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCcw size={14} className={seeding ? 'animate-spin' : ''} />
              <span>{seeding ? 'Loading Demo...' : 'Load Demo Data'}</span>
            </button>
          )}
          <button
            onClick={() => navigate('/problems/new')}
            className="flex-1 sm:flex-initial bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-brand-500/10 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
          >
            <Plus size={16} />
            <span>Add Problem</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Empty State or Analytics */}
      {!hasData ? (
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-12 text-center max-w-2xl mx-auto space-y-6 shadow-sm glass-panel mt-12">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/60 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto">
            <BookOpen size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your prep journal is empty</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
              Start by logging a problem you recently solved, or load realistic pre-populated demo data to see how the dashboard charts light up!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
            <button
              onClick={() => navigate('/problems/new')}
              className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all shadow-md shadow-brand-500/15"
            >
              Log Your First Problem
            </button>
            <button
              onClick={handleLoadDemo}
              disabled={seeding}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-100 font-semibold text-sm px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw size={14} className={seeding ? 'animate-spin' : ''} />
              <span>Load Demo Workspace</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Quick Metrics Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Total Solved Card */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-5 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between h-32 shadow-sm">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Solved</div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stats.totalSolved} <span className="text-xs font-normal text-slate-400">/ {stats.totalProblems}</span>
              </div>
              <div className="text-xs text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-0.5 mt-2 cursor-pointer" onClick={() => navigate('/problems')}>
                <span>View journal</span> <ChevronRight size={12} />
              </div>
            </div>

            {/* Current Streak Card */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-5 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between h-32 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Streak</span>
                <Flame className="w-5 h-5 text-amber-500 animate-bounce" />
              </div>
              <div className="text-3xl font-extrabold text-amber-500 mt-1">
                {stats.currentStreak} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">Days</span>
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-2">
                Longest: <span className="text-slate-700 dark:text-slate-350">{stats.longestStreak} days</span>
              </div>
            </div>

            {/* Revision Pending Card */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-5 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between h-32 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Revision Due</span>
                <RotateCcw className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-3xl font-extrabold text-rose-500 mt-1">
                {stats.revisionDue}
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-2">
                Upcoming: <span className="text-slate-700 dark:text-slate-350">{stats.revisionUpcoming} items</span>
              </div>
            </div>

            {/* Difficulty breakdowns Card */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-5 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between h-32 shadow-sm">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Difficulty Split</div>
              <div className="grid grid-cols-3 gap-1 text-center mt-2">
                <div>
                  <div className="text-[10px] text-emerald-500 font-bold uppercase">Easy</div>
                  <div className="text-base font-extrabold text-slate-850 dark:text-white">{stats.easySolved}</div>
                </div>
                <div>
                  <div className="text-[10px] text-amber-500 font-bold uppercase">Med</div>
                  <div className="text-base font-extrabold text-slate-850 dark:text-white">{stats.mediumSolved}</div>
                </div>
                <div>
                  <div className="text-[10px] text-rose-500 font-bold uppercase">Hard</div>
                  <div className="text-base font-extrabold text-slate-850 dark:text-white">{stats.hardSolved}</div>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-1">
                Active preparation tags
              </div>
            </div>

          </div>

          {/* Heatmap Section */}
          <Heatmap heatmapData={heatmapData} />

          {/* Analytics Charts & Topics Breakdown Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 1: Difficulty Donut and Monthly activity */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Donut Chart */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-5 rounded-xl glass-panel shadow-sm flex flex-col justify-between min-h-[300px]">
                  <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Difficulty Distribution</h3>
                  <div className="h-44 w-full relative flex items-center justify-center my-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={difficultyStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="solved"
                        >
                          {difficultyStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip 
                          contentStyle={{ 
                            background: '#0f172a', 
                            border: '1px solid #1e293b',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '11px'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-black text-slate-800 dark:text-white">{stats.totalSolved}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">Solved</span>
                    </div>
                  </div>
                  <div className="flex justify-around text-xs border-t border-slate-100 dark:border-slate-850 pt-3">
                    {difficultyStats.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                        <span className="font-semibold text-slate-700 dark:text-slate-400">{entry.name} ({entry.solved})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Chart */}
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-5 rounded-xl glass-panel shadow-sm flex flex-col justify-between min-h-[300px]">
                  <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Monthly Solves Trend</h3>
                  <div className="h-44 w-full my-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyStats} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                        <YAxis stroke="#64748b" fontSize={9} allowDecimals={false} />
                        <ChartTooltip
                          contentStyle={{
                            background: '#0f172a',
                            border: '1px solid #1e293b',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '11px',
                          }}
                        />
                        <Bar dataKey="solved" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center border-t border-slate-100 dark:border-slate-850 pt-3 font-semibold uppercase tracking-wider">
                    Past 6 Months Daily aggregates
                  </p>
                </div>

              </div>

              {/* Quick Spaced-repetition notification alert if revision is due */}
              {stats.revisionDue > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 p-4 rounded-xl flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>
                      You have <strong>{stats.revisionDue}</strong> DSA problem{stats.revisionDue === 1 ? '' : 's'} flagged for overdue revision today.
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/problems?status=Revision Required')}
                    className="shrink-0 font-bold hover:underline flex items-center gap-0.5 text-xs text-rose-600 dark:text-rose-350"
                  >
                    <span>Start Revision</span> <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Topic Progress Panel */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-5 rounded-xl glass-panel shadow-sm flex flex-col justify-between h-[624px]">
              <div>
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Topic-wise Progress</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 mb-5">Solved problems count and progress percentages</p>
                
                <div className="space-y-4 overflow-y-auto pr-1 max-h-[480px] scrollbar-thin">
                  {topicStats.map((item) => (
                    <div key={item.topic} className="space-y-1">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-350">{item.topic}</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                          {item.solved} solved {item.total > 0 && <span className="font-normal">({item.percentage}%)</span>}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800/60 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${item.percentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-850 pt-3 flex justify-between items-center text-xs text-slate-400 dark:text-slate-500">
                <span>{topicStats.filter(t => t.solved > 0).length} Topics started</span>
                <span className="cursor-pointer hover:underline text-brand-500 dark:text-brand-400 font-semibold" onClick={() => navigate('/problems')}>All Problems</span>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}

// Inline Skeleton Loading states
function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-800 rounded"></div>
          <div className="h-4 w-72 bg-slate-800 rounded"></div>
        </div>
        <div className="h-10 w-28 bg-slate-800 rounded-xl"></div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-900/60 border border-slate-850 rounded-2xl"></div>
        ))}
      </div>

      {/* Calendar box */}
      <div className="h-44 bg-slate-900/60 border border-slate-850 rounded-xl"></div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[300px] bg-slate-900/60 border border-slate-850 rounded-xl"></div>
          <div className="h-[300px] bg-slate-900/60 border border-slate-850 rounded-xl"></div>
        </div>
        <div className="h-[624px] bg-slate-900/60 border border-slate-850 rounded-xl"></div>
      </div>
    </div>
  );
}
