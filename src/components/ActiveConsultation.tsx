import React, { useEffect, useState } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { motion } from 'motion/react';
import { Mic, Square, Loader2, FileText, Send, AlertCircle, Activity, Building2, Pill, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DoctorPreferences } from '@/types';

interface ActiveConsultationProps {
  onGenerate: (
    audioBlob: Blob, 
    chiefComplaints: string,
    selectedPreferences: {
      diagnosticCentres: string[];
      pharmaCompanies: string[];
      pharmacies: string[];
    }
  ) => void;
  isProcessing: boolean;
  preferences: DoctorPreferences;
}

export function ActiveConsultation({ onGenerate, isProcessing, preferences }: ActiveConsultationProps) {
  const { isRecording, recordingTime, audioBlob, error, startRecording, stopRecording } = useAudioRecorder();
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  // Selection states
  const [selectedDiagnosticCentres, setSelectedDiagnosticCentres] = useState<string[]>([]);
  const [selectedPharmaCompanies, setSelectedPharmaCompanies] = useState<string[]>([]);
  const [selectedPharmacies, setSelectedPharmacies] = useState<string[]>([]);

  // Initialize selections with all available preferences by default or empty?
  // User said "option to select preferred... based on the suggestion the final prescription will be generate"
  // Let's default to empty, so they can select specific ones relevant for this patient if they want.
  // Or maybe pre-select all? Let's start empty but show them clearly.

  const toggleSelection = (
    item: string, 
    current: string[], 
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (current.includes(item)) {
      setter(current.filter(i => i !== item));
    } else {
      setter([...current, item]);
    }
  };

  // Auto-start recording on mount
  useEffect(() => {
    startRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger generation once audio blob is ready after stopping
  useEffect(() => {
    if (isFinishing && audioBlob) {
      onGenerate(audioBlob, chiefComplaints, {
        diagnosticCentres: selectedDiagnosticCentres,
        pharmaCompanies: selectedPharmaCompanies,
        pharmacies: selectedPharmacies
      });
      setIsFinishing(false);
    }
  }, [audioBlob, isFinishing, onGenerate, chiefComplaints, selectedDiagnosticCentres, selectedPharmaCompanies, selectedPharmacies]);

  const handleGenerate = () => {
    stopRecording();
    setIsFinishing(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      
      {/* Header Status */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              isRecording ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"
            )}>
              <Mic className="w-6 h-6" />
            </div>
            {isRecording && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Consultation in Progress</h2>
            <p className="text-slate-500 text-sm flex items-center gap-2">
              {isRecording ? 'Recording audio...' : 'Recording paused'}
              <span className="font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {formatTime(recordingTime)}
              </span>
            </p>
          </div>
        </div>

        {/* Visualizer */}
        <div className="hidden md:flex items-center gap-1 h-8">
          {isRecording && Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-emerald-500 rounded-full"
              animate={{
                height: [8, 24, 8],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
          <button 
            onClick={() => startRecording()}
            className="ml-auto text-sm font-medium underline hover:text-rose-800"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Notes & Preferences */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chief Complaints Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Chief Complaints / Doctor's Notes
              </label>
              <span className="text-xs text-slate-400">Type while recording</span>
            </div>
            <textarea
              value={chiefComplaints}
              onChange={(e) => setChiefComplaints(e.target.value)}
              className="w-full h-48 p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all resize-none text-lg leading-relaxed shadow-sm"
              placeholder="e.g. Patient complains of high fever for 3 days, severe headache, and body ache..."
              autoFocus
            />
          </div>

          {/* Preferences Selection */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
            <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Prescription Preferences</h3>
            
            {/* Pharma Companies */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-500" />
                Preferred Pharma Companies (for Medicine Suggestions)
              </label>
              {preferences.pharmaCompanies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {preferences.pharmaCompanies.map(company => (
                    <button
                      key={company}
                      onClick={() => toggleSelection(company, selectedPharmaCompanies, setSelectedPharmaCompanies)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        selectedPharmaCompanies.includes(company)
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-white border-slate-200 text-slate-600 hover:border-emerald-200"
                      )}
                    >
                      {company}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No pharma companies added in settings.</p>
              )}
            </div>

            {/* Diagnostic Centres */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-500" />
                Preferred Diagnostic Centre
              </label>
              {preferences.diagnosticCentres.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {preferences.diagnosticCentres.map(center => (
                    <button
                      key={center}
                      onClick={() => toggleSelection(center, selectedDiagnosticCentres, setSelectedDiagnosticCentres)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        selectedDiagnosticCentres.includes(center)
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-white border-slate-200 text-slate-600 hover:border-emerald-200"
                      )}
                    >
                      {center}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No diagnostic centres added in settings.</p>
              )}
            </div>

            {/* Pharmacies */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-500" />
                Preferred Pharmacy
              </label>
              {preferences.pharmacies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {preferences.pharmacies.map(pharmacy => (
                    <button
                      key={pharmacy}
                      onClick={() => toggleSelection(pharmacy, selectedPharmacies, setSelectedPharmacies)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        selectedPharmacies.includes(pharmacy)
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-white border-slate-200 text-slate-600 hover:border-emerald-200"
                      )}
                    >
                      {pharmacy}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No pharmacies added in settings.</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 sticky top-24">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Actions
            </h3>
            
            <button
              onClick={handleGenerate}
              disabled={isProcessing || (!isRecording && !audioBlob)}
              className={cn(
                "w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2",
                isProcessing 
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] shadow-emerald-200"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Generate Prescription
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Clicking generate will stop the recording and process audio, notes, and preferences to create the prescription.
            </p>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h4 className="text-blue-900 font-medium mb-2 text-sm">Pro Tips:</h4>
            <ul className="text-sm text-blue-700 space-y-2 list-disc pl-4">
              <li>Speak clearly near the microphone.</li>
              <li>Mention specific symptoms and duration.</li>
              <li>Select preferred pharma companies to get tailored medicine suggestions.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
