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
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;
    if (mode === 'edit' && !imageFile) {
        setError("Please upload an image to edit.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let imageUrl: string;
      if (mode === 'generate') {
        imageUrl = await generateImage(prompt, aspectRatio);
      } else {
        const base64Image = await fileToBase64(imageFile!);
        imageUrl = await editImage(prompt, base64Image, imageFile!.type);
      }
      setResult(imageUrl);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 md:p-8 rounded-lg shadow-xl ring-1 ring-slate-200 dark:ring-slate-700">
      <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">AI Image Studio</h1>
      <p className="text-center text-slate-500 dark:text-slate-400 mb-6">Create and modify images with the power of AI.</p>
      
      <div className="flex justify-center mb-6 border-b border-slate-200 dark:border-slate-700">
        <button onClick={() => setMode('generate')} className={`px-6 py-2 text-lg font-medium transition-colors ${mode === 'generate' ? 'border-b-2 border-violet-500 text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Generate</button>
        <button onClick={() => setMode('edit')} className={`px-6 py-2 text-lg font-medium transition-colors ${mode === 'edit' ? 'border-b-2 border-violet-500 text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Edit</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          {mode === 'edit' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Upload Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {preview ? <img src={preview} alt="Preview" className="mx-auto h-32 w-auto object-contain rounded-md"/> : <svg className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  <div className="flex text-sm text-slate-500 dark:text-slate-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-200 dark:bg-slate-700 rounded-md font-medium text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-slate-800 focus-within:ring-violet-500 px-2"><span>Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*"/></label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-600">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Prompt</label>
            <textarea id="prompt" rows={4} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={mode === 'generate' ? "e.g., A photo of a raccoon wearing a tiny wizard hat..." : "e.g., Add a retro filter to the image..."} className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-800 dark:text-white"></textarea>
          </div>
          
          {mode === 'generate' && (
            <div>
              <label htmlFor="aspectRatio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Aspect Ratio</label>
              <select id="aspectRatio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-800 dark:text-white">
                <option>1:1</option><option>3:4</option><option>4:3</option><option>9:16</option><option>16:9</option>
              </select>
            </div>
          )}

          <button onClick={handleSubmit} disabled={isLoading} className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:opacity-100 disabled:cursor-not-allowed transition-opacity flex items-center justify-center">
            {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>}
            {isLoading ? 'Processing...' : (mode === 'generate' ? 'Generate' : 'Apply Edit')}
          </button>
        </div>
        <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-900/50 rounded-lg min-h-[400px] p-4">
          {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
          {result ? <img src={result} alt="Generated result" className="max-w-full max-h-full object-contain rounded-md"/> : !isLoading && <p className="text-slate-400 dark:text-slate-500">Your result will appear here</p>}
          {isLoading && <div className="animate-pulse text-slate-500 dark:text-slate-400">AI is working its magic...</div>}
        </div>
      </div>
    </div>
  );
}