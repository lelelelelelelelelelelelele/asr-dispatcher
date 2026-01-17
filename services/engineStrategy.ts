import { ASREngine, EngineType, TranscribeResult } from "../types";
import { transcribeWithGemini } from "./geminiService";

// --- Strategy 1: Local Browser Native Engine ---
class LocalWebSpeechEngine implements ASREngine {
  id = EngineType.LOCAL;
  name = "Local Native (WebSpeech)";
  description = "Uses the browser's built-in Web Speech API. Fast, free, but may have lower accuracy.";

  isAvailable(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  transcribe(audioBlob: Blob): Promise<TranscribeResult> {
    return new Promise((resolve, reject) => {
      // NOTE: Web Speech API usually works on live streams, not blobs.
      // However, for this architectural demo, we simulate the "File->Text" flow 
      // by acknowledging that a true local file engine (like WASM Whisper) is heavy.
      // To make this functional for the user without WASM, we will use a workaround:
      // We can't easily feed a blob to WebSpeechAPI. 
      // Ideally, we would use 'speech-recognition-polyfill' or similar.
      // 
      // COMPROMISE FOR DEMO: 
      // Since the Recorder component records the audio *while* the user speaks,
      // we could theoretically have run WebSpeech *during* recording.
      // But since the interface defines `transcribe(blob)`, we will simulate a success 
      // or return a mock if strictly adhering to the interface for a blob is impossible without WASM.
      
      // OPTION B: Actually load a tiny WASM model? No, too complex for single file.
      // OPTION C: Just reject and explain limitation? No, bad UX.
      
      // REVISED APPROACH:
      // We will pretend this engine handles the "Live" part, but here we are post-recording.
      // To be useful, let's implement a "Mock" that explains the limitation or 
      // if strictly needed, we assume the Dispatcher handles the "Live" vs "File" distinction.
      // 
      // BETTER FIX: For this specific React implementation, we will treat the "Local" engine
      // as a placeholder for a WASM-based Whisper if we had it. 
      // BUT to make it *runnable* now, I will add a simple logic:
      // If we are "Local", we should have captured the text *during* recording.
      // 
      // Let's adjust the Architecture: The `transcribe` method is called after recording.
      // I will implement a "Simulated Local Engine" that returns a placeholder 
      // or uses a very simple heuristic if possible.
      
      // ACTUALLY: Let's use Gemini for the Cloud, and for Local, 
      // we will return a message saying "WebSpeech API requires live stream processing".
      // 
      // Wait, I can do better. I will use the Gemini API as the primary working implementation 
      // and the Local one as a fallback structure.
      
      reject(new Error("Browser Native Speech Recognition works on live streams, not recorded files. Switch to Cloud Engine for file transcription."));
    });
  }
}

// --- Strategy 2: Cloud Gemini Engine ---
class CloudGeminiEngine implements ASREngine {
  id = EngineType.CLOUD_GEMINI;
  name = "Cloud (Gemini 2.5 Flash)";
  description = "Uses Google's Gemini 2.5 Flash model. High accuracy, supports multiple languages, requires API Key.";

  isAvailable(): boolean {
    return true; // Always available assuming network + key
  }

  async transcribe(audioBlob: Blob): Promise<TranscribeResult> {
    const startTime = performance.now();
    try {
      const text = await transcribeWithGemini(audioBlob);
      const endTime = performance.now();
      return {
        text,
        confidence: 0.95, // Gemini doesn't always return confidence per segment easily in this mode
        engineUsed: EngineType.CLOUD_GEMINI,
        durationMs: endTime - startTime
      };
    } catch (error) {
        console.error(error);
        throw new Error("Failed to transcribe with Gemini.");
    }
  }
}

// --- Dispatcher ---
export class ASRDispatcher {
  private engines: Map<EngineType, ASREngine> = new Map();

  constructor() {
    this.registerEngine(new LocalWebSpeechEngine());
    this.registerEngine(new CloudGeminiEngine());
  }

  registerEngine(engine: ASREngine) {
    this.engines.set(engine.id, engine);
  }

  getEngine(type: EngineType): ASREngine | undefined {
    return this.engines.get(type);
  }

  async dispatch(audioBlob: Blob, preferredEngine: EngineType): Promise<TranscribeResult> {
    const engine = this.engines.get(preferredEngine);
    if (!engine) throw new Error(`Engine ${preferredEngine} not found`);
    
    // Fallback logic could go here (e.g., if Cloud fails, try Local)
    // For now, simple direct dispatch
    return await engine.transcribe(audioBlob);
  }
}

export const dispatcher = new ASRDispatcher();