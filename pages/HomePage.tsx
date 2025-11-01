

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { generateAnalogyOfTheDay } from '../services/geminiService';

// Icons for features
const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; to: string; }> = ({ icon, title, description, to }) => (
    <Link to={to} className="block bg-slate-800 p-6 rounded-lg shadow-lg hover:bg-slate-700 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-violet-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out"></div>
        <div className="relative">
            {icon}
            <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{description}</p>
        </div>
    </Link>
);

interface AnalogyOfTheDay {
    title: string;
    concept: string;
    analogy: string;
}

const AnalogyOfTheDayCard: React.FC<{ analogy: AnalogyOfTheDay }> = ({ analogy }) => (
  <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden ring-1 ring-slate-700">
    <div className="p-8">
      <h3 className="text-2xl font-bold text-violet-400 mb-2">{analogy.title}</h3>
      <p className="text-slate-400 mb-2 text-sm"><strong>Concept:</strong> {analogy.concept}</p>
      <p className="text-slate-300"><strong>Analogy:</strong> {analogy.analogy}</p>
    </div>
  </div>
);

const AnalogyOfTheDayLoader: React.FC = () => (
    <div className="bg-slate-800 rounded-lg shadow-xl p-8 ring-1 ring-slate-700 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-700 rounded w-5/6 mb-4"></div>
        <div className="h-4 bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2 mt-2"></div>
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
    <div className="space-y-24">
        {/* Hero Section */}
        <section className="text-center relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-grid-slate-700/10 [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none -z-10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-violet-500/20 rounded-full blur-3xl -z-10"></div>

            <div className="relative z-10 max-w-4xl mx-auto px-4">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent pb-3">
                    Grasp the Complex. Made Simple.
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-400">
                    Our AI-powered platform translates intricate topics from technology, science, and business into relatable, everyday comparisons.
                </p>

                <div className="mt-12 flex items-center justify-center gap-4 md:gap-8">
                    <div className="w-48 h-32 bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 text-left shadow-lg ring-1 ring-slate-700">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.001l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.367a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                            <h3 className="font-bold text-slate-200">Complex Idea</h3>
                        </div>
                        <div className="mt-2 space-y-1.5">
                            <div className="h-2 w-full bg-slate-700 rounded-full animate-pulse"></div>
                            <div className="h-2 w-5/6 bg-slate-700 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        </div>
                    </div>

                    <div className="flex-shrink-0 text-center">
                        <span className="text-xs font-mono text-violet-500">AI</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>

                    <div className="w-48 h-32 bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 text-left shadow-lg ring-1 ring-slate-700">
                        <div className="flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 017.072 0m-11.314 0a5 5 0 007.072 0M12 21v-1m-6.364-1.636l.707-.707" /></svg>
                            <h3 className="font-bold text-slate-200">Simple Analogy</h3>
                        </div>
                        <div className="mt-2 space-y-1.5">
                            <div className="h-2 w-full bg-slate-300 rounded-full"></div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSearchSubmit} className="mt-12 max-w-xl mx-auto flex items-center gap-2 bg-slate-800 p-2 rounded-full shadow-lg ring-1 ring-slate-700 focus-within:ring-2 focus-within:ring-violet-400 transition-all">
                    <input
                        type="text"
                        value={searchTopic}
                        onChange={(e) => setSearchTopic(e.target.value)}
                        placeholder="What do you want to understand? e.g., 'Blockchain'"
                        className="flex-1 px-4 py-2 bg-transparent border-none rounded-full text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0"
                    />
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-full shadow-md hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-2"
                    >
                        Simplify
                    </button>
                </form>
            </div>
        </section>

        {/* Features Section */}
        <section>
            <h2 className="text-3xl font-bold text-center mb-12">Our Features</h2>
            <div className="grid grid-cols-1 gap-8 max-w-md mx-auto">
                <FeatureCard 
                    to="/chat"
                    icon={<MicIcon />}
                    title="Talk to Leny"
                    description="Have a real-time voice conversation with Leny. Ask questions and get spoken answers instantly."
                />
            </div>
        </section>
        
        {/* Analogy of the Day */}
        <section>
            <h2 className="text-3xl font-bold text-center mb-12">Analogy of the Day</h2>
            <div className="max-w-4xl mx-auto">
                {isLoading && <AnalogyOfTheDayLoader />}
                {error && <div className="text-center text-red-500 p-8 bg-red-500/10 rounded-lg">{error}</div>}
                {!isLoading && !error && analogyOfTheDay && (
                    <AnalogyOfTheDayCard analogy={analogyOfTheDay} />
                )}
            </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-slate-800 p-12 rounded-lg">
            <h2 className="text-3xl font-bold text-slate-100">Ready to Dive In?</h2>
            <p className="mt-2 text-slate-400 max-w-xl mx-auto">Explore our AI-powered tools and start learning in a new, intuitive way.</p>
            <div className="mt-6">
                 <Link
                    to="/chat"
                    className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg shadow-lg hover:opacity-90 transition-opacity text-lg"
                >
                    Talk to Leny
                </Link>
            </div>
        </section>
    </div>
  );
}