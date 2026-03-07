import React from 'react';
import { Mic, Square, Loader2, RefreshCw, FileAudio, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

interface AudioRecorderProps {
  onProcessingComplete: (audioBlob: Blob) => void;
  isProcessing: boolean;
}

export function AudioRecorder({ onProcessingComplete, isProcessing }: AudioRecorderProps) {
  const { isRecording, recordingTime, audioBlob, error, startRecording, stopRecording, resetRecording } = useAudioRecorder();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProcess = () => {
    if (audioBlob) {
      onProcessingComplete(audioBlob);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Voice Recorder</h2>
        <p className="text-slate-500">Record your consultation to generate a prescription</p>
      </div>

      {/* Timer Display */}
      <div className="font-mono text-5xl font-medium text-slate-700 tracking-wider">
        {formatTime(recordingTime)}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-3 rounded-lg text-sm border border-rose-100 w-full justify-center">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Visualizer / Status */}
      <div className="h-16 flex items-center justify-center gap-1">
        {isRecording ? (
          Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-2 bg-emerald-500 rounded-full"
              animate={{
                height: [16, 32, 16],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))
        ) : audioBlob ? (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
            <FileAudio className="w-5 h-5" />
            <span className="font-medium">Recording Saved</span>
          </div>
        ) : (
          <div className="text-slate-400 text-sm">Ready to record</div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {!isRecording && !audioBlob && (
          <button
            onClick={startRecording}
            className="h-16 w-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <Mic className="w-8 h-8" />
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="h-16 w-16 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <Square className="w-6 h-6 fill-current" />
          </button>
        )}

        {audioBlob && !isRecording && !isProcessing && (
          <>
            <button
              onClick={resetRecording}
              className="h-12 w-12 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              title="Reset"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleProcess}
              className="h-12 px-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-md transition-all flex items-center gap-2"
            >
              Generate Prescription
            </button>
          </>
        )}

        {isProcessing && (
          <div className="flex items-center gap-3 text-slate-600 bg-slate-50 px-6 py-3 rounded-full border border-slate-200">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            <span className="font-medium">Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
}
