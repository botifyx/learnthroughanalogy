import React, { useState, useEffect, useCallback } from 'react';

const SunIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

export const ThemeToggle = () => {
    // Determine initial theme based on current DOM state to avoid sync issues
    const getCurrentTheme = useCallback(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }, []);

    const [theme, setTheme] = useState(getCurrentTheme);

    const toggleTheme = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent bubbling issues
        const newTheme = theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        setTheme(newTheme);
    };

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    // Handle system preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (!localStorage.getItem('theme')) {
                setTheme(getCurrentTheme());
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [getCurrentTheme]);

    return (
        <button
            onClick={toggleTheme}
            className="group relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 ring-1 ring-slate-200 dark:ring-slate-700 transition-all duration-300 active:scale-90 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 overflow-hidden"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Current theme: ${theme}. Click to change.`}
        >
            <div className="relative w-6 h-6">
                <SunIcon 
                    className={`h-6 w-6 absolute transition-all duration-500 ease-out transform ${
                        theme === 'light' 
                        ? 'rotate-0 scale-100 opacity-100 text-amber-500' 
                        : 'rotate-90 scale-0 opacity-0'
                    }`} 
                />
                <MoonIcon 
                    className={`h-6 w-6 absolute transition-all duration-500 ease-out transform ${
                        theme === 'dark' 
                        ? 'rotate-0 scale-100 opacity-100 text-violet-400' 
                        : '-rotate-90 scale-0 opacity-0'
                    }`} 
                />
            </div>
        </button>
    );
};