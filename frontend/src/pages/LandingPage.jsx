import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Calendar, 
  RotateCcw, 
  Search, 
  Briefcase, 
  Flame, 
  Layers, 
  ArrowRight, 
  Lock, 
  ChevronRight,
  PieChart as PieIcon,
  CheckSquare
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white overflow-x-hidden">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none"></div>

      {/* Header / Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/25">
              CJ
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              CodeJourney
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md shadow-brand-500/20 transition-all duration-150 flex items-center gap-1"
            >
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3.5 py-1 text-xs text-brand-400 font-semibold mb-6 hover:border-brand-500/30 transition-all duration-200 cursor-default">
          <Flame size={12} className="text-amber-500 animate-pulse" />
          <span>The Ultimate DSA & Interview Prep Tracker</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
          Master your DSA grind and landing your{' '}
          <span className="bg-gradient-to-r from-brand-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
            dream tech role
          </span>
        </h1>
        
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop solving problems aimlessly. Log, review, and analyze your progress using spaced repetition, daily streak tracking, and interactive dashboards designed for FAANG candidates.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link 
            to="/register" 
            className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white text-base font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-brand-500/30 transition-all hover:scale-[1.02] active:scale-95 duration-200 flex items-center justify-center gap-2"
          >
            Start Tracking Free <ArrowRight size={18} />
          </Link>
          <Link 
            to="/login" 
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 text-base font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            Access Dashboard
          </Link>
        </div>

        {/* Dashboard Preview mockup */}
        <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-2xl shadow-brand-500/5 backdrop-blur-xl">
          <div className="absolute top-[-1px] left-20 right-20 h-[1px] bg-gradient-to-r from-transparent via-brand-500/50 to-transparent"></div>
          
          {/* Mock Window controls */}
          <div className="flex items-center gap-1.5 pb-4 border-b border-slate-800/60 mb-4">
            <span className="w-3 h-3 rounded-full bg-slate-800"></span>
            <span className="w-3 h-3 rounded-full bg-slate-800"></span>
            <span className="w-3 h-3 rounded-full bg-slate-800"></span>
            <span className="text-xs text-slate-500 ml-4 font-mono">dashboard_preview.tsx</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {/* Left Mock stats column */}
            <div className="md:col-span-1 space-y-4">
              <div className="bg-slate-950/60 border border-slate-900 p-5 rounded-xl">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Solved</div>
                <div className="text-3xl font-extrabold text-white flex items-baseline gap-2">
                  137 <span className="text-xs font-semibold text-emerald-400">+12 this week</span>
                </div>
              </div>
              <div className="bg-slate-950/60 border border-slate-900 p-5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Current Streak</div>
                  <div className="text-3xl font-extrabold text-amber-500">14 Days</div>
                </div>
                <Flame className="w-8 h-8 text-amber-500 animate-bounce" />
              </div>
              <div className="bg-slate-950/60 border border-slate-900 p-5 rounded-xl">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Difficulty Split</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-emerald-400">Easy (40)</span>
                    <span className="text-slate-400">100% Solved</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-[80%] rounded-full"></div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-500">Medium (72)</span>
                    <span className="text-slate-400">80% Solved</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[60%] rounded-full"></div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-500">Hard (25)</span>
                    <span className="text-slate-400">30% Solved</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[25%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle and Right combined chart & Heatmap area */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-slate-950/60 border border-slate-900 p-5 rounded-xl h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-slate-200">DSA Topic Mastery Progress</h4>
                    <span className="text-xs text-slate-400">Top 5 Topics</span>
                  </div>
                  <div className="space-y-3">
                    {['Arrays', 'Strings', 'DP', 'Trees', 'Graphs'].map((topic, idx) => (
                      <div key={topic} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{topic}</span>
                          <span className="text-brand-400">{[92, 85, 45, 68, 30][idx]}%</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-brand-500 to-indigo-500 h-full rounded-full" 
                            style={{ width: `${[92, 85, 45, 68, 30][idx]}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Heatmap preview */}
                <div className="border-t border-slate-900 pt-4 mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>Recent Solve Heatmap</span>
                    <span>More activity = Darker green/violet</span>
                  </div>
                  {/* Grid squares */}
                  <div className="flex gap-1 overflow-x-auto py-1">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        {Array.from({ length: 4 }).map((_, j) => {
                          const level = (i * j + i) % 4;
                          const bg = 
                            level === 0 ? 'bg-slate-900' :
                            level === 1 ? 'bg-brand-900/30' :
                            level === 2 ? 'bg-brand-700/60' :
                            'bg-brand-500';
                          return (
                            <div key={j} className={`w-3.5 h-3.5 rounded-sm ${bg}`}></div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="bg-slate-900/30 border-y border-slate-900 py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to master your coding interviews
            </h2>
            <p className="text-slate-400 text-base">
              Say goodbye to messy spreadsheets and unstructured Notion templates. CodeJourney is customized specifically for coding practice tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Spaced Repetition */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-xl hover:border-brand-500/40 transition-colors duration-250 group">
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-5 group-hover:scale-110 transition-transform">
                <RotateCcw size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-brand-300 transition-colors">
                Spaced Repetition Scheduler
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Problems solved weeks ago slip away easily. Mark challenging problems for revision and automatically receive dates to review them (Tomorrow, 3 days, 7 days, or 30 days later).
              </p>
            </div>

            {/* Feature 2: GitHub-Style Heatmap */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-xl hover:border-brand-500/40 transition-colors duration-250 group">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
                <Calendar size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-300 transition-colors">
                GitHub-style Solves Heatmap
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Stay motivated by building a consistent daily solving pattern. The visual activity calendar tracks your solves across platforms like LeetCode and GeeksforGeeks.
              </p>
            </div>

            {/* Feature 3: Company Tag Statistics */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-xl hover:border-brand-500/40 transition-colors duration-250 group">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-5 group-hover:scale-110 transition-transform">
                <Briefcase size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-violet-300 transition-colors">
                Company Target Analytics
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Targeting specific companies like Amazon, Google, or Microsoft? Tag your problems with companies and view exactly how prepared you are for their specific profiles.
              </p>
            </div>

            {/* Feature 4: Full Search & Filters */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-xl hover:border-brand-500/40 transition-colors duration-250 group">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-5 group-hover:scale-110 transition-transform">
                <Search size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-pink-300 transition-colors">
                Advanced Searching & Filters
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Retrieve problems in seconds. Filter by difficulty (Easy, Medium, Hard), current status (Attempted, Revision Due), topic lists, target companies, or search keywords.
              </p>
            </div>

            {/* Feature 5: CSV Exporter */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-xl hover:border-brand-500/40 transition-colors duration-250 group">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <Layers size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-300 transition-colors">
                Export to CSV
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your data is yours. Export your complete DSA journal, notes, approach logs, and mistakes directly to a standard CSV file with a single click at any time.
              </p>
            </div>

            {/* Feature 6: Auth & Role Architecture */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-xl hover:border-brand-500/40 transition-colors duration-250 group">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-5 group-hover:scale-110 transition-transform">
                <Lock size={20} />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-teal-300 transition-colors">
                Protected JWT Architecture
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Secure access powered by JWT authentication, encrypted database storage, and a robust role-based system ready for administrator capabilities down the line.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Demo Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-brand-950/40 rounded-3xl border border-slate-850 p-8 sm:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-white">
            Ready to streamline your preparation?
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto mb-8">
            Create your account today and experience the benefits of structured, analytic-driven DSA logging. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-[1.02] duration-150"
            >
              Sign Up For Free
            </Link>
            <Link 
              to="/login" 
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold px-8 py-3.5 rounded-xl transition-all"
            >
              Log In to Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-brand-600 flex items-center justify-center font-bold text-white text-xs">
              CJ
            </div>
            <span className="font-semibold text-sm tracking-tight text-slate-400">
              CodeJourney Tracker
            </span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} CodeJourney. All rights reserved. Created for premium coding performance.
          </p>
        </div>
      </footer>

    </div>
  );
}
