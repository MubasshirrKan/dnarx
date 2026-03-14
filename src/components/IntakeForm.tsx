import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Calendar, Weight, Activity, AlertCircle, ArrowRight, Ruler, HeartPulse, Search, Phone, History } from 'lucide-react';
import { PatientData } from '@/types';
import { cn } from '@/lib/utils';
import { getPatientHistoryAction } from '@/app/dashboard/actions';

interface IntakeFormProps {
  onComplete: (data: PatientData) => void;
}

const CHRONIC_DISEASES_CATEGORIES = {
  "Cardiovascular": ['Heart Disease', 'Stroke', 'Hypertension', 'Heart Failure', 'Atrial Fibrillation'],
  "Metabolic & Endocrine": ['Type 2 Diabetes', 'Obesity', 'High Cholesterol', 'Thyroid Disease'],
  "Respiratory": ['COPD', 'Asthma', 'Emphysema', 'Chronic Bronchitis'],
  "Neurological": ['Alzheimer\'s/Dementia', 'Parkinson\'s', 'Depression', 'Multiple Sclerosis', 'Epilepsy'],
  "Musculoskeletal": ['Arthritis', 'Osteoporosis', 'Lupus', 'Chronic Fatigue'],
  "Other": ['Cancer', 'Chronic Kidney Disease', 'Liver Disease', 'HIV/AIDS', 'Hepatitis', 'Digestive Problems']
};

export function IntakeForm({ onComplete }: IntakeFormProps) {
  const [formData, setFormData] = useState<PatientData>({
    name: '',
    phone: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    bp: '',
    chronicDiseases: [],
    allergies: ''
  });

  const [isSearching, setIsSearching] = useState(false);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleSearchHistory = async () => {
    if (!formData.phone) return;
    setIsSearching(true);
    try {
      const history = await getPatientHistoryAction(formData.phone);
      setPatientHistory(history);
      setShowHistory(true);
      
      // Auto-fill some fields if history is found and current fields are empty
      if (history.length > 0) {
        const latest = history[0];
        const latestPatientData = latest.patientData as any;
        setFormData(prev => ({
          ...prev,
          name: prev.name || latest.patientName || '',
          age: prev.age || latestPatientData?.age || '',
          gender: prev.gender || latestPatientData?.gender || '',
          weight: prev.weight || latestPatientData?.weight || '',
          height: prev.height || latestPatientData?.height || '',
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleDisease = (disease: string) => {
    setFormData(prev => {
      const newDiseases = prev.chronicDiseases.includes(disease)
        ? prev.chronicDiseases.filter(d => d !== disease)
        : [...prev.chronicDiseases, disease];
      return { ...prev, chronicDiseases: newDiseases };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.age && formData.gender) {
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
        
        {/* Patient Phone and History Search */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-500" />
              Patient Phone Number
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={e => {
                  setFormData(prev => ({ ...prev, phone: e.target.value }));
                  if (showHistory) setShowHistory(false);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                placeholder="e.g. 01XXXXXXXXX"
              />
              <button
                type="button"
                onClick={handleSearchHistory}
                disabled={!formData.phone || isSearching}
                className="px-5 py-2 bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 font-medium flex items-center gap-2 disabled:opacity-50 transition-all border border-emerald-200"
              >
                {isSearching ? <Activity className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search History
              </button>
            </div>
          </div>

          {/* History Display */}
          {showHistory && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-100 shadow-inner"
            >
              <h3 className="text-sm font-semibold text-emerald-900 flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-emerald-600" />
                Previous Consultations ({patientHistory.length} found)
              </h3>
              
              {patientHistory.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {patientHistory.map((record) => {
                    const pData = record.prescriptionData as any;
                    return (
                    <div key={record.id} className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-emerald-800 text-sm">
                          {new Date(record.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-md text-slate-600">
                          {pData?.diagnosis?.[0] || 'Unspecified'}
                        </span>
                      </div>
                      
                      {pData?.symptoms && pData.symptoms.length > 0 && (
                        <p className="text-slate-600 text-xs mb-2 line-clamp-2">
                          <span className="font-medium text-slate-700">Symptoms:</span> {pData.symptoms.join(', ')}
                        </p>
                      )}
                      
                      {pData?.medicines && pData.medicines.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-50 flex flex-wrap gap-1">
                          {pData.medicines.slice(0, 3).map((med: any, i: number) => (
                            <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">
                              {med.name}
                            </span>
                          ))}
                          {pData.medicines.length > 3 && (
                            <span className="text-[10px] text-slate-500 px-1.5 py-0.5">+{pData.medicines.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm">
                  <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No previous records found for this phone number.
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Basic Vitals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Chronic Diseases
          </label>
          
          <div className="space-y-6">
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
