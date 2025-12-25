import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage, GroundedSource } from '../types';

const AIAvatar = () => (
  <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-violet-100 to-violet-200 dark:from-slate-700 dark:to-slate-800 ring-2 ring-violet-200 dark:ring-slate-600 flex items-center justify-center shadow-sm">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 017.072 0m-11.314 0a5 5 0 007.072 0M12 21v-1m-6.364-1.636l.707-.707" /></svg>
  </div>
);

const UserAvatar = () => (
  <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-slate-700 dark:to-slate-800 ring-2 ring-cyan-200 dark:ring-slate-600 flex items-center justify-center shadow-sm">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  </div>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
);

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isModel = message.role === 'model';
  return (
    <div className={`flex items-end gap-3 ${isModel ? 'justify-start' : 'justify-end'}`}>
      {isModel && <AIAvatar />}
      <div className={`w-full max-w-xl order-1 ${isModel ? 'flex flex-col items-start' : 'flex flex-col items-end'}`}>
        <div className={`px-5 py-4 rounded-2xl shadow-sm border ${
            isModel 
            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-100 dark:border-slate-600 rounded-bl-none' 
            : 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white border-transparent rounded-br-none'
        }`}>
            <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{message.text}</p>
            {message.sources && message.sources.length > 0 && (
                <div className="mt-4 border-t border-slate-100 dark:border-slate-600 pt-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Sources</h4>
                    <ul className="text-xs space-y-1.5">
                    {message.sources.map((source, index) => (
                        <li key={index} className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:text-violet-600 dark:text-violet-400 hover:underline truncate font-medium">
                                {source.title || source.uri}
                            </a>
                        </li>
                    ))}
                    </ul>
                </div>
            )}
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 px-1">{message.timestamp}</p>
      </div>
       {!isModel && <UserAvatar />}
    </div>
  );
};

const TypingIndicator: React.FC = () => (
    <div className="flex items-end gap-3 justify-start">
      <AIAvatar />
      <div className="w-full max-w-xl">
        <div className="px-5 py-4 rounded-2xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-bl-none shadow-sm h-12 flex items-center">
          <div className="flex items-center justify-start space-x-1.5">
            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
);

const ChatOptionToggle: React.FC<{label: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ label, checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer group">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-violet-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-violet-600"></div>
        <span className="ml-2 text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors">{label}</span>
    </label>
);

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useGrounding, setUseGrounding] = useState(false);
  const [useLocation, setUseLocation] = useState(false);
  const [deepThought, setDeepThought] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (useLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setError(`Location Access Denied: ${err.message}`);
          setUseLocation(false);
        }
      );
    } else {
      setUserLocation(null);
    }
  }, [useLocation]);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { 
        role: 'user', 
        text: input, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = deepThought ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
      
      const tools: any[] = [];
      if(useGrounding) tools.push({ googleSearch: {} });
      if(useLocation && userLocation) tools.push({ googleMaps: {} });

      const config: any = {};
      if (tools.length > 0) config.tools = tools;
      if (useLocation && userLocation) {
        config.toolConfig = { retrievalConfig: { latLng: userLocation } };
      }
      if (deepThought) {
        config.thinkingConfig = { thinkingBudget: 24576 };
      }
      
      const response = await ai.models.generateContent({
        model,
        contents: input,
        config
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: GroundedSource[] = groundingChunks
        .map((chunk: any) => ({
          title: chunk.web?.title || chunk.maps?.title,
          uri: chunk.web?.uri || chunk.maps?.uri,
        }))
        .filter((source: GroundedSource) => source.uri);

      const modelMessage: ChatMessage = { 
        role: 'model', 
        text: response.text, 
        sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err: any) {
      setError(err.message || 'The AI had a creative block. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden transition-all">
        <div className="p-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">AI Assistant</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Knowledge Explorer Mode</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <ChatOptionToggle label="Web" checked={useGrounding} onChange={e => setUseGrounding(e.target.checked)} />
                <ChatOptionToggle label="Maps" checked={useLocation} onChange={e => setUseLocation(e.target.checked)} />
                <ChatOptionToggle label="Deep" checked={deepThought} onChange={e => setDeepThought(e.target.checked)} />
            </div>
        </div>
      <div ref={chatContainerRef} className="flex-1 p-6 space-y-6 overflow-y-auto bg-white dark:bg-slate-800/50 scroll-smooth">
        {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-violet-500 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <div className="max-w-xs">
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Start a new journey.</p>
                    <p className="text-sm text-slate-500">Ask about any concept, and I'll find the perfect analogy for you.</p>
                </div>
            </div>
        )}
        {messages.map((msg, index) => <ChatBubble key={index} message={msg} />)}
        {isLoading && <TypingIndicator />}
      </div>
      <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        {error && <div className="mb-4 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg border border-red-100 dark:border-red-800/50 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Explore something new..."
            className="flex-1 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900 dark:text-slate-200 transition-shadow shadow-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-2xl shadow-xl hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
}