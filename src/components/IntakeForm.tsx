import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Calendar, Weight, Activity, AlertCircle, ArrowRight, Ruler, HeartPulse } from 'lucide-react';
import { PatientData } from '@/types';
import { cn } from '@/lib/utils';

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
    age: '',
    gender: '',
    weight: '',
    height: '',
    bp: '',
    chronicDiseases: [],
    allergies: ''
  });

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
