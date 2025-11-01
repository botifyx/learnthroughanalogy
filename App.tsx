
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AnalogiesPage from './pages/AnalogiesPage';
import LiveConversation from './pages/LiveConversation';
import AnalogySandbox from './pages/AnalogySandbox';
import Footer from './components/Footer';

const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`px-3 py-2 text-sm font-medium transition-colors relative ${
        isActive
          ? 'text-violet-400'
          : 'text-slate-400 hover:text-white'
      }`}
    >
      {children}
      {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"></span>}
    </Link>
  );
};

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col">
        <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex-shrink-0 text-slate-100 font-bold text-xl flex items-center">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 017.072 0m-11.314 0a5 5 0 007.072 0M12 21v-1m-6.364-1.636l.707-.707" /></svg>
                  Learn Through Analogy
                </Link>
              </div>
              <div className="flex items-center">
                <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/analogies">Analogies</NavLink>
                        <NavLink to="/sandbox">Sandbox</NavLink>
                        <NavLink to="/chat">Talk to Leny</NavLink>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/analogies" element={<AnalogiesPage />} />
              <Route path="/chat" element={<LiveConversation />} />
              <Route path="/sandbox" element={<AnalogySandbox />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </HashRouter>
  );
}