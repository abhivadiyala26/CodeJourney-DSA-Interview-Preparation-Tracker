import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import Navbar from './components/Navbar.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProblemList from './pages/ProblemList.jsx';
import ProblemForm from './pages/ProblemForm.jsx';
import Profile from './pages/Profile.jsx';
import CuratedLists from './pages/CuratedLists.jsx';
import CheatSheetHub from './pages/CheatSheetHub.jsx';
import MockInterviewJournal from './pages/MockInterviewJournal.jsx';

// Route guard for private authenticated screens
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent mb-4"></div>
        <span className="text-sm font-semibold">Decrypting secure session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

// Route guard to prevent logged-in users from accessing login/register pages
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent mb-4"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes (Landing, Login, Register) */}
            <Route 
              path="/" 
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />

            {/* Protected dashboard and problem routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/problems" 
              element={
                <ProtectedRoute>
                  <ProblemList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/problems/new" 
              element={
                <ProtectedRoute>
                  <ProblemForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/problems/:id/edit" 
              element={
                <ProtectedRoute>
                  <ProblemForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/lists" 
              element={
                <ProtectedRoute>
                  <CuratedLists />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cheatsheets" 
              element={
                <ProtectedRoute>
                  <CheatSheetHub />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mocks" 
              element={
                <ProtectedRoute>
                  <MockInterviewJournal />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}
