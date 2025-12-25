import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { ChatMessage } from '../types';
import { STANDARD_ANALOGIES } from '../constants';

const AIAvatar = () => (
  <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-violet-100 to-violet-200 dark:from-slate-700 dark:to-slate-800 ring-2 ring-violet-200 dark:ring-slate-600 flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 017.072 0m-11.314 0a5 5 0 007.072 0M12 21v-1m-6.364-1.636l.707-.707" /></svg>
  </div>
);

const UserAvatar = () => (
  <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-slate-700 dark:to-slate-800 ring-2 ring-cyan-200 dark:ring-slate-600 flex items-center justify-center">
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
      <div className={`w-full max-w-2xl order-1 ${isModel ? 'flex flex-col items-start' : 'flex flex-col items-end'}`}>
        <div className={`px-4 py-3 rounded-xl shadow-sm ${isModel ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none' : 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-br-none'}`}>
            <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-1 px-1">{message.timestamp}</p>
      </div>
       {!isModel && <UserAvatar />}
    </div>
  );
};

const TypingIndicator: React.FC = () => (
    <div className="flex items-end gap-3 justify-start">
      <AIAvatar />
      <div className="w-full max-w-2xl">
        <div className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 rounded-bl-none shadow-sm">
          <div className="flex items-center justify-start space-x-1.5 h-5">
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
);

export default function AnalogySandbox() {
  const [selectedAnalogy, setSelectedAnalogy] = useState<string>('');
  const [customTopic, setCustomTopic] = useState('');
  const [isChatStarted, setIsChatStarted] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const activeAnalogyRef = useRef<string>('');

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleStartChat = async () => {
    if (!selectedAnalogy || !customTopic.trim()) {
      setError("Please select an analogy and enter a topic.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      activeAnalogyRef.current = selectedAnalogy;
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `Explain the topic: "${customTopic}" strictly using the analogy of "${selectedAnalogy}". Be creative and consistent.`;

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: { systemInstruction },
      });
      chatRef.current = chat;
      setIsChatStarted(true);

      const firstPrompt = `Explain the topic "${customTopic}" to me.`;
      const userMessage: ChatMessage = { 
          role: 'user', 
          text: firstPrompt, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setMessages([userMessage]);

      let response: GenerateContentResponse = await chatRef.current.sendMessage({ message: firstPrompt });
      const modelMessage: ChatMessage = { 
        role: 'model', 
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setMessages(prev => [...prev, modelMessage]);

    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setIsChatStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

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
      let response: GenerateContentResponse = await chatRef.current.sendMessage({ message: input });
      const modelMessage: ChatMessage = { 
        role: 'model', 
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isChatStarted) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 md:p-12 rounded-2xl shadow-xl ring-1 ring-slate-200 dark:ring-slate-700">
        <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Analogy Sandbox</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-10 text-lg">Pick an analogy, enter a topic, and learn through a custom lens.</p>
            
            <div className="space-y-8 text-left">
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">1. Select a Lens</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                         {STANDARD_ANALOGIES.slice(0, 9).map(analogy => (
                             <button 
                                key={analogy}
                                onClick={() => setSelectedAnalogy(analogy)}
                                className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${selectedAnalogy === analogy ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300' : 'border-slate-100 dark:border-slate-700 text-slate-500 hover:border-violet-200'}`}
                             >
                                 {analogy}
                             </button>
                         ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="topic-input" className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">2. Enter Topic</label>
                    <input 
                        type="text"
                        id="topic-input"
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        placeholder="e.g., 'Docker Containers' or 'Photosynthesis'"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900 dark:text-slate-200 transition-all shadow-inner"
                    />
                </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-6 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">{error}</p>}
            
            <button 
                onClick={handleStartChat}
                disabled={isLoading || !selectedAnalogy || !customTopic}
                className="mt-10 w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50 transition-all text-lg"
            >
                {isLoading ? 'Creating Sandbox...' : 'Start Learning Session'}
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sandbox: {customTopic}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Viewed through the lens of <span className="text-violet-500 font-semibold">{activeAnalogyRef.current}</span></p>
            </div>
            <button onClick={() => setIsChatStarted(false)} className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline">Reset Session</button>
        </div>
        <div ref={chatContainerRef} className="flex-1 p-6 space-y-6 overflow-y-auto bg-white dark:bg-slate-800">
            {messages.map((msg, index) => <ChatBubble key={index} message={msg} />)}
            {isLoading && <TypingIndicator />}
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
            <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a follow-up or test the lens..."
                    className="flex-1 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-900 dark:text-slate-200 transition-all shadow-sm"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="p-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50 transition-all"
                >
                    <SendIcon />
                </button>
            </form>
      </div>
    </div>
  );
}