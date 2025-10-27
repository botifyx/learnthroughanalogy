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
            setApiKeySelected(true); // Assume success after dialog
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
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
                setError("API Key error. Please re-select your key.");
                setApiKeySelected(false);
            } else {
                setError(err.message || 'An error occurred during video generation.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!apiKeySelected) {
        return (
            <div className="text-center bg-white dark:bg-slate-800/50 p-8 rounded-lg ring-1 ring-slate-200 dark:ring-slate-700">
                <h2 className="text-2xl font-bold mb-4">API Key Required</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">This feature requires an API key for video generation. Please select a key to continue.</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">For more information, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline">billing documentation</a>.</p>
                <button onClick={handleSelectKey} className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90">
                    Select API Key
                </button>
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-slate-800/50 p-6 md:p-8 rounded-lg shadow-xl ring-1 ring-slate-200 dark:ring-slate-700">
            <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">AI Video Studio</h1>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6">Bring your images to life. Generate a video from an image and a prompt.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Upload Starting Image*</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {preview ? <img src={preview} alt="Preview" className="mx-auto h-32 w-auto object-contain rounded-md"/> : <svg className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-200 dark:bg-slate-700 rounded-md font-medium text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 px-2"><span>Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*"/></label>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Prompt (Optional)</label>
                        <textarea id="prompt" rows={3} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g., The robot starts waving..." className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-800 dark:text-white"></textarea>
                    </div>
                    
                    <div>
                        <label htmlFor="aspectRatio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Aspect Ratio</label>
                        <select id="aspectRatio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as '16:9' | '9:16')} className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-800 dark:text-white">
                            <option value="16:9">16:9 (Landscape)</option>
                            <option value="9:16">9:16 (Portrait)</option>
                        </select>
                    </div>

                    <button onClick={handleSubmit} disabled={isLoading || !imageFile} className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:opacity-100 disabled:cursor-not-allowed transition-opacity flex items-center justify-center">
                        {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>}
                        {isLoading ? 'Generating Video...' : 'Generate Video'}
                    </button>
                </div>

                <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-900/50 rounded-lg min-h-[400px] p-4">
                    {error && <p className="text-red-500 dark:text-red-400 text-center">{error}</p>}
                    {result ? <video src={result} controls autoPlay loop className="max-w-full max-h-full object-contain rounded-md"/> : !isLoading && <p className="text-slate-400 dark:text-slate-500">Your video will appear here</p>}
                    {isLoading && (
                        <div className="text-center text-slate-500 dark:text-slate-400">
                            <div className="animate-pulse mb-4">Video generation can take a few minutes...</div>
                            <ul className="list-disc list-inside text-sm">
                                <li>Brewing pixels...</li>
                                <li>Teaching robots to dance...</li>
                                <li>Finalizing the masterpiece...</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}