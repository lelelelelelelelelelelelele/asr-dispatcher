# Polyglot ASR Dispatcher

A modern, serverless speech-to-text application built with React and Google Gemini. This project demonstrates the **Strategy Pattern** to switch between different ASR (Automatic Speech Recognition) engines dynamically.

## 🛠 Technology Stack (技术栈)

*   **Frontend Framework**: React 19 (Hooks, Functional Components)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **AI & Cloud**: 
    *   Google GenAI SDK (`@google/genai`)
    *   Model: `gemini-3-pro-preview` (Multimodal capabilities)
*   **Audio Processing**:
    *   Native `MediaRecorder API` for audio capture.
    *   `Web Audio API` (AnalyserNode) for real-time frequency visualization.
*   **Icons**: Lucide React
*   **Runtime Environment**: Pure Client-Side (No Node.js/Python backend required).

## 🚀 Implementation Path (实现路径)

### 1. Architecture: The Strategy Pattern (策略模式)
The core architectural decision was to decouple the UI from the speech recognition logic. This allows for easy extension (e.g., adding OpenAI Whisper later) without changing the UI code.

*   **Interface (`ASREngine`)**: Defines a strict contract (`transcribe(blob): Promise<Result>`) that all engines must follow.
*   **Strategies**:
    *   `CloudGeminiEngine`: Implements the interface using Google's GenAI SDK. It handles Blob-to-Base64 conversion and communicates directly with Gemini.
    *   `LocalWebSpeechEngine`: A structure for browser-native recognition (currently serves as a fallback/placeholder architecture).
*   **Context (`ASRDispatcher`)**: A singleton that manages the strategies and routes the request based on user settings.

### 2. Serverless Client-Side AI (纯前端 AI)
Unlike traditional architectures that require a Python backend (FastAPI/Flask) to proxy requests:
*   This app initializes the `GoogleGenAI` client **directly in the browser**.
*   **Data Flow**: `Microphone -> Browser Memory (Blob) -> Google Gemini API -> Text Response`.
*   **Benefit**: drastically reduces infrastructure complexity (no Docker, no servers) and latency.

### 3. Audio Pipeline (音频流处理)
*   **Capture**: Uses `navigator.mediaDevices.getUserMedia` to access the microphone stream.
*   **Visualization**: The stream is cloned. One track feeds into an `AudioContext` Analyser to generate real-time FFT (Fast Fourier Transform) data, which drives the CSS-based visualizer bars.
*   **Encoding**: The main track is fed into a `MediaRecorder`, collecting data chunks. When recording stops, these chunks are merged into a single `Blob` (WebM/MP4) optimized for the API.

## 📦 Setup & Usage

1.  The application expects a Google Gemini `API_KEY` in the environment variables (`process.env.API_KEY`).
2.  Click the **Microphone** button to start recording.
3.  The visualizer acts as a feedback mechanism to ensure audio is being captured.
4.  Click **Stop** to send the audio to the Gemini 3 Pro model for high-accuracy transcription.
