import { GoogleGenAI } from "@google/genai";
import { blobToBase64 } from "./audioUtils";

// Initialize Gemini client with environment variable
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const transcribeWithGemini = async (audioBlob: Blob): Promise<string> => {
  if (!apiKey) {
    throw new Error("Gemini API Key is missing in environment variables.");
  }

  const base64Data = await blobToBase64(audioBlob);
  const mimeType = audioBlob.type || 'audio/webm';

  // Updated to the Pro model as requested.
  // 'gemini-3-pro-preview' is the current mapping for "gemini pro" tasks.
  const modelName = 'gemini-3-pro-preview';

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Transcribe the following audio accurately. Output only the transcription text, no preamble or markdown."
          }
        ]
      }
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Transcription Error:", error);
    throw error;
  }
};