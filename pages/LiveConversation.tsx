import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { decode, decodeAudioData, encode, createBlob } from '../utils/helpers';

export default function LiveConversation() {
  const [isTalking, setIsTalking] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<LiveSession | null>(null);
  // FIX: Initialize refs with null and update types to fix "Expected 1 arguments, but got 0" error.
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const outputSourcesRef = useRef(new Set<AudioBufferSourceNode>());
  
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const stopConversation = useCallback(() => {
    if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    outputSourcesRef.current.forEach(source => source.stop());
    outputSourcesRef.current.clear();
    setIsTalking(false);
  }, []);

  const startConversation = async () => {
    if (isTalking) return;
    setIsTalking(true);
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
                    const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;
                    
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        // FIX: Use the createBlob helper for cleaner and more maintainable audio encoding.
                        const pcmBlob: Blob = createBlob(inputData);
                        sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.outputTranscription) {
                        currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                    }
                    if (message.serverContent?.inputTranscription) {
                        currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                    }
                    if (message.serverContent?.turnComplete) {
                        const userInput = currentInputTranscriptionRef.current;
                        const modelOutput = currentOutputTranscriptionRef.current;
                        setTranscriptions(prev => [...prev, { role: 'user', text: userInput }, { role: 'model', text: modelOutput }]);
                        currentInputTranscriptionRef.current = '';
                        currentOutputTranscriptionRef.current = '';
                    }

                    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (audioData) {
                        const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContextRef.current!, 24000, 1);
                        const source = outputAudioContextRef.current!.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContextRef.current!.destination);
                        
                        const currentTime = outputAudioContextRef.current!.currentTime;
                        const startTime = Math.max(currentTime, nextStartTimeRef.current);
                        source.start(startTime);
                        
                        nextStartTimeRef.current = startTime + audioBuffer.duration;
                        outputSourcesRef.current.add(source);
                        source.onended = () => outputSourcesRef.current.delete(source);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    setError(`Connection Error: ${e.message}`);
                    stopConversation();
                },
                onclose: () => {
                    stopConversation();
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                outputAudioTranscription: {},
                inputAudioTranscription: {},
            },
        });
        sessionRef.current = await sessionPromise;
    } catch (err: any) {
        setError(err.message || "Failed to start conversation.");
        setIsTalking(false);
    }
  };

  useEffect(() => {
    return () => {
        stopConversation();
    }
  }, [stopConversation]);

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 md:p-8 rounded-lg shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Talk to Leny</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Have a real-time voice conversation with Leny, our friendly AI assistant.</p>
        
        <div className="flex justify-center items-center my-8">
             <button
                onClick={isTalking ? stopConversation : startConversation}
                className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 group shadow-lg ${isTalking ? 'bg-red-500/20' : 'bg-gradient-to-br from-violet-600 to-fuchsia-600'}`}
            >
                <div className={`absolute inset-0 rounded-full transition-all duration-300 ${isTalking ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-br from-violet-600 to-fuchsia-600 group-hover:scale-105'}`}></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isTalking ? "M6 18L18 6M6 6l12 12" : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"} />
                </svg>
            </button>
        </div>

        {error && <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>}
        
        <div className="w-full max-w-2xl mx-auto h-64 bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4 overflow-y-auto text-left space-y-2 ring-1 ring-slate-200 dark:ring-slate-700">
            {transcriptions.length === 0 && !isTalking && <p className="text-slate-400 dark:text-slate-500 text-center pt-20">Press the button to start talking...</p>}
            {transcriptions.map((t, i) => (
                <div key={i} className={`p-2 rounded-md text-sm ${t.role === 'user' ? 'bg-slate-200 dark:bg-slate-700 text-right' : 'bg-violet-100 dark:bg-violet-900/50 text-left'}`}>
                    <span className={`font-bold ${t.role === 'user' ? 'text-cyan-600 dark:text-cyan-400' : 'text-violet-600 dark:text-violet-400'}`}>{t.role === 'user' ? 'You' : 'Leny'}: </span>
                    <span className="text-slate-700 dark:text-slate-300">{t.text}</span>
                </div>
            ))}
        </div>
    </div>
  );
}