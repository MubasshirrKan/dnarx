'use client';

import { useState, useEffect } from 'react';
import { IntakeForm } from './IntakeForm';
import { ActiveConsultation } from './ActiveConsultation';
import { PrescriptionEditor } from './PrescriptionEditor';
import { Settings } from './Settings';
import { Stethoscope, UserPlus, LogOut, Settings as SettingsIcon, Search, Activity, History } from 'lucide-react';
import { DoctorPreferences, PatientData, PrescriptionData } from '@/types';
import { saveDoctorPreferences, getPatientHistoryAction } from '@/app/dashboard/actions';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface MainAppProps {
  initialPreferences: DoctorPreferences;
}

export function MainApp({ initialPreferences }: MainAppProps) {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [step, setStep] = useState<'intake' | 'consultation' | 'prescription'>('intake');
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionData | null>(null);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  
  const [doctorPreferences, setDoctorPreferences] = useState<DoctorPreferences>(initialPreferences);

  // Search State
  const [searchPhone, setSearchPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  const handlePrescriptionGenerated = (data: PrescriptionData) => {
    setPrescriptionData(data);
    setStep('prescription');
  };

  const handleNewPatient = () => {
    setStep('intake');
    setPatientData(null);
    setPrescriptionData(null);
    setPatientHistory([]);
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

  const handleSearchHistory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchPhone || searchPhone.trim() === '') return;
    
    setIsSearching(true);
    try {
      const history = await getPatientHistoryAction(searchPhone);
      setSearchResults(history);
      setShowSearchResults(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (record: any) => {
    const latestPatientData = record.patientData || {};
    
    // Calculate Age based on previous record
    let currentAge = latestPatientData.age;
    if (latestPatientData.age && !isNaN(Number(latestPatientData.age))) {
      const recordDate = new Date(record.createdAt);
      const today = new Date();
      
      let ageDiff = today.getFullYear() - recordDate.getFullYear();
      const m = today.getMonth() - recordDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < recordDate.getDate())) {
          ageDiff--;
      }
      
      if (ageDiff > 0) {
        currentAge = (Number(latestPatientData.age) + ageDiff).toString();
      }
    }

    const prefilledData: PatientData = {
      name: record.patientName || '',
      phone: record.patientPhone || searchPhone,
      age: currentAge || '',
      gender: latestPatientData.gender || '',
      height: latestPatientData.height || '',
      weight: latestPatientData.weight || '',
      bp: '',
      chronicDiseases: latestPatientData.chronicDiseases || [],
      allergies: ''
    };

    setPatientData(prefilledData);
    setPatientHistory(searchResults);
    setStep('intake');
    setShowSearchResults(false);
    setSearchPhone(''); // clear search
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 print:hidden sticky top-0 z-50 shadow-sm relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-emerald-500 p-2 rounded-lg text-white shadow-emerald-200 shadow-md">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">DNA Rx</h1>
              <p className="text-xs text-slate-500 font-medium">AI-Powered Clinical Precision</p>
            </div>
          </div>

          {/* Global Patient Search Bar */}
          <div className="flex-1 max-w-xl mx-auto relative">
            <form onSubmit={handleSearchHistory} className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3" />
              <input
                type="tel"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Search patient by phone..."
                className="w-full pl-10 pr-24 py-2.5 bg-slate-100 border-transparent focus:bg-white border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-full outline-none transition-all text-sm"
              />
              <button
                type="submit"
                disabled={!searchPhone || isSearching}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full transition-colors disabled:opacity-50 flex items-center justify-center min-w-[70px]"
              >
                {isSearching ? <Activity className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </form>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-[100]">
                <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Results</span>
                  <button onClick={() => setShowSearchResults(false)} className="text-xs text-slate-400 hover:text-slate-700">Close</button>
                </div>
                {searchResults.length > 0 ? (
                  <div className="max-h-[60vh] overflow-y-auto">
                    {/* Group by patient to avoid duplicating same patient clicks for every consultation */}
                    {Array.from(new Set(searchResults.map(r => r.patientName))).map((uniqueName, index) => {
                      const recordsForPatient = searchResults.filter(r => r.patientName === uniqueName);
                      const latestRecord = recordsForPatient[0];
                      return (
                        <button
                          key={index}
                          onClick={() => handleSelectSearchResult(latestRecord)}
                          className="w-full text-left p-4 hover:bg-emerald-50 border-b border-slate-50 transition-colors flex flex-col gap-1 last:border-0"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-800">{latestRecord.patientName || 'Unknown Patient'}</span>
                            <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                              {recordsForPatient.length} Visit(s)
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex gap-3">
                            <span>Phone: {latestRecord.patientPhone || searchPhone}</span>
                            <span>Last Visit: {new Date(latestRecord.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                            Latest Diagnosis: {latestRecord.prescriptionData?.diagnosis?.join(', ') || 'N/A'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                    <History className="w-6 h-6 text-slate-300" />
                    No previous records found for "{searchPhone}"
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {step !== 'intake' && (
              <button 
                onClick={handleNewPatient}
                className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors bg-slate-100 hover:bg-emerald-50 px-4 py-2 rounded-lg"
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
            <IntakeForm onComplete={handleIntakeComplete} initialData={patientData || undefined} />
          )}

          {step === 'consultation' && patientData && (
            <ActiveConsultation 
              onPrescriptionGenerated={handlePrescriptionGenerated}
              preferences={doctorPreferences}
              patientData={patientData}
              patientHistory={patientHistory}
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