import React, { useState } from 'react';
import { generateImage, editImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/helpers';

export default function ImageStudio() {
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!prompt.trim() || isLoading) return;
    if (mode === 'edit' && !imageFile) { setError("Please upload an image."); return; }
    setIsLoading(true); setError(null); setResult(null);
    try {
      let imageUrl: string;
      if (mode === 'generate') { imageUrl = await generateImage(prompt, aspectRatio); }
      else { const base64Image = await fileToBase64(imageFile!); imageUrl = await editImage(prompt, base64Image, imageFile!.type); }
      setResult(imageUrl);
    } catch (err: any) { setError(err.message || 'An error occurred.'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-12 rounded-2xl shadow-xl ring-1 ring-slate-200 dark:ring-slate-700">
      <h1 className="text-4xl font-extrabold text-center mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Image Studio</h1>
      <p className="text-center text-slate-600 dark:text-slate-400 mb-10">Visualize concepts with AI-powered generation and editing.</p>
      
      <div className="flex justify-center mb-10 border-b border-slate-100 dark:border-slate-700">
        <button onClick={() => setMode('generate')} className={`px-8 py-3 text-sm font-bold uppercase tracking-widest transition-all ${mode === 'generate' ? 'border-b-4 border-violet-500 text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}>Generate</button>
        <button onClick={() => setMode('edit')} className={`px-8 py-3 text-sm font-bold uppercase tracking-widest transition-all ${mode === 'edit' ? 'border-b-4 border-violet-500 text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}>Edit</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          {mode === 'edit' && (
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">Upload Base</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 dark:border-slate-700 border-dashed rounded-xl bg-slate-50 dark:bg-slate-900 transition-colors">
                <div className="space-y-1 text-center">
                  {preview ? <img src={preview} alt="Preview" className="mx-auto h-32 w-auto object-contain rounded-lg"/> : <svg className="mx-auto h-12 w-12 text-slate-300" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  <div className="flex text-sm justify-center">
                    <label className="relative cursor-pointer text-violet-600 font-bold hover:underline"><span>Upload a file</span><input type="file" className="sr-only" onChange={handleFileChange} accept="image/*"/></label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">Prompt</label>
            <textarea rows={4} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={mode === 'generate' ? "A futuristic classroom where planets are holographic..." : "Change the color palette to sunset tones..."} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-slate-200 shadow-inner" />
          </div>
          
          <button onClick={handleSubmit} disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
            {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>}
            {isLoading ? 'Dreaming...' : (mode === 'generate' ? 'Create Image' : 'Apply AI Edit')}
          </button>
        </div>
        <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl min-h-[400px] p-6 ring-1 ring-slate-200 dark:ring-slate-700 shadow-inner">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {result ? <img src={result} alt="Result" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-all duration-500 scale-100 hover:scale-[1.02]"/> : !isLoading && <p className="text-slate-400 font-medium">Visualization will appear here</p>}
          {isLoading && <div className="animate-pulse text-violet-500 font-bold">Generating Magic...</div>}
        </div>
      </div>
    </div>
  );
}