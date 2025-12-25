import React, { useState, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import { fileToBase64 } from '../utils/helpers';

export default function VideoStudio() {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiKeySelected, setApiKeySelected] = useState(false);

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio) {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySelected(hasKey);
            }
        };
        checkApiKey();
    }, []);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setApiKeySelected(true);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!imageFile || isLoading) {
             setError("Please upload a starting image.");
             return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const base64Image = await fileToBase64(imageFile);
            const videoUrl = await generateVideo(prompt, { imageBytes: base64Image, mimeType: imageFile.type }, aspectRatio);
            setResult(videoUrl);
        } catch (err: any) {
            if (err.message?.includes("Requested entity was not found")) {
                setError("API Key verification failed. Please re-select your key.");
                setApiKeySelected(false);
            } else {
                setError(err.message || 'The video engine hit a snag. Please check your prompt and try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!apiKeySelected) {
        return (
            <div className="text-center bg-white dark:bg-slate-800 p-12 rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 max-w-2xl mx-auto my-12">
                <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-4">Paid API Key Required</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">Video generation models require a paid Google Cloud project key. Please select your key to unlock the Video Studio.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={handleSelectKey} className="px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all">
                        Select API Key
                    </button>
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="px-8 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                        View Billing Docs
                    </a>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-slate-800 p-6 md:p-12 rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3">AI Video Studio</h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">Turn static analogies into immersive visual experiences. Simply upload a frame and describe the evolution.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-8">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">1. Upload Frame</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 dark:border-slate-700 border-dashed rounded-2xl bg-slate-50 dark:bg-slate-900 transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                            <div className="space-y-4 text-center">
                                {preview ? (
                                    <div className="relative group/preview">
                                        <img src={preview} alt="Preview" className="mx-auto h-48 w-auto object-contain rounded-xl shadow-lg ring-1 ring-slate-200 dark:ring-slate-700"/>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 rounded-xl flex items-center justify-center transition-opacity">
                                            <span className="text-white font-bold text-xs">Click to Change</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8">
                                        <svg className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-700" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        <p className="mt-2 text-sm text-slate-500 font-medium">PNG, JPG, or WEBP</p>
                                    </div>
                                )}
                                <label className="relative cursor-pointer bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-bold px-4 py-2 rounded-lg text-xs hover:scale-105 transition-transform inline-block">
                                    <span>{preview ? 'Change Image' : 'Select Image'}</span>
                                    <input type="file" className="sr-only" onChange={handleFileChange} accept="image/*"/>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">2. Action Prompt</label>
                        <textarea rows={3} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g., The light inside the bulb begins to glow and neural pathways branch out..." className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900 dark:text-slate-200 shadow-inner resize-none transition-shadow" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Aspect Ratio</label>
                            <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as '16:9' | '9:16')} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-200 font-bold text-sm">
                                <option value="16:9">Landscape (16:9)</option>
                                <option value="9:16">Portrait (9:16)</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={handleSubmit} disabled={isLoading || !imageFile} className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black uppercase tracking-widest rounded-xl shadow-xl hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center text-xs">
                                {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>}
                                {isLoading ? 'Rendering...' : 'Generate Video'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-3xl min-h-[450px] p-6 ring-1 ring-slate-200 dark:ring-slate-700 shadow-inner overflow-hidden">
                    {error && (
                        <div className="text-center p-8">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p className="text-red-600 dark:text-red-400 font-bold text-sm">{error}</p>
                        </div>
                    )}
                    
                    {result ? (
                        <div className="w-full space-y-4">
                            <video src={result} controls autoPlay loop className="w-full h-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700"/>
                            <a href={result} download="LTA_Generation.mp4" className="block text-center text-xs font-bold text-violet-600 hover:underline">Download MP4 File</a>
                        </div>
                    ) : !isLoading && !error && (
                        <div className="text-center opacity-30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 00-2 2z" />
                            </svg>
                            <p className="font-bold text-sm tracking-widest uppercase">Theater Awaiting Input</p>
                        </div>
                    )}
                    
                    {isLoading && (
                        <div className="text-center">
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-slate-900 dark:text-slate-100 font-black text-xl animate-pulse">Cinematic Rendering...</p>
                                <div className="flex flex-col gap-2">
                                    <div className="h-1.5 w-48 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto overflow-hidden">
                                        <div className="h-full bg-violet-500 animate-[progress_10s_ease-in-out_infinite]"></div>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est: 1-2 Minutes</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes progress {
                    0% { width: 0%; }
                    50% { width: 80%; }
                    100% { width: 100%; }
                }
            `}} />
        </div>
    );
}