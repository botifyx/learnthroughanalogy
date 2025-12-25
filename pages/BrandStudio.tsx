import React, { useState } from 'react';
import { generateImage, generateColorPalette, ColorPaletteItem } from '../services/geminiService';

const LOGO_STYLES = [
  { id: 'minimalist', name: 'Minimalist', prompt: 'a minimalist, clean, vector logo. simple shapes, modern flat design' },
  { id: 'iconic', name: 'Iconic', prompt: 'an iconic, memorable emblem style logo. strong silhouette, professional' },
  { id: 'abstract', name: 'Abstract', prompt: 'an abstract brand mark. geometric patterns, creative symbolism for knowledge and bridge' },
  { id: 'illustrative', name: 'Illustrative', prompt: 'a sophisticated illustrative logo. fine lines, elegant and educational' },
];

export default function BrandStudio() {
  const [selectedStyle, setSelectedStyle] = useState(LOGO_STYLES[0].id);
  const [customDescription, setCustomDescription] = useState('');
  const [logoResult, setLogoResult] = useState<string | null>(null);
  const [paletteResult, setPaletteResult] = useState<ColorPaletteItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopiedColor(hex);
      setTimeout(() => setCopiedColor(null), 2000);
    });
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setLogoResult(null);
    setPaletteResult(null);

    const styleObj = LOGO_STYLES.find(s => s.id === selectedStyle);
    const stylePrompt = styleObj?.prompt;
    
    // Updated prompt for a more vibrant and youth-friendly educational branding
    const finalLogoPrompt = `Vibrant, friendly, and energetic logo for a youth-oriented educational brand named "Learn Through Analogy". The design should be playful yet professional, representing the bridge between complex knowledge and simple clarity using a vivid, high-contrast color palette with popping colors. Style: ${stylePrompt}. ${customDescription}. High quality, 4k, vector-like, suitable for light and dark modes. Ensure no text is misspelled.`;

    try {
      // Parallel execution for better performance
      const [logoUrl, palette] = await Promise.all([
        generateImage(finalLogoPrompt, '1:1'),
        generateColorPalette(styleObj?.name || 'Modern', `Create a vibrant, youthful, and high-energy color palette suitable for an educational platform. ${customDescription}`)
      ]);
      
      setLogoResult(logoUrl);
      setPaletteResult(palette);
    } catch (err: any) {
      setError(err.message || 'Failed to generate brand identity.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-24 px-4 sm:px-0">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold sm:text-5xl bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-500 dark:to-fuchsia-500 bg-clip-text text-transparent pb-2 leading-tight">
          Brand Identity Studio
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
          Envision the perfect identity for Learn Through Analogy. Generate professional logos and cohesive color palettes in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
        {/* Configuration Panel */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4">
              Step 1: Choose Style
            </label>
            <div className="grid grid-cols-2 gap-3">
              {LOGO_STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`px-4 py-3 rounded-xl border-2 transition-all text-sm font-semibold ${
                    selectedStyle === style.id
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 shadow-sm'
                      : 'border-slate-100 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4">
              Step 2: Add Details (Optional)
            </label>
            <textarea
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="e.g., Use deep emerald and gold accents, focus on connection and neural pathways..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900 dark:text-slate-200 resize-none h-32 transition-all shadow-inner"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg hover:opacity-95 active:scale-[0.98] disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 text-lg"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Brand...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Generate Brand Identity
              </>
            )}
          </button>
          
          {error && (
             <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
             </div>
          )}
        </div>

        {/* Display Panel */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col min-h-[500px] ring-1 ring-slate-200 dark:ring-slate-700 transition-colors">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative w-48 h-48 mx-auto">
                    <div className="absolute inset-0 border-4 border-violet-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-4 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-violet-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                    </div>
                </div>
                <div>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-100">Designing your identity...</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 italic">Harmonizing colors and concepts</p>
                </div>
              </div>
            ) : logoResult ? (
              <div className="w-full space-y-10">
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 text-center">Brand Mark</h3>
                    <img
                        src={logoResult}
                        alt="Generated Logo Concept"
                        className="w-full max-w-sm mx-auto h-auto rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 group-hover:scale-[1.01] transition-transform"
                    />
                </div>

                {paletteResult && (
                    <div className="space-y-6">
                         <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 text-center">Brand Palette</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                            {paletteResult.map((color, idx) => (
                                <div key={idx} className="flex flex-col items-center group/color">
                                    <div className="relative mb-2">
                                        <button 
                                            onClick={() => handleCopyColor(color.hex)}
                                            className="w-16 h-16 rounded-2xl shadow-md border border-slate-200 dark:border-slate-600 transition-all duration-300 hover:scale-110 active:scale-95 relative overflow-hidden flex items-center justify-center group/swatch hover:shadow-lg hover:ring-4"
                                            style={{ 
                                                backgroundColor: color.hex,
                                                '--tw-ring-color': `${color.hex}44` 
                                            } as React.CSSProperties}
                                            title={`Copy ${color.hex}`}
                                        >
                                            {/* Interaction Overlays */}
                                            <div className="absolute inset-0 bg-black/0 group-hover/swatch:bg-black/20 transition-colors duration-300"></div>
                                            
                                            {/* Copy Feedback / Instruction */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/swatch:opacity-100 transition-opacity duration-300">
                                                {copiedColor === color.hex ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/80 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 00-2 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                    </svg>
                                                )}
                                            </div>
                                        </button>
                                        
                                        {/* Hover Tooltip */}
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover/color:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                            {copiedColor === color.hex ? 'Copied!' : 'Click to copy'}
                                        </div>
                                    </div>
                                    
                                    <span className="text-[10px] font-bold text-slate-900 dark:text-slate-100 truncate w-full text-center transition-colors group-hover/color:text-violet-500" title={color.name}>
                                        {color.name}
                                    </span>
                                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter group-hover/color:text-slate-600 dark:group-hover:text-slate-200">
                                        {color.hex}
                                    </span>
                                </div>
                            ))}
                         </div>
                         <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl space-y-3 shadow-inner">
                            {paletteResult.map((color, idx) => (
                                <div key={idx} className="flex items-start gap-3 group/usage">
                                    <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 transition-transform group-hover/usage:scale-125" style={{ backgroundColor: color.hex }}></div>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                        <span className="font-bold text-slate-800 dark:text-slate-200 transition-colors group-hover/usage:text-violet-500">{color.name}:</span> {color.usage}
                                    </p>
                                </div>
                            ))}
                         </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <a
                        href={logoResult}
                        download="LTA_Logo_Concept.png"
                        className="flex-1 py-3 px-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-center hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Mark
                    </a>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Ready to Visualize?</h3>
                <p className="text-slate-500 dark:text-slate-400">Select a style and describe your vision to see high-fidelity logo concepts and color palettes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
