import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AnalogiesPage from './pages/AnalogiesPage';
import LiveConversation from './pages/LiveConversation';
import AnalogySandbox from './pages/AnalogySandbox';
import AudioStudio from './pages/AudioStudio';
import BrandStudio from './pages/BrandStudio';
import VideoStudio from './pages/VideoStudio';
import DiscussionForum from './pages/DiscussionForum';
import ChatPage from './pages/ChatPage';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginModal } from './components/LoginModal';
import { ProtectedRoute } from './components/ProtectedRoute';

const BrandLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
      </linearGradient>
    </defs>
    <path d="M20 50C20 33.4315 33.4315 20 50 20C66.5685 20 80 33.4315 80 50C80 66.5685 66.5685 80 50 80C33.4315 80 20 66.5685 20 50Z" stroke="url(#logoGrad)" strokeWidth="4" />
    <path d="M35 50L45 40L55 50L65 40" stroke="url(#logoGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="50" cy="50" r="6" fill="url(#logoGrad)" />
    <path d="M50 20V10M80 50H90M50 80V90M20 50H10" stroke="url(#logoGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
  </svg>
);

const NavLink: React.FC<{ to: string; children: React.ReactNode; className?: string }> = ({ to, children, className }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const isButton = className?.includes('rounded-full');

  return (
    <Link
      to={to}
      className={`px-3 py-2 text-sm font-medium transition-all relative whitespace-nowrap ${
        isActive && !isButton
          ? 'text-violet-400'
          : !isButton ? 'text-slate-400 hover:text-white' : ''
      } ${className || ''}`}
    >
      {children}
      {isActive && !isButton && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"></span>}
    </Link>
  );
};

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 p-3 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
};

function AppContent() {
  const { user, openLoginModal, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col transition-colors duration-300">
        <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-lg border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link to="/" className="flex-shrink-0 text-slate-100 font-bold text-xl flex items-center group">
                   <BrandLogo className="h-8 w-8 mr-2 text-violet-600 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="hidden xl:inline">Learn Through Analogy</span>
                </Link>
                <div className="hidden lg:flex items-center space-x-1">
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/analogies">Library</NavLink>
                    <NavLink to="/sandbox">Sandbox</NavLink>
                    <NavLink to="/studio">Studios</NavLink>
                    <NavLink to="/forum">Forum</NavLink>
                    <NavLink to="/chat">Talk to Leny</NavLink>
                    <NavLink 
                      to="/brand" 
                      className="ml-4 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-600/10 text-violet-400 hover:bg-violet-600/20 hover:border-violet-500 hover:text-violet-300 transition-all font-bold shadow-sm shadow-violet-500/10 active:scale-95"
                    >
                      Brand Kit
                    </NavLink>
                </div>
              </div>
              <div className="flex items-center gap-4">
                  {user ? (
                      <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-300">{user.name}</span>
                          <button 
                            onClick={logout}
                            className="hidden sm:block text-xs px-3 py-1.5 border border-slate-600 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                          >
                            Logout
                          </button>
                      </div>
                  ) : (
                      <button 
                        onClick={openLoginModal}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-full transition-all shadow-lg shadow-violet-500/20 active:scale-95"
                      >
                        Log In
                      </button>
                  )}
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/analogies" element={<AnalogiesPage />} />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <LiveConversation />
                </ProtectedRoute>
              } />
              <Route path="/assistant" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />
              <Route path="/forum" element={
                <ProtectedRoute>
                  <DiscussionForum />
                </ProtectedRoute>
              } />
              <Route path="/sandbox" element={
                <ProtectedRoute>
                  <AnalogySandbox />
                </ProtectedRoute>
              } />
              <Route path="/audio-studio" element={
                <ProtectedRoute>
                  <AudioStudio />
                </ProtectedRoute>
              } />
              <Route path="/video-studio" element={
                <ProtectedRoute>
                  <VideoStudio />
                </ProtectedRoute>
              } />
              <Route path="/brand" element={
                <ProtectedRoute>
                  <BrandStudio />
                </ProtectedRoute>
              } />
              <Route path="/studio" element={
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/audio-studio" className="p-8 bg-slate-800 rounded-2xl shadow-xl ring-1 ring-slate-700 hover:ring-violet-500 transition-all group">
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎙️</div>
                        <h3 className="text-xl font-bold mb-2">Audio Studio</h3>
                        <p className="text-slate-500 text-sm">Create podcast conversations about complex topics.</p>
                    </Link>
                    <Link to="/video-studio" className="p-8 bg-slate-800 rounded-2xl shadow-xl ring-1 ring-slate-700 hover:ring-violet-500 transition-all group">
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎬</div>
                        <h3 className="text-xl font-bold mb-2">Video Studio</h3>
                        <p className="text-slate-500 text-sm">Bring your conceptual analogies to life with AI video.</p>
                    </Link>
                    <Link to="/brand" className="p-8 bg-slate-800 rounded-2xl shadow-xl ring-1 ring-slate-700 hover:ring-violet-500 transition-all group">
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎨</div>
                        <h3 className="text-xl font-bold mb-2">Brand Identity</h3>
                        <p className="text-slate-500 text-sm">Generate visual identities and palettes for your ideas.</p>
                    </Link>
                </div>
              } />
            </Routes>
        </main>

        <Footer />
        <LoginModal />
        <ScrollToTopButton />
      </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  );
}