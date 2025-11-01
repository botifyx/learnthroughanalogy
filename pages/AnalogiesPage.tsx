import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Analogy } from '../types';
import { ANALOGY_DATA } from '../constants';
import { generateCategories, playTextAsSpeech } from '../services/geminiService';

const AnalogiesPlaceholderImage = () => (
    <div className="max-w-md mx-auto my-8 text-slate-600">
        <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" aria-labelledby="placeholder-title" role="img">
            <title id="placeholder-title">Illustration of a complex idea turning into a simple one.</title>
            
            {/* Complex side - Brain/Gears */}
            <g transform="translate(40, 50)">
                <path d="M0-25C13.8-25 25-13.8 25 0S13.8 25 0 25-25 13.8-25 0-13.8-25 0-25z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
                <circle cx="-10" cy="-8" r="4" className="text-violet-500/50" fill="currentColor"/>
                <circle cx="8" cy="-12" r="2" className="text-fuchsia-500/50" fill="currentColor"/>
                <circle cx="12" cy="5" r="5" className="text-violet-500/50" fill="currentColor"/>
                <circle cx="-5" cy="15" r="3" className="text-fuchsia-500/50" fill="currentColor"/>
                <path d="M-10 -8 Q 0 -15, 8 -12" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
                <path d="M8 -12 Q 15 -5, 12 5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
                <path d="M12 5 Q 0 12, -5 15" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
                <path d="M-5 15 Q -15 5, -10 -8" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
            </g>

            {/* Connecting Arrow */}
            <path d="M70 50 C 85 40, 115 60, 130 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3,3" />
            <polygon points="128,47 135,50 128,53" className="text-violet-400" fill="currentColor" />

            {/* Simple Side - Lightbulb */}
            <g transform="translate(160, 50)" className="text-amber-400">
                <path d="M-5,5 C-10,12 10,12 5,5 Q0,-5 -15,-10 C-20,-18 0,-25 0,-15 C0,-5 -5,-2 -5,5z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                <path d="M-7 8 H 7 V 15 H -7 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M-5 15 H 5 V 18 H -5 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M-3 18 V 20" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M3 18 V 20" fill="none" stroke="currentColor" strokeWidth="2" />
                {/* Light Rays */}
                <g className="opacity-70">
                    <path d="M0 -28 V -22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M20 -20 L 15 -15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M-20 -20 L -15 -15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M25 0 H 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M-25 0 H -19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </g>
            </g>
        </svg>
    </div>
);

const StarRating: React.FC<{
  rating: number;
  onRate?: (rating: number) => void;
  readOnly?: boolean;
}> = ({ rating, onRate, readOnly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const stars = Array(5).fill(0);

  const starColor = (index: number) => {
    const currentRating = hoverRating || rating;
    if (currentRating > index) {
      return readOnly ? "text-amber-400" : "text-amber-500 cursor-pointer";
    }
    return readOnly ? "text-slate-600" : "text-slate-500 cursor-pointer";
  };

  return (
    <div className="flex items-center" onMouseLeave={() => !readOnly && setHoverRating(0)}>
      {stars.map((_, index) => (
        <svg
          key={index}
          onClick={() => !readOnly && onRate?.(index + 1)}
          onMouseEnter={() => !readOnly && setHoverRating(index + 1)}
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-colors ${starColor(index)}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const AnalogyCard: React.FC<{ 
  analogy: Analogy, 
  onSpeak: (analogy: Analogy) => void, 
  isSpeaking: boolean,
  onRate: (analogyId: number, rating: number) => void
}> = ({ analogy, onSpeak, isSpeaking, onRate }) => {
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
    <div id={`analogy-card-${analogy.id}`} className="h-full bg-slate-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 group relative transform hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 filter blur-xl"></div>
      
      <div className="relative h-full p-6 flex flex-col">
        <div className="flex-grow">
            <h3 className="text-xl font-bold text-violet-400 mb-2 group-hover:text-slate-100 transition-colors">{analogy.title}</h3>
            <p className="text-slate-400 mb-2 text-sm line-clamp-3"><strong>Concept:</strong> {analogy.concept}</p>
            <p className="text-slate-300 mb-4 line-clamp-4"><strong>Analogy:</strong> {analogy.analogy}</p>
        </div>
        
        <div className="mt-auto pt-4 border-t border-slate-700">
          <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-300">Average:</span>
                  <div className="flex items-center gap-1 text-slate-400">
                      <StarRating rating={analogy.averageRating} readOnly />
                      <span>{analogy.averageRating.toFixed(1)} ({analogy.totalRatings})</span>
                  </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-300">You:</span>
                  <StarRating rating={analogy.userRating || 0} onRate={(rating) => onRate(analogy.id, rating)} />
              </div>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-slate-700/60">
              <a href={analogy.url} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 font-semibold text-sm z-10">
              Read More &rarr;
              </a>
              <div className="flex items-center space-x-1 z-10">
                  <button 
                    onClick={handleCopy} 
                    className="p-2 rounded-full hover:bg-slate-700 transition-colors" 
                    aria-label={isCopied ? 'Analogy copied!' : `Copy analogy for ${analogy.title}`}
                  >
                      {isCopied ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      )}
                  </button>
                  <button onClick={() => onSpeak(analogy)} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label={isSpeaking ? `Stop listening to analogy for ${analogy.title}` : `Listen to analogy for ${analogy.title}`}>
                      {isSpeaking ? (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-500" fill="currentColor" viewBox="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 12h2m-6 0h2m-6 0h2m6 0H5a2 2 0 00-2 2v4a2 2 0 002 2h2l3 3v-14l-3 3H5a2 2 0 00-2 2z" /></svg>
                      )}
                  </button>
              </div>
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
  
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [speakingAnalogyId, setSpeakingAnalogyId] = useState<number | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const stopCurrentSpeech = useCallback(() => {
    if (audioSourceRef.current) {
        audioSourceRef.current.onended = null;
        try {
            audioSourceRef.current.stop();
        } catch (e) {
             // Ignore errors if the source is already stopped
        }
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    setSpeakingAnalogyId(null);
  }, []);

  useEffect(() => {
    return () => {
        stopCurrentSpeech();
    };
  }, [stopCurrentSpeech]);

  const handleSpeak = async (analogy: Analogy) => {
    if (speakingAnalogyId === analogy.id) {
        stopCurrentSpeech();
        return;
    }

    if (speakingAnalogyId !== null) {
        stopCurrentSpeech();
    }
    
    setSpeakingAnalogyId(analogy.id);
    try {
        const { source, audioContext } = await playTextAsSpeech(`${analogy.title}. ${analogy.analogy}`);
        audioSourceRef.current = source;
        audioContextRef.current = audioContext;

        source.onended = () => {
            if (audioSourceRef.current === source) {
                stopCurrentSpeech();
            }
        };
        source.start();
    } catch (e) {
        console.error("Error playing speech:", e);
        stopCurrentSpeech();
    }
  }

  const handleRateAnalogy = (analogyId: number, rating: number) => {
    const ratings = JSON.parse(localStorage.getItem('analogyRatings') || '{}');
    ratings[analogyId] = rating;
    localStorage.setItem('analogyRatings', JSON.stringify(ratings));

    setGroupedAnalogies(prevGroups => {
        const newGroups = { ...prevGroups };
        for (const category in newGroups) {
            newGroups[category] = newGroups[category].map(analogy => {
                if (analogy.id === analogyId) {
                    return { ...analogy, userRating: rating };
                }
                return analogy;
            });
        }
        return newGroups;
    });
  };

  const fetchAndSetCategories = useCallback(async () => {
    try {
      const userRatings = JSON.parse(localStorage.getItem('analogyRatings') || '{}');
      const categoryMap = await generateCategories();
      const categorizedAnalogies = ANALOGY_DATA.map(a => {
        let category = 'General';
        for (const cat in categoryMap) {
          if (categoryMap[cat].includes(a.title)) {
            category = cat;
            break;
          }
        }
        return { ...a, category, userRating: userRatings[a.id] };
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

    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(`Failed to generate categories: ${err.message}. Displaying all.`);
      } else {
        setError('Failed to generate categories. Displaying all.');
      }
      const userRatings = JSON.parse(localStorage.getItem('analogyRatings') || '{}');
      const allAnalogies = ANALOGY_DATA.map(a => ({...a, category: 'General', userRating: userRatings[a.id]}));
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

    if (selectedCategory !== 'All') {
        currentOrder = categoryOrder.filter(cat => cat === selectedCategory);
        currentGroups = {
            [selectedCategory]: groupedAnalogies[selectedCategory] || []
        };
    }

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
    const allVisibleAnalogies = filteredData.order.flatMap(category => filteredData.groups[category] || []);
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
            <p className="mt-3 max-w-md mx-auto text-base text-slate-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Understanding difficult topics through everyday experiences. Search and filter our collection.
            </p>
        </div>
        
        <AnalogiesPlaceholderImage />

        <div className="mt-8 max-w-3xl mx-auto flex items-center gap-3">
            <input
                type="search"
                placeholder="Search analogies (e.g., 'Blockchain', 'Google Doc')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 bg-slate-800 border border-slate-600 rounded-full text-slate-200 focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all placeholder-slate-500"
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
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    >
                    {category}
                    </button>
                ))}
                </div>
            )}
            <div className="space-y-16 mt-12">
            {error && <p className="text-center text-red-500">{error}</p>}
            {filteredData.order.length > 0 ? (
                filteredData.order.map(category => (
                    <section key={category}>
                        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent inline-block">
                            {category}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredData.groups[category].map(analogy => (
                                <AnalogyCard key={analogy.id} analogy={analogy} onSpeak={handleSpeak} isSpeaking={speakingAnalogyId === analogy.id} onRate={handleRateAnalogy} />
                            ))}
                        </div>
                    </section>
                ))
            ) : (
                <div className="text-center py-16">
                    <h3 className="text-xl font-semibold text-slate-400">No Analogies Found</h3>
                    <p className="text-slate-500 mt-2">Try adjusting your category or search query.</p>
                </div>
            )}
            </div>
        </>
      )}
    </div>
  );
}