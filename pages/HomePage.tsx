import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { generateAnalogyOfTheDay } from '../services/geminiService';

const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const SandboxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const SpeakerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-fuchsia-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; to: string; }> = ({ icon, title, description, to }) => (
    <Link to={to} className="block bg-slate-50 dark:bg-slate-800 p-6 rounded-lg shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group h-full ring-1 ring-slate-200 dark:ring-slate-700">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-violet-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out"></div>
        <div className="relative">
            {icon}
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{description}</p>
        </div>
    </Link>
);

interface AnalogyOfTheDay {
    title: string;
    concept: string;
    analogy: string;
}

const AnalogyOfTheDayCard: React.FC<{ analogy: AnalogyOfTheDay }> = ({ analogy }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
    <div className="p-8">
      <h3 className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-2">{analogy.title}</h3>
      <p className="text-slate-600 dark:text-slate-400 mb-2 text-sm"><strong>Concept:</strong> {analogy.concept}</p>
      <p className="text-slate-700 dark:text-slate-300"><strong>Analogy:</strong> {analogy.analogy}</p>
    </div>
  </div>
);

const AnalogyOfTheDayLoader: React.FC = () => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 ring-1 ring-slate-200 dark:ring-slate-700 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 mb-4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mt-2"></div>
    </div>
);

export default function HomePage() {
  const [analogyOfTheDay, setAnalogyOfTheDay] = useState<AnalogyOfTheDay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTopic, setSearchTopic] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTopic.trim()) {
      navigate(`/analogies?q=${encodeURIComponent(searchTopic.trim())}`);
    } else {
      navigate('/analogies');
    }
  };

  useEffect(() => {
    const fetchAnalogy = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const cachedData = localStorage.getItem('analogyOfTheDay');
            const twelveHours = 12 * 60 * 60 * 1000;

            if (cachedData) {
                const { analogy, timestamp } = JSON.parse(cachedData);
                if (Date.now() - timestamp < twelveHours) {
                    setAnalogyOfTheDay(analogy);
                    setIsLoading(false);
                    return;
                }
            }

            const newAnalogy = await generateAnalogyOfTheDay();
            setAnalogyOfTheDay(newAnalogy);
            localStorage.setItem('analogyOfTheDay', JSON.stringify({
                analogy: newAnalogy,
                timestamp: Date.now()
            }));

        } catch (err: any) {
            setError('Failed to load a fresh analogy. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    fetchAnalogy();
  }, []);

  return (
    <div className="space-y-24 mb-24 transition-colors duration-300">
        {/* Hero Section */}
        <section className="text-center relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-grid-slate-700/5 dark:bg-grid-slate-700/10 [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none -z-10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-violet-500/10 dark:bg-violet-500/20 rounded-full blur-3xl -z-10"></div>

            <div className="relative z-10 max-w-4xl mx-auto px-4">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-500 dark:to-fuchsia-500 bg-clip-text text-transparent pb-3">
                    Grasp the Complex. Made Simple.
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                    Our AI-powered platform translates intricate topics from technology, science, and business into relatable, everyday comparisons.
                </p>

                <div className="mt-12 flex items-center justify-center gap-4 md:gap-8">
                    <div className="w-48 h-32 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 text-left shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.001l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.367a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                            <h3 className="font-bold text-slate-700 dark:text-slate-200">Complex Idea</h3>
                        </div>
                        <div className="mt-2 space-y-1.5">
                            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                            <div className="h-2 w-5/6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        </div>
                    </div>

                    <div className="flex-shrink-0 text-center">
                        <span className="text-xs font-mono text-violet-600 dark:text-violet-500">AI</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>

                    <div className="w-48 h-32 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 text-left shadow-lg ring-1 ring-slate-200 dark:ring-slate-700">
                        <div className="flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 017.072 0m-11.314 0a5 5 0 007.072 0M12 21v-1m-6.364-1.636l.707-.707" /></svg>
                            <h3 className="font-bold text-slate-700 dark:text-slate-200">Simple Analogy</h3>
                        </div>
                        <div className="mt-2 space-y-1.5">
                            <div className="h-2 w-full bg-slate-600 dark:bg-slate-300 rounded-full"></div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSearchSubmit} className="mt-12 max-w-xl mx-auto flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 focus-within:ring-2 focus-within:ring-violet-400 transition-all">
                    <input
                        type="text"
                        value={searchTopic}
                        onChange={(e) => setSearchTopic(e.target.value)}
                        placeholder="What do you want to understand? e.g., 'Blockchain'"
                        className="flex-1 px-4 py-2 bg-transparent border-none rounded-full text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-0"
                    />
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-full shadow-md hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-2"
                    >
                        Simplify
                    </button>
                </form>
                
                {/* --- Buy Me a Coffee Section --- */}
                <div className="mt-10 text-center">
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        If our analogies make complex topics click for you, consider showing your appreciation. Your support helps keep this project brewing and ad-free!
                    </p>
                    <a
                        href="https://buymeacoffee.com/learnthrouu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2.5 px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white transition-all transform hover:scale-105 shadow-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                            <path d="M2 8h14a4 4 0 0 1 0 8H2Z"></path>
                            <path d="M6 2v4"></path>
                            <path d="M10 2v4"></path>
                            <path d="M14 2v4"></path>
                        </svg>
                        <span>Support with a Coffee</span>
                    </a>
                </div>
                {/* --- End Buy Me a Coffee Section --- */}
            </div>
        </section>

        {/* Features Section */}
        <section>
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-slate-100">Our Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4">
                <FeatureCard 
                    to="/chat"
                    icon={<MicIcon />}
                    title="Talk to Leny"
                    description="Have a real-time voice conversation with Leny. Ask questions and get spoken answers instantly."
                />
                <FeatureCard 
                    to="/sandbox"
                    icon={<SandboxIcon />}
                    title="Analogy Sandbox"
                    description="Pick an analogy (like a 'Restaurant' or 'Sports Team') and explain any complex topic through that lens."
                />
                 <FeatureCard 
                    to="/analogies"
                    icon={<SearchIcon />}
                    title="Explore Library"
                    description="Browse our curated collection of analogies for tech, business, and science concepts."
                />
                <FeatureCard 
                    to="/audio-studio"
                    icon={<SpeakerIcon />}
                    title="Audio Studio"
                    description="Generate AI podcasts and conversations between virtual hosts on any topic."
                />
            </div>
        </section>
        
        {/* Analogy of the Day */}
        <section>
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-slate-100">Analogy of the Day</h2>
            <div className="max-w-4xl mx-auto px-4">
                {isLoading && <AnalogyOfTheDayLoader />}
                {error && <div className="text-center text-red-500 p-8 bg-red-500/10 rounded-lg">{error}</div>}
                {!isLoading && !error && analogyOfTheDay && (
                    <AnalogyOfTheDayCard analogy={analogyOfTheDay} />
                )}
            </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-slate-50 dark:bg-slate-800 p-12 rounded-lg max-w-4xl mx-auto ring-1 ring-slate-200 dark:ring-slate-700">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Ready to Learn?</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-xl mx-auto">Dive into our library or start a conversation to simplify the complex.</p>
            <div className="mt-6">
                 <Link
                    to="/analogies"
                    className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg shadow-lg hover:opacity-90 transition-opacity text-lg"
                >
                    Browse Analogies
                </Link>
            </div>
        </section>
    </div>
  );
}