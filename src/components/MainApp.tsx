'use client';

import { useState, useEffect } from 'react';
import { IntakeForm } from './IntakeForm';
import { ActiveConsultation } from './ActiveConsultation';
import { PrescriptionEditor } from './PrescriptionEditor';
import { Settings } from './Settings';
import { Stethoscope, UserPlus, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { DoctorPreferences, PatientData, PrescriptionData } from '@/types';
import { processAudioAction, saveDoctorPreferences } from '@/app/dashboard/actions';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface MainAppProps {
  initialPreferences: DoctorPreferences;
}

export function MainApp({ initialPreferences }: MainAppProps) {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [step, setStep] = useState<'intake' | 'consultation' | 'prescription'>('intake');
  const [isProcessing, setIsProcessing] = useState(false);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  
  const [doctorPreferences, setDoctorPreferences] = useState<DoctorPreferences>(initialPreferences);

  // Check if profile is complete on load
  useEffect(() => {
    if (!initialPreferences.profile.name || initialPreferences.profile.clinics.length === 0) {
      setShowSettings(true);
    }
  }, [initialPreferences]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const handleIntakeComplete = (data: PatientData) => {
    setPatientData(data);
    setStep('consultation');
  };

  const handleGeneratePrescription = async (
    audioBlob: Blob, 
    chiefComplaints: string,
    selectedPreferences: {
      diagnosticCentres: string[];
      pharmaCompanies: string[];
      pharmacies: string[];
    }
  ) => {
    if (!patientData) return;
    
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('patientData', JSON.stringify(patientData));
      formData.append('chiefComplaints', chiefComplaints);
      formData.append('preferences', JSON.stringify(selectedPreferences));

      const data = await processAudioAction(formData);
      setPrescriptionData(data as PrescriptionData);
      setStep('prescription');
    } catch (error) {
      console.error('Failed to process audio:', error);
      alert('Failed to process audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewPatient = () => {
    setStep('intake');
    setPatientData(null);
    setPrescriptionData(null);
  };

  const handleBackToConsultation = () => {
    setStep('consultation');
    setPrescriptionData(null);
  };

  const handleSaveSettings = async (prefs: DoctorPreferences) => {
    try {
      await saveDoctorPreferences(prefs);
      setDoctorPreferences(prefs);
      setShowSettings(false);
    } catch (error) {
      console.error(error);
      alert('Failed to save settings. Please fill all required fields.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Navbar - Hidden when printing */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 print:hidden sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg text-white shadow-emerald-200 shadow-md">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">DNA Rx</h1>
              <p className="text-xs text-slate-500 font-medium">AI-Powered Clinical Precision</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {step !== 'intake' && (
              <button 
                onClick={handleNewPatient}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors bg-slate-100 hover:bg-emerald-50 px-4 py-2 rounded-lg"
              >
                <UserPlus className="w-4 h-4" />
                New Patient
              </button>
            )}
            <button 
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors bg-slate-100 hover:bg-emerald-50 px-3 py-2 rounded-lg"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="p-6">
        <div className="max-w-5xl mx-auto">
          {step === 'intake' && (
            <IntakeForm onComplete={handleIntakeComplete} />
          )}

          {step === 'consultation' && (
            <ActiveConsultation 
              onGenerate={handleGeneratePrescription}
              isProcessing={isProcessing}
              preferences={doctorPreferences}
            />
          )}

          {step === 'prescription' && prescriptionData && (
            <PrescriptionEditor 
              initialData={prescriptionData} 
              onBack={handleBackToConsultation}
              preferences={doctorPreferences}
            />
          )}
        </div>
      </main>

      {showSettings && (
        <Settings 
          preferences={doctorPreferences}
          onSave={handleSaveSettings}
          onClose={() => {
            // Only allow close if profile is valid
            if (doctorPreferences.profile.name && doctorPreferences.profile.clinics.length > 0) {
              setShowSettings(false);
            } else {
              alert('Please complete your profile to continue.');
            }
          }}
        />
      )}
    </div>
  );
}
