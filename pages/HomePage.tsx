import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateAnalogyOfTheDay } from '../services/geminiService';

// Icons for features
const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-violet-500 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const DiscussionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-violet-500 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V10a2 2 0 012-2h8z" /></svg>;

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; to: string; }> = ({ icon, title, description, to }) => (
    <Link to={to} className="block bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-violet-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out"></div>
        <div className="relative">
            {icon}
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
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
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700/50">
    <div className="p-8">
      <h3 className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-2">{analogy.title}</h3>
      <p className="text-slate-600 dark:text-slate-400 mb-2 text-sm"><strong>Concept:</strong> {analogy.concept}</p>
      <p className="text-slate-700 dark:text-slate-300"><strong>Analogy:</strong> {analogy.analogy}</p>
    </div>
  </div>
);

const AnalogyOfTheDayLoader: React.FC = () => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 ring-1 ring-slate-200 dark:ring-slate-700/50 animate-pulse">
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
        <section className="text-center relative py-20">
            <div className="absolute inset-0 bg-grid-slate-700/10 [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none"></div>
            <div className="relative z-10">
                <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent pb-2">
                    Learn, Create, and Discuss with AI
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                    An all-in-one platform to simplify complex topics, generate stunning visuals, and engage in thoughtful discussions, all powered by Gemini.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Link
                        to="/analogies"
                        className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity"
                    >
                        Explore Analogies
                    </Link>
                    <Link
                        to="/chat"
                        className="px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-600 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600"
                    >
                        Talk to Leny
                    </Link>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section>
            <h2 className="text-3xl font-bold text-center mb-12">Our Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <FeatureCard 
                    to="/chat"
                    icon={<MicIcon />}
                    title="Talk to Leny"
                    description="Have a real-time voice conversation with Leny. Ask questions and get spoken answers instantly."
                />
                <FeatureCard 
                    to="/discussions"
                    icon={<DiscussionIcon />}
                    title="Discussions"
                    description="Join community discussions on various topics and share your own insights."
                />
            </div>
        </section>
        
        {/* Analogy of the Day */}
        <section>
            <h2 className="text-3xl font-bold text-center mb-12">Analogy of the Day</h2>
            <div className="max-w-4xl mx-auto">
                {isLoading && <AnalogyOfTheDayLoader />}
                {error && <div className="text-center text-red-500 dark:text-red-400 p-8 bg-red-500/10 dark:bg-red-900/20 rounded-lg">{error}</div>}
                {!isLoading && !error && analogyOfTheDay && (
                    <AnalogyOfTheDayCard analogy={analogyOfTheDay} />
                )}
            </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-slate-200 dark:bg-slate-800/50 p-12 rounded-lg">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Ready to Dive In?</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-xl mx-auto">Explore our AI-powered tools and start learning in a new, intuitive way.</p>
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