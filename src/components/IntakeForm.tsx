import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Calendar, Weight, Activity, AlertCircle, ArrowRight, Ruler, HeartPulse, Phone, Plus, X, Search, History } from 'lucide-react';
import { PatientData } from '@/types';
import { cn } from '@/lib/utils';
import { getPatientHistoryAction } from '@/app/dashboard/actions';

interface IntakeFormProps {
  onComplete: (data: PatientData) => void;
  initialData?: PatientData;
  setPatientHistory?: (history: any[]) => void;
}

const CHRONIC_DISEASES_CATEGORIES = {
  "Cardiovascular": ['Heart Disease', 'Stroke', 'Hypertension', 'Heart Failure', 'Atrial Fibrillation'],
  "Metabolic & Endocrine": ['Type 2 Diabetes', 'Obesity', 'High Cholesterol', 'Thyroid Disease'],
  "Respiratory": ['COPD', 'Asthma', 'Emphysema', 'Chronic Bronchitis'],
  "Neurological": ['Alzheimer\'s/Dementia', 'Parkinson\'s', 'Depression', 'Multiple Sclerosis', 'Epilepsy'],
  "Musculoskeletal": ['Arthritis', 'Osteoporosis', 'Lupus', 'Chronic Fatigue'],
  "Other": ['Cancer', 'Chronic Kidney Disease', 'Liver Disease', 'HIV/AIDS', 'Hepatitis', 'Digestive Problems']
};

export function IntakeForm({ onComplete, initialData, setPatientHistory }: IntakeFormProps) {
  const [formData, setFormData] = useState<PatientData>(
    initialData || {
      name: '',
      phone: '',
      age: '',
      gender: '',
      weight: '',
      height: '',
      bp: '',
      chronicDiseases: [],
      allergies: ''
    }
  );

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customDiseaseName, setCustomDiseaseName] = useState('');

  // Real-time Search State
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Debounced search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (formData.phone && formData.phone.length >= 6) { // Search if at least 6 digits
        setIsSearching(true);
        try {
          const history = await getPatientHistoryAction(formData.phone);
          setSearchResults(history);
          setShowSearchResults(true);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [formData.phone]);


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

    setFormData(prev => ({
      ...prev,
      name: record.patientName || prev.name,
      age: currentAge || prev.age,
      gender: latestPatientData.gender || prev.gender,
      height: latestPatientData.height || prev.height,
      weight: latestPatientData.weight || prev.weight,
      chronicDiseases: latestPatientData.chronicDiseases?.length > 0 ? latestPatientData.chronicDiseases : prev.chronicDiseases,
    }));

    if (setPatientHistory) {
      // Pass the relevant history up to MainApp
      const recordsForPatient = searchResults.filter(r => r.patientName === record.patientName);
      setPatientHistory(recordsForPatient);
    }

    setShowSearchResults(false);
  };


  const toggleDisease = (disease: string) => {
    setFormData(prev => {
      const newDiseases = prev.chronicDiseases.includes(disease)
        ? prev.chronicDiseases.filter(d => d !== disease)
        : [...prev.chronicDiseases, disease];
      return { ...prev, chronicDiseases: newDiseases };
    });
  };

  const handleAddCustomDisease = () => {
    if (customDiseaseName.trim() !== '') {
      const formattedDisease = customDiseaseName.trim();
      if (!formData.chronicDiseases.includes(formattedDisease)) {
        setFormData(prev => ({
          ...prev,
          chronicDiseases: [...prev.chronicDiseases, formattedDisease]
        }));
      }
      setCustomDiseaseName('');
      setShowCustomInput(false);
    }
  };

  // Derive custom diseases selected but not in the default list
  const allDefaultDiseases = Object.values(CHRONIC_DISEASES_CATEGORIES).flat();
  const customSelectedDiseases = formData.chronicDiseases.filter(d => !allDefaultDiseases.includes(d));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone && formData.age && formData.gender) {
        onComplete(formData);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Patient Intake</h2>
        <p className="text-slate-500">Please fill in the patient details to start the consultation.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Vitals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone (Mandatory identifier) with Real-time Search */}
          <div className="space-y-2 md:col-span-2 relative">
            <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                Patient Phone Number <span className="text-rose-500">*</span>
              </span>
              {isSearching && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-spin text-emerald-500" />
                  Searching...
                </span>
              )}
            </label>
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                onFocus={() => { if (searchResults.length > 0) setShowSearchResults(true); }}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                placeholder="e.g. 01XXXXXXXXX"
              />
            </div>

            {/* Dropdown for Realtime Search Results */}
            <AnimatePresence>
              {showSearchResults && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                >
                  <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Results</span>
                    <button type="button" onClick={() => setShowSearchResults(false)} className="text-xs text-slate-400 hover:text-slate-700 p-1">Close</button>
                  </div>
                  {searchResults.length > 0 ? (
                    <div className="max-h-[40vh] overflow-y-auto">
                      {Array.from(new Set(searchResults.map(r => r.patientName))).map((uniqueName, index) => {
                        const recordsForPatient = searchResults.filter(r => r.patientName === uniqueName);
                        const latestRecord = recordsForPatient[0];
                        return (
                          <button
                            key={index}
                            type="button"
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
                      No previous records found.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Name */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500" />
              Patient Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              placeholder="e.g. Rahim Uddin"
            />
          </div>

          {/* Age */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Age <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              value={formData.age}
              onChange={e => setFormData(prev => ({ ...prev, age: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              placeholder="e.g. 45"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500" />
              Gender <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.gender}
              onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all bg-white"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Weight className="w-4 h-4 text-emerald-500" />
              Weight (kg)
            </label>
            <input
              type="number"
              value={formData.weight}
              onChange={e => setFormData(prev => ({ ...prev, weight: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              placeholder="e.g. 70"
            />
          </div>

          {/* Height */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-emerald-500" />
              Height (cm/ft)
            </label>
            <input
              type="text"
              value={formData.height}
              onChange={e => setFormData(prev => ({ ...prev, height: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              placeholder="e.g. 170 cm or 5'7&quot;"
            />
          </div>

          {/* BP */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-emerald-500" />
              Blood Pressure (mmHg)
            </label>
            <input
              type="text"
              value={formData.bp}
              onChange={e => setFormData(prev => ({ ...prev, bp: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              placeholder="e.g. 120/80"
            />
          </div>
        </div>

        {/* Chronic Diseases */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Chronic Diseases
            </label>
            <button
              type="button"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-xs flex items-center gap-1 font-medium text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg"
            >
              {showCustomInput ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showCustomInput ? 'Cancel' : 'Add Custom'}
            </button>
          </div>
          
          {showCustomInput && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 mb-4"
            >
              <input
                type="text"
                value={customDiseaseName}
                onChange={(e) => setCustomDiseaseName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomDisease();
                  }
                }}
                placeholder="Type custom disease name..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              />
              <button
                type="button"
                onClick={handleAddCustomDisease}
                disabled={!customDiseaseName.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                Add
              </button>
            </motion.div>
          )}

          <div className="space-y-6">
            {customSelectedDiseases.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Custom (Added)</h3>
                <div className="flex flex-wrap gap-2">
                  {customSelectedDiseases.map(disease => (
                    <button
                      key={disease}
                      type="button"
                      onClick={() => toggleDisease(disease)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm"
                    >
                      {disease}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {Object.entries(CHRONIC_DISEASES_CATEGORIES).map(([category, diseases]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {diseases.map(disease => (
                    <button
                      key={disease}
                      type="button"
                      onClick={() => toggleDisease(disease)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                        formData.chronicDiseases.includes(disease)
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:bg-slate-50"
                      )}
                    >
                      {disease}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-500" />
            Known Allergies
          </label>
          <textarea
            value={formData.allergies}
            onChange={e => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all resize-none h-24"
            placeholder="List any known drug or food allergies..."
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Start Consultation
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
