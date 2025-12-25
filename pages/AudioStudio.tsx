import React, { useState, useRef, useEffect } from 'react';
import { generatePodcast } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/helpers';

const HostAvatar: React.FC<{ name: string, color: string, isSpeaking: boolean }> = ({ name, color, isSpeaking }) => (
    <div className="flex flex-col items-center space-y-3">
        <div className={`relative w-24 h-24 rounded-full flex items-center justify-center border-4 ${color} ${isSpeaking ? 'scale-110 shadow-xl' : 'scale-100'} transition-all duration-300 bg-white dark:bg-slate-700 shadow-md`}>
            {name === 'Alex' ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 ${isSpeaking ? 'text-violet-600 dark:text-violet-400' : 'text-slate-300 dark:text-slate-600'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 ${isSpeaking ? 'text-violet-600 dark:text-violet-400' : 'text-slate-300 dark:text-slate-600'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
            )}
           {isSpeaking && (
               <span className="absolute -bottom-1 right-0 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
           )}
        </div>
        <p className={`text-sm font-bold tracking-widest uppercase ${isSpeaking ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>{name}</p>
    </div>
);

export default function AudioStudio() {
    const [topic, setTopic] = useState('');
    const [style, setStyle] = useState('Casual Friends');
    const [transcript, setTranscript] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeSpeaker, setActiveSpeaker] = useState<'Alex' | 'Jamie' | null>(null);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);
    
    const handleGenerate = async () => {
        if (!topic.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        stopAudio();

        try {
            const { base64Audio, transcript: genTranscript } = await generatePodcast(topic, style);
            setTranscript(genTranscript);
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const audioBytes = decode(base64Audio);
            const buffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyser.connect(audioContextRef.current.destination);
            sourceRef.current = source;
            analyserRef.current = analyser;
            source.onended = () => { setIsPlaying(false); setActiveSpeaker(null); };
            source.start(0);
            setIsPlaying(true);
            animateVisuals();
        } catch (err: any) {
            setError(err.message || "Failed to create podcast.");
        } finally {
            setIsLoading(false);
        }
    };

    const stopAudio = () => {
        if (sourceRef.current) { try { sourceRef.current.stop(); } catch(e) {} sourceRef.current = null; }
        if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        setIsPlaying(false);
        setActiveSpeaker(null);
    };

    const animateVisuals = () => {
        if (!analyserRef.current || !isPlaying) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for(let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        if (avg > 15) {
             if (Math.random() > 0.96) setActiveSpeaker(prev => prev === 'Alex' ? 'Jamie' : 'Alex');
             if (!activeSpeaker) setActiveSpeaker('Alex');
        } else { setActiveSpeaker(null); }
        animationRef.current = requestAnimationFrame(animateVisuals);
    };
    
    useEffect(() => { return () => stopAudio(); }, []);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 md:p-12 rounded-2xl shadow-xl ring-1 ring-slate-200 dark:ring-slate-700">
            <div className="text-center mb-12">
                 <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Audio Studio</h1>
                 <p className="text-slate-600 dark:text-slate-400 text-lg">Turn any topic into an engaging conversational analogy.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="space-y-8">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">Topic</label>
                        <input 
                            type="text" 
                            value={topic} 
                            onChange={e => setTopic(e.target.value)}
                            placeholder="e.g. Serverless Architecture"
                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-200 shadow-inner"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">Host Style</label>
                        <select 
                            value={style} 
                            onChange={e => setStyle(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-200 shadow-inner"
                        >
                            <option>Casual Friends</option>
                            <option>Professor & Student</option>
                            <option>Sci-Fi Explorers</option>
                            <option>Cooking Show Hosts</option>
                        </select>
                    </div>
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading || !topic}
                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50 transition-all flex justify-center items-center gap-3"
                    >
                        {isLoading ? <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> Producing...</> : 'Generate Audio'}
                    </button>
                    {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>}
                </div>

                <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 ring-1 ring-slate-200 dark:ring-slate-700 flex flex-col min-h-[400px]">
                    <div className="flex justify-around items-center mb-12">
                        <HostAvatar name="Alex" color="border-cyan-500/30" isSpeaking={activeSpeaker === 'Alex'} />
                        <div className="flex items-center gap-1.5 h-16 px-4">
                             {[...Array(8)].map((_, i) => (
                                 <div key={i} className={`w-1.5 bg-violet-500/50 rounded-full transition-all duration-100 ${isPlaying ? 'animate-pulse' : 'h-1'}`} style={{ height: isPlaying ? `${Math.random() * 100}%` : '4px' }}></div>
                             ))}
                        </div>
                        <HostAvatar name="Jamie" color="border-fuchsia-500/30" isSpeaking={activeSpeaker === 'Jamie'} />
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[300px] space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                        {transcript ? (
                            transcript.split('\n').filter(line => line.trim()).map((line, idx) => {
                                const isAlex = line.toLowerCase().startsWith('alex:');
                                return (
                                    <div key={idx} className={`p-4 rounded-2xl max-w-[85%] shadow-sm border ${isAlex ? 'bg-white dark:bg-slate-800 mr-auto border-cyan-100 dark:border-cyan-900/20' : 'bg-white dark:bg-slate-800 ml-auto border-fuchsia-100 dark:border-fuchsia-900/20'}`}>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{line}</p>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 opacity-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                <p className="font-medium">The studio is quiet. Enter a topic to begin.</p>
                            </div>
                        )}
                    </div>
                    
                    {isPlaying && (
                        <button onClick={stopAudio} className="absolute top-6 right-6 p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:scale-110 transition-transform shadow-sm">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}