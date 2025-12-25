import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { decode, decodeAudioData, encode, createBlob } from '../utils/helpers';

export default function LiveConversation() {
  const [isTalking, setIsTalking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<LiveSession | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const outputSourcesRef = useRef(new Set<AudioBufferSourceNode>());
  
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const stopConversation = useCallback(() => {
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if (scriptProcessorRef.current) { scriptProcessorRef.current.disconnect(); scriptProcessorRef.current = null; }
    if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(track => track.stop()); mediaStreamRef.current = null; }
    if (inputAudioContextRef.current) { inputAudioContextRef.current.close(); inputAudioContextRef.current = null; }
    if (outputAudioContextRef.current) { outputAudioContextRef.current.close(); outputAudioContextRef.current = null; }
    outputSourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
    outputSourcesRef.current.clear();
    setIsTalking(false);
    setIsConnecting(false);
  }, []);

  const startConversation = async () => {
    if (isTalking || isConnecting) return;
    setIsConnecting(true);
    setError(null);
    setTranscriptions([]);
    nextStartTimeRef.current = 0;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        inputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 24000 });
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    setIsConnecting(false);
                    setIsTalking(true);
                    const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;
                    scriptProcessor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcmBlob: Blob = createBlob(inputData);
                        sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.outputTranscription) currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                    if (message.serverContent?.inputTranscription) currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                    if (message.serverContent?.turnComplete) {
                        setTranscriptions(prev => [...prev, { role: 'user', text: currentInputTranscriptionRef.current }, { role: 'model', text: currentOutputTranscriptionRef.current }]);
                        currentInputTranscriptionRef.current = ''; currentOutputTranscriptionRef.current = '';
                    }
                    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (audioData) {
                        const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContextRef.current!, 24000, 1);
                        const source = outputAudioContextRef.current!.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContextRef.current!.destination);
                        const startTime = Math.max(outputAudioContextRef.current!.currentTime, nextStartTimeRef.current);
                        source.start(startTime);
                        nextStartTimeRef.current = startTime + audioBuffer.duration;
                        outputSourcesRef.current.add(source);
                        source.onended = () => outputSourcesRef.current.delete(source);
                    }
                },
                onerror: (e: ErrorEvent) => { setError(`Error: ${e.message}`); stopConversation(); },
                onclose: () => stopConversation(),
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                outputAudioTranscription: {},
                inputAudioTranscription: {},
                systemInstruction: "You are Leny, a friendly analogy expert. Help users understand topics through simple comparisons."
            },
        });
        sessionRef.current = await sessionPromise;
    } catch (err: any) {
        setError(err.message || "Failed to start conversation.");
        stopConversation();
    }
  };

  useEffect(() => { return () => stopConversation(); }, [stopConversation]);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-12 rounded-2xl shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 text-center transition-all">
        <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Talk to Leny</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-10 text-lg">Instant voice-to-voice learning using real-time analogies.</p>
        
        <div className="flex flex-col justify-center items-center my-12">
             <button
                onClick={isTalking || isConnecting ? stopConversation : startConversation}
                className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 group shadow-2xl ring-8 ring-offset-4 dark:ring-offset-slate-800 ${
                    isConnecting ? 'bg-amber-100 ring-amber-400 dark:bg-amber-900/20' : 
                    isTalking ? 'bg-red-100 ring-red-400 dark:bg-red-900/20' : 
                    'bg-white dark:bg-slate-700 ring-violet-500/20 hover:ring-violet-500/40'
                }`}
            >
                <div className={`absolute inset-4 rounded-full transition-all duration-500 ${
                    isConnecting ? 'bg-amber-500 animate-pulse' : 
                    isTalking ? 'bg-red-500 animate-ping opacity-20' : 
                    'bg-gradient-to-br from-violet-600 to-fuchsia-600 scale-95 group-hover:scale-100'
                }`}></div>
                
                {isTalking && <div className="absolute inset-4 rounded-full bg-red-500"></div>}

                <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 z-10 transition-colors duration-500 ${isTalking || isConnecting ? 'text-white' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={(isTalking || isConnecting) ? "M6 18L18 6M6 6l12 12" : "M12 11V3m0 0a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3zM8 11a4 4 0 004 4m0 0a4 4 0 004-4m-4 4v4m0 0H9m3 0h3"} />
                </svg>
            </button>
            <div className="mt-8 h-8">
                {isConnecting && <p className="text-amber-600 dark:text-amber-400 font-bold animate-pulse text-sm tracking-widest uppercase">Syncing Audio Pipeline...</p>}
                {isTalking && <p className="text-red-600 dark:text-red-400 font-bold animate-pulse text-sm tracking-widest uppercase">Leny is listening</p>}
            </div>
        </div>

        {error && <p className="text-red-600 dark:text-red-400 mb-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-sm font-medium">{error}</p>}
        
        <div className="w-full max-w-3xl mx-auto h-72 bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 overflow-y-auto text-left space-y-4 ring-1 ring-slate-200 dark:ring-slate-700 shadow-inner">
            {transcriptions.length === 0 && !isTalking && !isConnecting && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    <p className="font-medium">Press the mic to start your conversation.</p>
                </div>
            )}
            {transcriptions.map((t, i) => (
                <div key={i} className={`p-4 rounded-2xl shadow-sm text-sm border ${t.role === 'user' ? 'bg-white dark:bg-slate-800 text-right border-slate-100 dark:border-slate-700 ml-12' : 'bg-violet-50 dark:bg-violet-900/20 border-violet-100 dark:border-violet-800/30 mr-12'}`}>
                    <span className={`font-black uppercase tracking-tighter mr-2 ${t.role === 'user' ? 'text-cyan-500' : 'text-violet-500'}`}>{t.role === 'user' ? 'You' : 'Leny'}:</span>
                    <span className="text-slate-700 dark:text-slate-200">{t.text}</span>
                </div>
            ))}
        </div>
    </div>
  );
}