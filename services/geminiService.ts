import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ANALOGY_DATA } from '../constants';
import { Analogy } from '../types';
import { decode, decodeAudioData } from '../utils/helpers';

const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// --- Rate Limiting Logic ---
const LIMIT_CONFIG = {
  GENERAL: { max: 15, windowMs: 5 * 60 * 1000, label: 'General AI' }, // 15 calls / 5 mins
  HEAVY: { max: 5, windowMs: 60 * 60 * 1000, label: 'Media Studio' },    // 5 calls / 1 hour
};

type LimitType = 'GENERAL' | 'HEAVY';

const checkAndIncrementRateLimit = (type: LimitType) => {
  const config = LIMIT_CONFIG[type];
  const now = Date.now();
  const storageKey = `ai_limit_${type.toLowerCase()}`;
  
  // Load existing timestamps
  let timestamps: number[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
  // Filter out timestamps outside the current window
  timestamps = timestamps.filter(ts => now - ts < config.windowMs);
  
  if (timestamps.length >= config.max) {
    const oldestTs = timestamps[0];
    const waitTimeMs = config.windowMs - (now - oldestTs);
    const waitMinutes = Math.ceil(waitTimeMs / 60000);
    throw new Error(`${config.label} limit reached. Please wait about ${waitMinutes} minute${waitMinutes !== 1 ? 's' : ''} before trying again.`);
  }
  
  // Record new attempt
  timestamps.push(now);
  localStorage.setItem(storageKey, JSON.stringify(timestamps));
};

/**
 * Generates logical categories for the analogy library by analyzing both titles and concepts.
 */
export const generateCategories = async (): Promise<Record<string, string[]>> => {
  checkAndIncrementRateLimit('GENERAL');
  const ai = getAI();
  
  // Construct a clear list of topics and their concepts for Gemini to analyze
  const topicsForAi = ANALOGY_DATA.map(a => `Topic: "${a.title}" | Brief: "${a.concept.substring(0, 100)}..."`).join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following technical and business topics and group them into 5-7 broad, logical "Knowledge Domains" suitable for a professional educational library.

Topics to Categorize:
${topicsForAi}

Instructions:
1. Create descriptive category names (e.g., "Software Architecture", "Advanced Computing", "Business Strategy", "DevOps & Infrastructure").
2. Assign every topic to exactly one category.
3. Ensure category names are distinct and meaningful.
4. Return ONLY a JSON object.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          categoryList: {
            type: Type.ARRAY,
            description: "A list of categories, each with a domain name and associated titles.",
            items: {
              type: Type.OBJECT,
              properties: {
                categoryName: {
                  type: Type.STRING,
                  description: "The name of the knowledge domain.",
                },
                titles: {
                  type: Type.ARRAY,
                  description: "An array of topic titles belonging to this domain.",
                  items: {
                    type: Type.STRING,
                  },
                },
              },
              required: ['categoryName', 'titles'],
            },
          },
        },
        required: ['categoryList']
      },
    },
  });

  try {
    const jsonResponse = JSON.parse(response.text);
    const categoryMap: Record<string, string[]> = {};
    if (jsonResponse.categoryList && Array.isArray(jsonResponse.categoryList)) {
      for (const item of jsonResponse.categoryList) {
        if (item.categoryName && Array.isArray(item.titles)) {
          categoryMap[item.categoryName] = item.titles;
        }
      }
    }
    return categoryMap;
  } catch (e) {
    console.error("Failed to parse Gemini category response", e);
    return {};
  }
};

export const generateAnalogyOfTheDay = async (): Promise<Omit<Analogy, 'id' | 'url' | 'category'>> => {
  checkAndIncrementRateLimit('GENERAL');
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a new, insightful analogy for a complex topic. The topic can be from technology, science, philosophy, or business. The response must be in JSON format.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "The name of the complex concept.",
          },
          concept: {
            type: Type.STRING,
            description: "A brief, one-sentence explanation of the concept.",
          },
          analogy: {
            type: Type.STRING,
            description: "The creative and simple analogy to explain the concept.",
          },
        },
        required: ['title', 'concept', 'analogy'],
      },
    },
  });

  const jsonResponse = JSON.parse(response.text);
  return jsonResponse;
};

export const playTextAsSpeech = async (text: string): Promise<{ source: AudioBufferSourceNode, audioContext: AudioContext }> => {
    checkAndIncrementRateLimit('GENERAL');
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data received.");

    const audioContext = new (window.AudioContext)({ sampleRate: 24000 });
    const audioBytes = decode(base64Audio);
    const buffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    
    return { source, audioContext };
};

export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  checkAndIncrementRateLimit('HEAVY');
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
          aspectRatio: aspectRatio as any,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated.");
};

export interface ColorPaletteItem {
  name: string;
  hex: string;
  usage: string;
}

export const generateColorPalette = async (style: string, description: string): Promise<ColorPaletteItem[]> => {
  checkAndIncrementRateLimit('GENERAL');
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a professional brand color palette for a brand called "Learn Through Analogy". 
    The style chosen is "${style}". 
    Additional details: "${description}". 
    Provide 5 cohesive colors including primary, secondary, accent, and neutral tones.
    For each color, provide a name, its hex code, and a brief suggestion on how to use it in UI/Branding.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          palette: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Color name (e.g., Deep Clarity Blue)" },
                hex: { type: Type.STRING, description: "Hexadecimal color code (e.g., #2A5D8A)" },
                usage: { type: Type.STRING, description: "Suggested brand usage" },
              },
              required: ["name", "hex", "usage"]
            }
          }
        },
        required: ["palette"]
      }
    }
  });

  const json = JSON.parse(response.text);
  return json.palette;
};

export const editImage = async (prompt: string, base64Image: string, mimeType: string): Promise<string> => {
  checkAndIncrementRateLimit('HEAVY');
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });
    
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated.");
};

export const generateVideo = async (prompt: string, image: { imageBytes: string, mimeType: string }, aspectRatio: string): Promise<string> => {
  checkAndIncrementRateLimit('HEAVY');
  const ai = getAI();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: image.imageBytes,
      mimeType: image.mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio as any,
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed.");

  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const generatePodcast = async (topic: string, style: string): Promise<{ base64Audio: string, transcript: string }> => {
    checkAndIncrementRateLimit('GENERAL');
    const ai = getAI();
    
    const scriptPrompt = `
    Generate a short podcast script (approx 100 words) between two hosts, Alex and Jamie, discussing the topic: "${topic}".
    The style should be: "${style}".
    Format the output exactly like this:
    Alex: [Alex's line]
    Jamie: [Jamie's line]
    ...
    `;
    
    const scriptResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: scriptPrompt
    });
    
    const transcript = scriptResponse.text || '';
    if (!transcript) throw new Error("Failed to generate script.");

    const ttsPrompt = `TTS the following conversation:\n${transcript}`;
    
    const audioResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: ttsPrompt }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: [
                        {
                            speaker: 'Alex',
                            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
                        },
                        {
                            speaker: 'Jamie',
                            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
                        }
                    ]
                }
            }
        }
    });

    const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Failed to generate audio.");

    return { base64Audio, transcript };
};