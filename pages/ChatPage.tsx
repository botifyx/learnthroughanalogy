import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage, GroundedSource } from '../types';

const AIAvatar = () => (
  <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 ring-2 ring-slate-300 dark:ring-slate-600 flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-500 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 017.072 0m-11.314 0a5 5 0 007.072 0M12 21v-1m-6.364-1.636l.707-.707" /></svg>
  </div>
);

const UserAvatar = () => (
  <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 ring-2 ring-slate-300 dark:ring-slate-600 flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-500 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
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
        <div className={`px-4 py-3 rounded-xl shadow-md ${isModel ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-none' : 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-br-none'}`}>
            <p className="whitespace-pre-wrap">{message.text}</p>
            {message.sources && message.sources.length > 0 && (
                <div className="mt-4 border-t border-slate-300 dark:border-slate-600/50 pt-3">
                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Sources:</h4>
                    <ul className="text-xs space-y-1">
                    {message.sources.map((source, index) => (
                        <li key={index} className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-violet-500 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-300 hover:underline truncate">
                                {source.title || source.uri}
                            </a>
                        </li>
                    ))}
                    </ul>
                </div>
            )}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 px-1">{message.timestamp}</p>
      </div>
       {!isModel && <UserAvatar />}
    </div>
  );
};

const TypingIndicator: React.FC = () => (
    <div className="flex items-end gap-3 justify-start">
      <AIAvatar />
      <div className="w-full max-w-xl">
        <div className="px-4 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 rounded-bl-none shadow-md">
          <div className="flex items-center justify-start space-x-1.5 h-5">
            <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-slate-500 dark:bg-slate-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
);

const ChatOptionToggle: React.FC<{label: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ label, checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-9 h-5 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-violet-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
        <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
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
          setError(`Location Error: ${err.message}`);
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
      const model = deepThought ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
      
      const tools: any[] = [];
      if(useGrounding) tools.push({ googleSearch: {} });
      if(useLocation && userLocation) tools.push({ googleMaps: {} });

      const config: any = {};
      if (tools.length > 0) config.tools = tools;
      if (useLocation && userLocation) {
        config.toolConfig = { retrievalConfig: { latLng: userLocation } };
      }
      if (deepThought) {
        config.thinkingConfig = { thinkingBudget: 32768 };
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
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white dark:bg-slate-800/50 rounded-lg shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">AI Chat Assistant</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Powered by Gemini</p>
        </div>
      <div ref={chatContainerRef} className="flex-1 p-6 space-y-6 overflow-y-auto">
        {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
                <AIAvatar />
                <p className="mt-4 text-lg">Ask me anything!</p>
                <p className="text-sm">I can search the web, use your location, and think deeply.</p>
            </div>
        )}
        {messages.map((msg, index) => <ChatBubble key={index} message={msg} />)}
        {isLoading && <TypingIndicator />}
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
        {error && <p className="text-red-500 dark:text-red-400 text-sm mb-2 text-center">{error}</p>}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-3 text-sm text-slate-600 dark:text-slate-300">
            <ChatOptionToggle label="Web Search" checked={useGrounding} onChange={e => setUseGrounding(e.target.checked)} />
            <ChatOptionToggle label="Use Location" checked={useLocation} onChange={e => setUseLocation(e.target.checked)} />
            <ChatOptionToggle label="Deep Thought" checked={deepThought} onChange={e => setDeepThought(e.target.checked)} />
        </div>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 p-3 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-800 dark:text-white transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:opacity-100 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
}