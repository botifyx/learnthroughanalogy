import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Analogy } from '../types';
import { ANALOGY_DATA } from '../constants';
import { generateCategories, playTextAsSpeech } from '../services/geminiService';

const AnalogyCard: React.FC<{ analogy: Analogy, onSpeak: (text: string) => void }> = ({ analogy, onSpeak }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(analogy.analogy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div id={`analogy-card-${analogy.id}`} className="h-full bg-white dark:bg-slate-800/50 rounded-lg shadow-lg overflow-hidden transition-all duration-300 group relative transform hover:scale-[1.02]">
      {/* The background "aurora" glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-20 dark:group-hover:opacity-25 transition-opacity duration-300 filter blur-xl"></div>
      
      {/* The content container */}
      <div className="relative h-full p-6 flex flex-col">
        <div className="flex-grow">
            <h3 className="text-xl font-bold text-violet-600 dark:text-violet-400 mb-2 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{analogy.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-2 text-sm line-clamp-3"><strong>Concept:</strong> {analogy.concept}</p>
            <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-4"><strong>Analogy:</strong> {analogy.analogy}</p>
        </div>
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
            <a href={analogy.url} target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-semibold text-sm z-10">
            Read More &rarr;
            </a>
            <div className="flex items-center space-x-1 z-10">
                <button 
                  onClick={handleCopy} 
                  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors" 
                  aria-label={isCopied ? 'Analogy copied!' : `Copy analogy for ${analogy.title}`}
                >
                    {isCopied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 dark:text-green-400" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    )}
                </button>
                <button onClick={() => onSpeak(`${analogy.title}. ${analogy.analogy}`)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors" aria-label={`Listen to analogy for ${analogy.title}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 12h2m-6 0h2m-6 0h2m6 0H5a2 2 0 00-2 2v4a2 2 0 002 2h2l3 3v-14l-3 3H5a2 2 0 00-2 2z" /></svg>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};


export default function AnalogiesPage() {
  const [groupedAnalogies, setGroupedAnalogies] = useState<Record<string, Analogy[]>>({});
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleSpeak = async (text: string) => {
    if(speaking) return;
    setSpeaking(true);
    try {
        await playTextAsSpeech(text);
    } catch (e) {
        console.error("Error playing speech:", e);
    } finally {
        setSpeaking(false);
    }
  }

  const fetchAndSetCategories = useCallback(async () => {
    try {
      const categoryMap = await generateCategories();
      const categorizedAnalogies = ANALOGY_DATA.map(a => {
        for (const category in categoryMap) {
          if (categoryMap[category].includes(a.title)) {
            return { ...a, category };
          }
        }
        return { ...a, category: 'General' };
      });
      
      const groups: Record<string, Analogy[]> = {};
      categorizedAnalogies.forEach(analogy => {
          if (!groups[analogy.category]) {
              groups[analogy.category] = [];
          }
          groups[analogy.category].push(analogy);
      });
      
      const sortedCategories = Object.keys(categoryMap).length > 0 ? Object.keys(categoryMap).sort() : ['General'];
      setGroupedAnalogies(groups);
      setCategoryOrder(sortedCategories);

    } catch (err: any) {
      console.error(err);
      setError('Failed to generate categories. Displaying all.');
      const allAnalogies = ANALOGY_DATA.map(a => ({...a, category: 'General'}));
      setGroupedAnalogies({ 'All Analogies': allAnalogies });
      setCategoryOrder(['All Analogies']);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndSetCategories();
  }, [fetchAndSetCategories]);
  
  const filteredData = useMemo(() => {
    let currentGroups = groupedAnalogies;
    let currentOrder = categoryOrder;

    // 1. Filter by category
    if (selectedCategory !== 'All') {
        currentOrder = categoryOrder.filter(cat => cat === selectedCategory);
        currentGroups = {
            [selectedCategory]: groupedAnalogies[selectedCategory] || []
        };
    }

    // 2. Filter by search query
    if (!searchQuery) {
        return { groups: currentGroups, order: currentOrder };
    }

    const lowercasedQuery = searchQuery.toLowerCase();
    const newGroups: Record<string, Analogy[]> = {};

    for (const category of currentOrder) {
        const analogies = currentGroups[category];
        if (analogies) {
            const filtered = analogies.filter(analogy =>
                analogy.title.toLowerCase().includes(lowercasedQuery) ||
                analogy.concept.toLowerCase().includes(lowercasedQuery) ||
                analogy.analogy.toLowerCase().includes(lowercasedQuery)
            );
            if (filtered.length > 0) {
                newGroups[category] = filtered;
            }
        }
    }
    
    return { groups: newGroups, order: currentOrder.filter(cat => newGroups[cat]) };
  }, [searchQuery, groupedAnalogies, categoryOrder, selectedCategory]);

  const handleFeelingLucky = () => {
    const allVisibleAnalogies = Object.values(filteredData.groups).flat();
    if (allVisibleAnalogies.length === 0) return;

    const randomIndex = Math.floor(Math.random() * allVisibleAnalogies.length);
    const luckyAnalogy = allVisibleAnalogies[randomIndex];

    const element = document.getElementById(`analogy-card-${luckyAnalogy.id}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        element.classList.add('ring-4', 'ring-fuchsia-500', 'transition-all', 'duration-500');
        setTimeout(() => {
            element.classList.remove('ring-4', 'ring-fuchsia-500');
        }, 2500);
    }
  };


  return (
    <div className="space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent pb-2">Explore Analogies</h1>
            <p className="mt-3 max-w-md mx-auto text-base text-slate-600 dark:text-slate-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Understanding difficult topics through everyday experiences. Search and filter our collection.
            </p>
        </div>
        
        <div className="mt-8 max-w-3xl mx-auto flex items-center gap-3">
            <input
                type="search"
                placeholder="Search analogies (e.g., 'Blockchain', 'Google Doc')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
                aria-label="Search for an analogy"
            />
            <button
                onClick={handleFeelingLucky}
                className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full shadow-md hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-2"
                aria-label="Select a random analogy"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Feeling Lucky?
            </button>
        </div>

      {isLoading ? (
         <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      ) : (
        <>
            {!isLoading && categoryOrder.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 my-8">
                {['All', ...categoryOrder].map(category => (
                    <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                        selectedCategory === category
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                    >
                    {category}
                    </button>
                ))}
                </div>
            )}
            <div className="space-y-16 mt-12">
            {error && <p className="text-center text-red-500 dark:text-red-400">{error}</p>}
            {filteredData.order.length > 0 ? (
                filteredData.order.map(category => (
                    <section key={category}>
                        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent inline-block">
                            {category}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredData.groups[category].map(analogy => (
                                <AnalogyCard key={analogy.id} analogy={analogy} onSpeak={handleSpeak} />
                            ))}
                        </div>
                    </section>
                ))
            ) : (
                <div className="text-center py-16">
                    <h3 className="text-xl font-semibold text-slate-500 dark:text-slate-400">No Analogies Found</h3>
                    <p className="text-slate-400 dark:text-slate-500 mt-2">Try adjusting your category or search query.</p>
                </div>
            )}
            </div>
        </>
      )}
    </div>
  );
}