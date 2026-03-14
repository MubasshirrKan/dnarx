'use client';

import React, { useEffect, useState } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Loader2, FileText, Send, AlertCircle, Activity, Building2, Pill, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DoctorPreferences, PatientData, PrescriptionData } from '@/types';
import { transcribeAudioAction, verifyPrescriptionAction } from '@/app/dashboard/actions';

interface ActiveConsultationProps {
  onPrescriptionGenerated: (data: PrescriptionData) => void;
  preferences: DoctorPreferences;
  patientData: PatientData;
  patientHistory?: any[];
}

export function ActiveConsultation({ onPrescriptionGenerated, preferences, patientData, patientHistory = [] }: ActiveConsultationProps) {
  const { isRecording, recordingTime, audioBlob, error, startRecording, stopRecording } = useAudioRecorder();
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);

  // Selection states
  const [selectedDiagnosticCentres, setSelectedDiagnosticCentres] = useState<string[]>([]);
  const [selectedPharmaCompanies, setSelectedPharmaCompanies] = useState<string[]>([]);
  const [selectedPharmacies, setSelectedPharmacies] = useState<string[]>([]);

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

  useEffect(() => {
    startRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger processing when audioBlob is ready after finishing
  useEffect(() => {
    const processAudio = async () => {
      if (isFinishing && audioBlob) {
        setProcessError(null);
        try {
          // Step 1: Transcribe
          setProcessingStatus("Uploading and Transcribing Audio...");
          
          const formData = new FormData();
          formData.append('audio', audioBlob);
          formData.append('patientData', JSON.stringify(patientData));
          formData.append('chiefComplaints', chiefComplaints);
          formData.append('previousHistory', JSON.stringify(patientHistory));

          const initialDataResStr = await transcribeAudioAction(formData);
          const initialDataRes = JSON.parse(initialDataResStr);

          if (!initialDataRes.success) {
            throw new Error(initialDataRes.error || "Transcription failed");
          }

          const initialData = initialDataRes.data;
          setTranscribedText(initialData.raw_transcription || null);

          // Step 2: Verify
          setProcessingStatus("Verifying medicines with Medex...");
          
          const selectedPreferences = {
            diagnosticCentres: selectedDiagnosticCentres,
            pharmaCompanies: selectedPharmaCompanies,
            pharmacies: selectedPharmacies
          };

          const finalDataResStr = await verifyPrescriptionAction(
            JSON.stringify(initialData), 
            JSON.stringify(selectedPreferences), 
            JSON.stringify(patientData), 
            JSON.stringify(patientHistory)
          );
          
          const finalDataRes = JSON.parse(finalDataResStr);

          if (!finalDataRes.success) {
             throw new Error(finalDataRes.error || "Verification failed");
          }

          const finalData = finalDataRes.data;

          setProcessingStatus("Finalizing Prescription...");
          onPrescriptionGenerated(finalData as PrescriptionData);

        } catch (e: any) {
          console.error("Audio Processing Error:", e);
          setProcessingStatus(null);
          setProcessError(`ERROR: ${e.message || 'Unknown processing error'}`);
        } finally {
          setIsFinishing(false);
        }
      }
    };

    processAudio();
  }, [isFinishing, audioBlob, chiefComplaints, patientData, selectedDiagnosticCentres, selectedPharmaCompanies, selectedPharmacies, onPrescriptionGenerated]);

  const handleStopAndGenerate = () => {
    if (isRecording) {
      stopRecording();
    }
    // Set finishing flag to trigger the useEffect once audioBlob is updated
    setIsFinishing(true);
    setProcessingStatus("Finalizing recording...");
    setProcessError(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 relative pb-20">
      
      {/* Floating Status Bar */}
      <AnimatePresence>
        {processingStatus && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700 min-w-[320px] max-w-[90vw]"
          >
            <div className="relative shrink-0">
               <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-emerald-50">{processingStatus}</p>
              {transcribedText ? (
                <div className="mt-1 p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                   <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">ElevenLabs Transcription:</p>
                   <p className="text-xs text-slate-200 line-clamp-2 italic italic italic italic italic">"{transcribedText}"</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Processing audio through ElevenLabs...</p>
              )}
            </div>
          </motion.div>
        )}

        {processError && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-rose-600/95 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-2xl flex items-start gap-4 border border-rose-500 min-w-[320px] max-w-[600px]"
          >
            <div className="relative pt-0.5">
               <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 pr-4">
              <p className="text-sm font-bold text-white mb-1">Processing Failed</p>
              <p className="text-xs text-rose-100 font-mono break-all">{processError}</p>
            </div>
            <button 
              onClick={() => setProcessError(null)}
              className="text-rose-200 hover:text-white transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
              onClick={handleStopAndGenerate}
              disabled={!!processingStatus || (!isRecording && !audioBlob)}
              className={cn(
                "w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2",
                processingStatus 
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] shadow-emerald-200"
              )}
            >
              {processingStatus ? (
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
              Clicking generate will stop the recording, transcribe, verify with Medex, and create the prescription.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
