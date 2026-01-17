import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Loader2, RefreshCw } from 'lucide-react';
import { getMimeType } from '../services/audioUtils';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isProcessing: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [visualizerData, setVisualizerData] = useState<number[]>([10, 10, 10, 10, 10]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Refs for cleanup
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Timer Effect: Separated from stream logic to prevent race conditions causing timer kill
  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Global Cleanup on Unmount
  useEffect(() => {
    return () => {
      stopAllTracks();
    };
  }, []);

  const stopAllTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // 1. Setup Audio Visualization (Real-time)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64; // Low resolution for simple 5-bar visualizer
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      
      audioContextRef.current = audioCtx;
      
      const updateVisualizer = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        // Map FFT data to 5 bars (taking low-mid frequencies)
        // Indices: 0-4 cover bass to lower mids roughly with fftSize 64
        const newVisuals = [
          dataArray[0], 
          dataArray[1], 
          dataArray[2], 
          dataArray[3], 
          dataArray[4]
        ].map(val => (val / 255) * 100);

        setVisualizerData(newVisuals);
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();

      // 2. Setup Recording
      const mimeType = getMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        stopAllTracks(); // Clean up streams and context
        onRecordingComplete(blob);
        setVisualizerData([10, 10, 10, 10, 10]); // Reset visuals
      };

      mediaRecorder.start();
      
      // 3. Update State
      setRecordingTime(0);
      setIsRecording(true);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 w-full max-w-md mx-auto">
      {/* Visualizer Circle */}
      <div className="relative mb-8">
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-75"></div>
        )}
        <div className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
          isRecording ? 'bg-red-500 shadow-xl shadow-red-200' : 'bg-slate-100 shadow-inner'
        }`}>
          {isProcessing ? (
             <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
          ) : isRecording ? (
             <div className="flex gap-1 h-8 items-end justify-center">
               {visualizerData.map((height, i) => (
                 <div 
                    key={i} 
                    className="w-1.5 bg-white rounded-full transition-[height] duration-75 ease-linear" 
                    style={{ 
                      height: `${Math.max(15, height)}%`, 
                      opacity: 0.8 + (height / 500) // Slight opacity boost on loud sounds
                    }} 
                 />
               ))}
             </div>
          ) : (
             <Mic className="w-12 h-12 text-slate-400" />
          )}
        </div>
      </div>

      {/* Timer */}
      <div className="text-4xl font-mono font-light text-slate-800 mb-8 tracking-wider">
        {formatTime(recordingTime)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isProcessing}
            className={`group relative px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-3
              ${isProcessing 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
          >
            <Mic className="w-5 h-5" />
            <span>{recordingTime > 0 ? 'Record Again' : 'Start Recording'}</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="group relative px-8 py-4 bg-red-500 text-white rounded-full font-semibold text-lg transition-all shadow-lg shadow-red-200 hover:bg-red-600 hover:shadow-xl active:scale-95 flex items-center gap-3"
          >
            <Square className="w-5 h-5 fill-current" />
            <span>Stop Recording</span>
          </button>
        )}
      </div>
      
      {isProcessing && (
         <p className="mt-6 text-indigo-600 font-medium animate-pulse flex items-center gap-2">
           <RefreshCw className="w-4 h-4 animate-spin" />
           Transcribing audio...
         </p>
      )}
    </div>
  );
};