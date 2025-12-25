import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Analogy } from '../types';
import { ANALOGY_DATA } from '../constants';
import { generateCategories, playTextAsSpeech } from '../services/geminiService';

// Standard React FC type used to handle props and key requirements correctly
const CardSkeleton: React.FC<{ index: number }> = ({ index }) => (
    <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 flex flex-col h-full ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden relative"
        style={{ animationDelay: `${index * 100}ms` }}
    >
        {/* Shimmer Effect Overlay */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 dark:via-slate-700/30 to-transparent"></div>
        
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4 mb-4 animate-pulse"></div>
        <div className="space-y-2 mb-6">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-full animate-pulse"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-5/6 animate-pulse"></div>
        </div>
        <div className="space-y-2 mb-6 flex-grow">
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-full animate-pulse"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-full animate-pulse"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-4/6 animate-pulse"></div>
        </div>
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-auto flex justify-between items-center">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-20 animate-pulse"></div>
            <div className="flex space-x-2">
                <div className="h-8 w-8 bg-slate-100 dark:bg-slate-700 rounded-full animate-pulse"></div>
                <div className="h-8 w-8 bg-slate-100 dark:bg-slate-700 rounded-full animate-pulse"></div>
            </div>
        </div>
    </div>
);

const CategorySkeleton = () => (
    <div className="flex flex-wrap justify-center gap-2 my-8">
        {[...Array(6)].map((_, i) => (
            <div 
                key={i} 
                className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 50}ms`, opacity: 0.6 }}
            ></div>
        ))}
    </div>
);

const ProcessingIndicator = () => (
    <div className="flex flex-col items-center justify-center py-10 space-y-4">
        <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-fuchsia-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-violet-400 rounded-full animate-bounce"></div>
        </div>
        <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 animate-pulse">
                AI Knowledge Mapping
            </p>
            <p className="text-xs text-slate-500 mt-1 italic">Gemini is logically grouping concepts based on titles and descriptions...</p>
        </div>
    </div>
);

const AnalogiesPlaceholderImage = () => (
    <div className="max-w-md mx-auto my-8 text-slate-400 dark:text-slate-600">
        <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" aria-labelledby="placeholder-title" role="img">
            <title id="placeholder-title">Illustration of a complex idea turning into a simple one.</title>
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
            <path d="M70 50 C 85 40, 115 60, 130 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3,3" />
            <polygon points="128,47 135,50 128,53" className="text-violet-400" fill="currentColor" />
            <g transform="translate(160, 50)" className="text-amber-500 dark:text-amber-400">
                <path d="M-5,5 C-10,12 10,12 5,5 Q0,-5 -15,-10 C-20,-18 0,-25 0,-15 C0,-5 -5,-2 -5,5z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                <path d="M-7 8 H 7 V 15 H -7 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M-5 15 H 5 V 18 H -5 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M-3 18 V 20" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M3 18 V 20" fill="none" stroke="currentColor" strokeWidth="2" />
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
  label?: string;
}> = ({ rating, onRate, readOnly = false, label }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const stars = Array(5).fill(0);

  const starColor = (index: number) => {
    const currentRating = hoverRating || rating;
    if (currentRating > index) {
      return readOnly ? "text-amber-400" : "text-amber-500 cursor-pointer scale-110";
    }
    return readOnly ? "text-slate-200 dark:text-slate-700" : "text-slate-300 dark:text-slate-600 cursor-pointer";
  };

  return (
    <div 
        className="flex items-center" 
        onMouseLeave={() => !readOnly && setHoverRating(0)}
        role={readOnly ? "img" : "radiogroup"}
        aria-label={label || (readOnly ? `Rating: ${rating} stars` : "Rate this analogy")}
    >
      {stars.map((_, index) => (
        <button
          key={index}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onRate?.(index + 1)}
          onMouseEnter={() => !readOnly && setHoverRating(index + 1)}
          className={`focus:outline-none transition-transform duration-150 ${readOnly ? 'cursor-default' : 'hover:scale-125'}`}
          aria-label={readOnly ? undefined : `Rate ${index + 1} stars`}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-colors ${starColor(index)}`}
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        </button>
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
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div id={`analogy-card-${analogy.id}`} className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 group relative transform hover:scale-[1.02] ring-1 ring-slate-200 dark:ring-slate-700 flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300 filter blur-xl"></div>
      
      <div className="relative p-6 flex flex-col flex-grow">
        <div className="flex-grow">
            <h3 className="text-xl font-bold text-violet-600 dark:text-violet-400 mb-2 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">{analogy.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-3 text-sm line-clamp-3 italic">"{analogy.concept}"</p>
            <p className="text-slate-700 dark:text-slate-200 mb-4 line-clamp-6 text-[15px] leading-relaxed">
                <span className="font-bold text-violet-500/80 dark:text-violet-400/80">Analogy:</span> {analogy.analogy}
            </p>
        </div>
        
        <div className="mt-auto space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
          <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Community Helpfulness</span>
                  <div className="flex items-center gap-2">
                      <StarRating rating={analogy.averageRating} readOnly label={`Average rating: ${analogy.averageRating.toFixed(1)} stars`} />
                      <span className="text-slate-400 dark:text-slate-500 font-mono">{analogy.averageRating.toFixed(1)} ({analogy.totalRatings})</span>
                  </div>
              </div>
              <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-900/50 p-2 rounded-md">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Rating</span>
                  <StarRating 
                    rating={analogy.userRating || 0} 
                    onRate={(rating) => onRate(analogy.id, rating)} 
                    label="Rate how helpful this analogy was for you"
                  />
              </div>
          </div>
          
          <div className="flex justify-between items-center pt-2">
              <a href={analogy.url} target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-bold text-sm transition-colors flex items-center gap-1 group/link">
                  Detailed Article
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
              </a>
              <div className="flex items-center space-x-1">
                  <button 
                    onClick={handleCopy} 
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400 dark:text-slate-500 hover:text-violet-500" 
                    title={isCopied ? 'Copied!' : 'Copy to clipboard'}
                  >
                      {isCopied ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      )}
                  </button>
                  <button 
                    onClick={() => onSpeak(analogy)} 
                    className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-violet-500'}`}
                    title={isSpeaking ? 'Stop speaking' : 'Listen to analogy'}
                  >
                      {isSpeaking ? (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
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
        try { audioSourceRef.current.stop(); } catch (e) {}
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
    return () => stopCurrentSpeech();
  }, [stopCurrentSpeech]);

  const handleSpeak = async (analogy: Analogy) => {
    if (speakingAnalogyId === analogy.id) {
        stopCurrentSpeech();
        return;
    }
    if (speakingAnalogyId !== null) stopCurrentSpeech();
    
    setSpeakingAnalogyId(analogy.id);
    try {
        const { source, audioContext } = await playTextAsSpeech(`${analogy.title}. ${analogy.analogy}`);
        audioSourceRef.current = source;
        audioContextRef.current = audioContext;
        source.onended = () => {
            if (audioSourceRef.current === source) stopCurrentSpeech();
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
                    const oldTotal = analogy.totalRatings;
                    const oldAvg = analogy.averageRating;
                    const hasPreviousUserRating = !!analogy.userRating;
                    
                    let newTotal = oldTotal;
                    let newAvg = oldAvg;

                    if (!hasPreviousUserRating) {
                        newTotal = oldTotal + 1;
                        newAvg = ((oldAvg * oldTotal) + rating) / newTotal;
                    } else {
                        newAvg = ((oldAvg * oldTotal) - analogy.userRating! + rating) / oldTotal;
                    }

                    return { 
                        ...analogy, 
                        userRating: rating,
                        averageRating: newAvg,
                        totalRatings: newTotal
                    };
                }
                return analogy;
            });
        }
        return newGroups;
    });
  };

  const fetchAndSetCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const userRatings = JSON.parse(localStorage.getItem('analogyRatings') || '{}');
      const categoryMap = await generateCategories();
      
      const categorizedAnalogies = ANALOGY_DATA.map(a => {
        let category = 'General Concepts';
        
        // Match logic that handles minor casing or punctuation variations by normalizing strings
        const normalizedTitle = a.title.toLowerCase().trim();
        for (const domain in categoryMap) {
          const domainTitles = categoryMap[domain].map(t => t.toLowerCase().trim());
          if (domainTitles.includes(normalizedTitle)) {
            category = domain;
            break;
          }
        }
        
        const userRating = userRatings[a.id];
        let averageRating = a.averageRating;
        let totalRatings = a.totalRatings;

        if (userRating) {
            totalRatings += 1;
            averageRating = ((a.averageRating * a.totalRatings) + userRating) / totalRatings;
        }

        return { 
            ...a, 
            category, 
            userRating,
            averageRating,
            totalRatings
        };
      });
      
      const groups: Record<string, Analogy[]> = {};
      categorizedAnalogies.forEach(analogy => {
          if (!groups[analogy.category]) groups[analogy.category] = [];
          groups[analogy.category].push(analogy);
      });
      
      // Order categories by those returned by Gemini first, then fallbacks
      const sortedCategories = Object.keys(groups).sort((a, b) => {
          if (a === 'General Concepts') return 1;
          if (b === 'General Concepts') return -1;
          return a.localeCompare(b);
      });

      setGroupedAnalogies(groups);
      setCategoryOrder(sortedCategories);

    } catch (err: unknown) {
      console.error(err);
      setError('Gemini categorization unavailable. Showing standard list.');
      const userRatings = JSON.parse(localStorage.getItem('analogyRatings') || '{}');
      const allAnalogies = ANALOGY_DATA.map(a => ({...a, category: 'Uncategorized', userRating: userRatings[a.id]}));
      setGroupedAnalogies({ 'Analogy Collection': allAnalogies });
      setCategoryOrder(['Analogy Collection']);
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
        currentGroups = { [selectedCategory]: groupedAnalogies[selectedCategory] || [] };
    }

    if (!searchQuery) return { groups: currentGroups, order: currentOrder };

    const lowercasedQuery = searchQuery.toLowerCase().trim();
    const newGroups: Record<string, Analogy[]> = {};
    const newOrder: string[] = [];

    for (const category of categoryOrder) {
        const analogies = groupedAnalogies[category];
        if (analogies) {
            const filtered = analogies.filter(analogy =>
                analogy.title.toLowerCase().includes(lowercasedQuery) ||
                analogy.concept.toLowerCase().includes(lowercasedQuery) ||
                analogy.analogy.toLowerCase().includes(lowercasedQuery)
            );
            if (filtered.length > 0) {
                newGroups[category] = filtered;
                newOrder.push(category);
            }
        }
    }
    
    // Apply category filter on top of search if active
    const finalOrder = selectedCategory === 'All' ? newOrder : newOrder.filter(cat => cat === selectedCategory);
    
    return { groups: newGroups, order: finalOrder };
  }, [searchQuery, groupedAnalogies, categoryOrder, selectedCategory]);

  const handleFeelingLucky = () => {
    const allVisibleAnalogies = filteredData.order.flatMap(category => filteredData.groups[category] || []);
    if (allVisibleAnalogies.length === 0) return;
    const luckyAnalogy = allVisibleAnalogies[Math.floor(Math.random() * allVisibleAnalogies.length)];
    const element = document.getElementById(`analogy-card-${luckyAnalogy.id}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-4', 'ring-violet-500', 'transition-all', 'duration-500', 'z-10');
        setTimeout(() => element.classList.remove('ring-4', 'ring-violet-500'), 2500);
    }
  };

  return (
    <div className="space-y-8 transition-colors duration-300 pb-20">
        <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-500 dark:to-fuchsia-500 bg-clip-text text-transparent pb-2">Knowledge Domains</h1>
            <p className="mt-3 max-w-md mx-auto text-base text-slate-600 dark:text-slate-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Explore complex concepts organized into logical domains, each explained with intuitive real-world analogies.
            </p>
        </div>
        
        <AnalogiesPlaceholderImage />

        <div className="mt-8 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="search"
                    placeholder="Search for a concept (e.g. AI, DevOps, API)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
                />
            </div>
            <button
                onClick={handleFeelingLucky}
                className="w-full sm:w-auto px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all whitespace-nowrap flex items-center justify-center gap-2 group"
            >
                <span className="group-hover:rotate-12 transition-transform">🎲</span>
                Pick Random
            </button>
        </div>

      {isLoading ? (
        <div className="max-w-7xl mx-auto px-4">
            <ProcessingIndicator />
            <CategorySkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array(6).fill(0).map((_, i) => <CardSkeleton key={i} index={i} />)}
            </div>
        </div>
      ) : (
        <>
            <div className="flex flex-wrap justify-center gap-2 my-8 sticky top-20 z-40 py-2 bg-slate-900/10 backdrop-blur-sm rounded-full px-4">
                {['All', ...categoryOrder].map(category => (
                    <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-200 border ${
                        selectedCategory === category
                        ? 'bg-violet-600 border-violet-500 text-white shadow-lg scale-105'
                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border-slate-200 dark:border-slate-700'
                    }`}
                    >
                    {category}
                    </button>
                ))}
            </div>

            <div className="space-y-20 mt-12">
            {error && (
                <div className="text-center p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
                    <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">{error}</p>
                </div>
            )}
            {filteredData.order.length > 0 ? (
                filteredData.order.map(category => (
                    <section key={category} className="scroll-mt-32">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-8 w-1 bg-gradient-to-b from-violet-600 to-fuchsia-600 rounded-full"></div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                                {category}
                            </h2>
                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 opacity-50"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filteredData.groups[category].length} items</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredData.groups[category].map(analogy => (
                                <AnalogyCard 
                                    key={analogy.id} 
                                    analogy={analogy} 
                                    onSpeak={handleSpeak} 
                                    isSpeaking={speakingAnalogyId === analogy.id} 
                                    onRate={handleRateAnalogy} 
                                />
                            ))}
                        </div>
                    </section>
                ))
            ) : (
                <div className="text-center py-24 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-40">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-400 tracking-tight">No results found</h3>
                    <p className="text-slate-500 mt-2 text-sm">We couldn't find any analogies matching "{searchQuery}" in this category.</p>
                    <button 
                        onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
                        className="mt-6 text-violet-500 font-bold text-xs uppercase tracking-widest hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
            </div>
        </>
      )}
      
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}