import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { 
  User as UserIcon, Mail, ShieldAlert, Award, Calendar, Flame, 
  RotateCcw, ShieldCheck, KeyRound, Save, Loader2, Sparkles 
} from 'lucide-react';

export default function Profile() {
  const { user, updateProfile, updatePassword, seedDemoData } = useAuth();
  const { showToast } = useToast();

  // Profile fields state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Workspace trigger state
  const [seeding, setSeeding] = useState(false);

  // Handle profile edit submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setProfileLoading(true);
    try {
      await updateProfile(name, email);
    } catch (error) {
      console.error(error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password change submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'warning');
      return;
    }

    setPasswordLoading(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle demo loading
  const handleLoadDemo = async () => {
    if (window.confirm('WARNING: Loading demo data will replace all your current logged problems with 15 pre-configured sample DSA solutions. Do you wish to proceed?')) {
      setSeeding(true);
      try {
        await seedDemoData();
      } catch (error) {
        console.error(error);
      } finally {
        setSeeding(false);
      }
    }
  };

  const joinDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric', day: 'numeric' })
    : '-';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Title Header */}
      <div className="border-b border-slate-200 dark:border-slate-880 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account credentials, security preferences, and workspace logs.</p>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Col: User stats card widget */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-6 rounded-2xl glass-panel shadow-sm space-y-6 text-center">
          {/* Avatar initial */}
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-3xl uppercase shadow-md relative group">
            {user?.name?.charAt(0)}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <span className="text-[10px] uppercase font-bold tracking-wider">Avatar</span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-850 dark:text-slate-200">{user?.name}</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{user?.email}</p>
            <div className="mt-2.5 inline-flex items-center gap-1 bg-brand-500/10 text-brand-600 dark:text-brand-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck size={12} />
              <span>{user?.role} Access</span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-850 pt-5 grid grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-2.5">
              <Calendar className="text-slate-400 dark:text-slate-500 w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Joined</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{joinDate}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Flame className="text-amber-500 w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Streak</span>
                <span className="text-xs font-bold text-amber-500">{user?.currentStreak || 0} Days</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 col-span-2 border-t border-slate-100 dark:border-slate-850/60 pt-4 mt-2">
              <Award className="text-brand-500 w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Longest Record</span>
                <span className="text-xs font-semibold text-slate-750 dark:text-slate-350">{user?.longestStreak || 0} solve days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Forms stack */}
        <div className="lg:col-span-2 space-y-6 text-left">
          
          {/* Edit Profile Form */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-6 rounded-2xl glass-panel shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-3">
              <UserIcon size={16} className="text-brand-500" />
              <span>Personal Information</span>
            </h3>
            
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={profileLoading}
                  />
                </div>
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={profileLoading}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileLoading || (name === user?.name && email === user?.email)}
                  className="bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-500/10 flex items-center gap-1 transition-colors"
                >
                  {profileLoading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 p-6 rounded-2xl glass-panel shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-3">
              <KeyRound size={16} className="text-indigo-500" />
              <span>Change Password Settings</span>
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Current */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Current Password</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={passwordLoading}
                  />
                </div>
                {/* New */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">New Password</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={passwordLoading}
                  />
                </div>
                {/* Confirm */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={passwordLoading}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-500/10 flex items-center gap-1 transition-colors"
                >
                  {passwordLoading ? <Loader2 size={12} className="animate-spin" /> : <KeyRound size={12} />}
                  <span>Change Password</span>
                </button>
              </div>
            </form>
          </div>

          {/* Seeding workspace settings (Danger Zone) */}
          <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-2xl glass-panel shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5 border-b border-rose-500/10 pb-3">
              <ShieldAlert size={16} />
              <span>Workspace Management</span>
            </h3>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-850 dark:text-slate-200 block">Populate Mock DSA Data</span>
                <p className="text-slate-400 dark:text-slate-500 max-w-md">
                  Wipe your current journal items and replace them with 15 pre-configured Easy, Medium, and Hard problems spanning multiple dates to preview stats, streaks, charts, and calendars.
                </p>
              </div>
              
              <button
                onClick={handleLoadDemo}
                disabled={seeding}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-850 text-slate-100 font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                <RotateCcw size={12} className={seeding ? 'animate-spin' : ''} />
                <span>{seeding ? 'Syncing...' : 'Load Demo Workspace'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
