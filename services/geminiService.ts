import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ANALOGY_DATA } from '../constants';
import { Analogy } from '../types';
import { decode, decodeAudioData } from '../utils/helpers';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCategories = async (): Promise<Record<string, string[]>> => {
  const ai = getAI();
  const titles = ANALOGY_DATA.map(a => a.title).join('", "');
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Based on these titles, group them into a few logical categories (like Technology, Business, Science). The titles are: ["${titles}"]. Return the result as an object with a "categoryList" key, which is an array of objects. Each object in the array should have a 'categoryName' and a list of 'titles'.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          categoryList: {
            type: Type.ARRAY,
            description: "A list of categories, each with a name and associated titles.",
            items: {
              type: Type.OBJECT,
              properties: {
                categoryName: {
                  type: Type.STRING,
                  description: "The name of the category.",
                },
                titles: {
                  type: Type.ARRAY,
                  description: "An array of analogy titles belonging to this category.",
                  items: {
                    type: Type.STRING,
                  },
                },
              },
              required: ['categoryName', 'titles'],
            },
          },
        },
      },
    },
  });

  const jsonResponse = JSON.parse(response.text);
  const categoryMap: Record<string, string[]> = {};
  if (jsonResponse.categoryList) {
    for (const item of jsonResponse.categoryList) {
      if (item.categoryName && Array.isArray(item.titles)) {
        categoryMap[item.categoryName] = item.titles;
      }
    }
  }
  return categoryMap;
};

export const generateAnalogyOfTheDay = async (): Promise<Omit<Analogy, 'id' | 'url' | 'category'>> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
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
    
    // Return the source and context to allow for external control (e.g., stopping).
    return { source, audioContext };
};

// FIX: Implement and export `generateImage` to resolve error in ImageStudio.tsx.
export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: aspectRatio,
    },
  });

  const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
  const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
  return imageUrl;
};

// FIX: Implement and export `editImage` to resolve error in ImageStudio.tsx.
export const editImage = async (prompt: string, base64ImageData: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64ImageData,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      const responseMimeType = part.inlineData.mimeType;
      const imageUrl = `data:${responseMimeType};base64,${base64ImageBytes}`;
      return imageUrl;
    }
  }

  throw new Error("No image was generated by the model.");
};

// FIX: Implement and export `generateVideo` to resolve error in VideoStudio.tsx.
interface VideoImageInput {
    imageBytes: string;
    mimeType: string;
}

export const generateVideo = async (prompt: string, image: VideoImageInput, aspectRatio: '16:9' | '9:16'): Promise<string> => {
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
      aspectRatio: aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Video generation failed or returned no link.");
  }

  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to download video: ${response.statusText} - ${errorText}`);
  }
  const videoBlob = await response.blob();
  const videoUrl = URL.createObjectURL(videoBlob);
  return videoUrl;
};