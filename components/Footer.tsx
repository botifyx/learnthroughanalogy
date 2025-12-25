import React from 'react';
import { Link } from 'react-router-dom';

const BrandLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="footerLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
      </linearGradient>
    </defs>
    <path d="M20 50C20 33.4315 33.4315 20 50 20C66.5685 20 80 33.4315 80 50C80 66.5685 66.5685 80 50 80C33.4315 80 20 66.5685 20 50Z" stroke="url(#footerLogoGrad)" strokeWidth="4" />
    <path d="M35 50L45 40L55 50L65 40" stroke="url(#footerLogoGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="50" cy="50" r="6" fill="url(#footerLogoGrad)" />
  </svg>
);

const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664 4.771 4.919-4.919 1.266-.058 1.644-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"/>
    </svg>
);

const YouTubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
    </svg>
);


export default function Footer() {
    return (
        <footer className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-24 transition-colors duration-300">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    {/* Column 1: Logo & Socials */}
                    <div className="space-y-4 flex flex-col items-center md:items-start">
                        <Link to="/" className="flex items-center text-slate-900 dark:text-slate-100 font-bold text-xl">
                            <BrandLogo className="h-8 w-8 mr-2 text-violet-600" />
                            Learn Through Analogy
                        </Link>
                        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xs">Simplifying complex concepts through creative and intuitive analogies.</p>
                        <div className="flex space-x-4">
                            <a href="https://www.instagram.com/learnthroughanalogy" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                                <span className="sr-only">Instagram</span>
                                <InstagramIcon />
                            </a>
                            <a href="https://www.youtube.com/@LearnThroughAnalogy" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                                <span className="sr-only">YouTube</span>
                                <YouTubeIcon />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-300 tracking-wider uppercase">Quick Links</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link to="/" className="text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/analogies" className="text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Analogies</Link></li>
                            <li><Link to="/sandbox" className="text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Sandbox</Link></li>
                            <li><Link to="/chat" className="text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Talk to Leny</Link></li>
                        </ul>
                    </div>
                    
                    {/* Column 3: Contact Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-300 tracking-wider uppercase">Contact Us</h3>
                        <div className="mt-4 space-y-2 text-slate-600 dark:text-slate-400">
                           <p>Bengaluru, Karnataka</p>
                           <p>+91 95664 43876</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Learn Through Analogy. All rights reserved.</p>
                    <p className="mt-1">Site Designed and Maintained by <span className="font-bold text-violet-500">BotifyX</span>.</p>
                </div>
            </div>
        </footer>
    );
}