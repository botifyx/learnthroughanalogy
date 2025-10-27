import React, { useState, useEffect } from 'react';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
);

export const ThemeToggle = () => {
    const [theme, setTheme] = useState(() => {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme');
        }
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    // When user clicks toggle, we explicitly set the theme in localStorage.
    // This signifies a user override of the system preference.
    const toggleTheme = () => {
        const t = theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', t);
        setTheme(t);
    };

    // This effect syncs the theme state with the DOM.
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    // This effect listens for changes in the OS theme preference.
    // It only applies the change if the user has not manually set a theme.
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e: MediaQueryListEvent) => {
            // If 'theme' is in localStorage, the user has made an explicit choice.
            // In that case, we don't override their choice with the system preference.
            if (!('theme' in localStorage)) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []); // Empty dependency array ensures this runs only once on mount.

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-violet-500 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
    );
};
