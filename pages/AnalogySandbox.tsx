import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { ChatMessage } from '../types';
import { STANDARD_ANALOGIES } from '../constants';

// Re-using avatar components for consistency
const AIAvatar = () => (
  <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-slate-200 to-slate-300 ring-2 ring-slate-300 flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-500" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 017.072 0m-11.314 0a5 5 0 007.072 0M12 21v-1m-6.364-1.636l.707-.707" /></svg>
  </div>
);

const UserAvatar = () => (
  <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gradient-to-br from-slate-200 to-slate-300 ring-2 ring-slate-300 flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-500" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  </div>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
);

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isModel = message.role === 'model';
  return (
    <div className={`flex items-end gap-3 ${isModel ? 'justify-start' : 'justify-end'}`}>
      {isModel && <AIAvatar />}
      <div className={`w-full max-w-2xl order-1 ${isModel ? 'flex flex-col items-start' : 'flex flex-col items-end'}`}>
        <div className={`px-4 py-3 rounded-xl shadow-md ${isModel ? 'bg-slate-700 text-slate-200 rounded-bl-none' : 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-br-none'}`}>
            <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
        <p className="text-xs text-slate-500 mt-1 px-1">{message.timestamp}</p>
      </div>
       {!isModel && <UserAvatar />}
    </div>
  );
};

const TypingIndicator: React.FC = () => (
    <div className="flex items-end gap-3 justify-start">
      <AIAvatar />
      <div className="w-full max-w-2xl">
        <div className="px-4 py-3 rounded-xl bg-slate-700 rounded-bl-none shadow-md">
          <div className="flex items-center justify-start space-x-1.5 h-5">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
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
      const systemInstruction = `
You are a highly creative and disciplined AI tutor. Your mission is to teach the user about the topic: "${customTopic}".

Your ONE AND ONLY tool for teaching is the analogy of "${selectedAnalogy}".

**Your Core Directives:**
1. **Strict Adherence:** You MUST explain every concept and answer every question by creatively using the analogy of a "${selectedAnalogy}". Under no circumstances should you introduce a different analogy or explain the topic directly without using the analogy.
2. **Creative Extension:** Your strength is in finding clever and insightful ways to map new user questions back to the core analogy. Think "what if" scenarios. If the user asks about an edge case, find its equivalent within the analogy's world.
3. **Maintain Character:** You are an analogy expert. Your entire conversational persona revolves around this single analogy.
4. **First Response:** Your very first message must be a direct explanation of "${customTopic}" using the analogy of a "${selectedAnalogy}".

Stick to the script. Be creative within the boundaries. Your goal is to build a deep, consistent mental model for the user.
`;

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
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
      
      const followupSuggestion = "\n\nWould you like me to elaborate on a specific part of this analogy, or explore a 'what if' scenario?";
      
      const modelMessage: ChatMessage = { 
        role: 'model', 
        text: response.text + followupSuggestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setMessages(prev => [...prev, modelMessage]);

    } catch (err: any) {
      setError(err.message || 'An error occurred while starting the chat.');
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
      <div className="bg-slate-800 p-6 md:p-8 rounded-lg shadow-xl ring-1 ring-slate-700">
        <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Analogy Sandbox</h1>
            <p className="text-slate-400 mb-8">Pick an analogy, enter a topic you want to understand, and let our AI explain it to you through that lens.</p>
            
            <div className="space-y-6 text-left">
                <div>
                    <label htmlFor="analogy-select" className="block text-sm font-medium text-slate-300 mb-2">1. Choose an Analogy</label>
                    <select 
                        id="analogy-select" 
                        value={selectedAnalogy}
                        onChange={(e) => setSelectedAnalogy(e.target.value)}
                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-200"
                    >
                        <option value="" disabled>-- Select an analogy --</option>
                        {STANDARD_ANALOGIES.map(analogy => (
                            <option key={analogy} value={analogy}>{analogy}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="topic-input" className="block text-sm font-medium text-slate-300 mb-2">2. What topic or concept do you want to learn?</label>
                    <input 
                        type="text"
                        id="topic-input"
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        placeholder="e.g., 'General Relativity', 'The concept of recursion'"
                        className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-200"
                    />
                </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
            
            <div className="mt-8">
                <button 
                    onClick={handleStartChat}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-slate-400 disabled:opacity-100 disabled:cursor-not-allowed transition-opacity flex items-center justify-center text-lg"
                >
                    {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>}
                    {isLoading ? 'Initializing...' : 'Start Learning'}
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-slate-800 rounded-lg shadow-xl ring-1 ring-slate-700 overflow-hidden">
        <div className="p-4 bg-slate-900 border-b border-slate-700">
            <h2 className="text-xl font-bold text-center text-slate-100">Analogy Sandbox</h2>
            <p className="text-sm text-slate-400 text-center truncate">Using: <span className="font-semibold">{activeAnalogyRef.current}</span></p>
        </div>
        <div ref={chatContainerRef} className="flex-1 p-6 space-y-6 overflow-y-auto">
            {messages.map((msg, index) => <ChatBubble key={index} message={msg} />)}
            {isLoading && <TypingIndicator />}
        </div>
        <div className="p-4 bg-slate-900 border-t border-slate-700">
            {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
            <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-200 transition"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="p-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 disabled:bg-slate-400 disabled:opacity-100 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    aria-label="Send message"
                >
                    <SendIcon />
                </button>
            </form>
      </div>
    </div>
  );
}