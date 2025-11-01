

import React from 'react';
import { Link } from 'react-router-dom';

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
        <footer className="bg-slate-800 border-t border-slate-700 mt-24">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    {/* Column 1: Logo & Socials */}
                    <div className="space-y-4 flex flex-col items-center md:items-start">
                        <Link to="/" className="flex items-center text-slate-100 font-bold text-xl">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 017.072 0m-11.314 0a5 5 0 007.072 0M12 21v-1m-6.364-1.636l.707-.707" /></svg>
                            Learn Through Analogy
                        </Link>
                        <p className="text-slate-400 text-sm max-w-xs">Simplifying complex concepts through creative and intuitive analogies.</p>
                        <div className="flex space-x-4">
                            <a href="https://www.instagram.com/learnthroughanalogy" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-violet-400 transition-colors">
                                <span className="sr-only">Instagram</span>
                                <InstagramIcon />
                            </a>
                            <a href="https://www.youtube.com/@LearnThroughAnalogy" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-violet-400 transition-colors">
                                <span className="sr-only">YouTube</span>
                                <YouTubeIcon />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-300 tracking-wider uppercase">Quick Links</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link to="/" className="text-base text-slate-400 hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/analogies" className="text-base text-slate-400 hover:text-white transition-colors">Analogies</Link></li>
                            <li><Link to="/sandbox" className="text-base text-slate-400 hover:text-white transition-colors">Sandbox</Link></li>
                            <li><Link to="/chat" className="text-base text-slate-400 hover:text-white transition-colors">Talk to Leny</Link></li>
                        </ul>
                    </div>
                    
                    {/* Column 3: Contact Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-300 tracking-wider uppercase">Contact Us</h3>
                        <div className="mt-4 space-y-2 text-slate-400">
                           <p>Bengaluru, Karnataka</p>
                           <p>+91 95664 43876</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-slate-700 pt-8 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Learn Through Analogy. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}