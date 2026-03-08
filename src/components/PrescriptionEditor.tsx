import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { Medicine, PrescriptionData, DoctorPreferences } from '@/types';
import { cn } from '@/lib/utils';
import { savePrescription, searchMedicineAction } from '@/app/dashboard/actions';

interface PrescriptionEditorProps {
  initialData: PrescriptionData;
  onBack: () => void;
  preferences: DoctorPreferences;
}

export function PrescriptionEditor({ initialData, onBack, preferences }: PrescriptionEditorProps) {
  const [data, setData] = useState<PrescriptionData>(initialData);
  const [isPrinting, setIsPrinting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState<string | null>(null);
  
  // Autocomplete states
  const [suggestions, setSuggestions] = useState<Medicine[]>([]);
  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const selectedClinic = preferences.profile.clinics.find(c => c.id === (preferences.profile.clinics[0]?.id || '')) || preferences.profile.clinics[0];

  // Update local state if initialData changes
  useEffect(() => {
    setData(initialData);
    setHasSaved(false); // Reset save state for new prescription
  }, [initialData]);

  const handleMedicineSearch = async (id: string, query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    
    setIsSearching(true);
    setActiveInputId(id);
    try {
      const results = await searchMedicineAction(query, preferences, {
        patientName: data.patientName,
        patientAge: data.patientAge,
        diagnosis: data.diagnosis
      });
      setSuggestions(results as Medicine[]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSuggestion = (id: string, suggestion: Medicine) => {
    setData(prev => ({
      ...prev,
      medicines: prev.medicines.map(med => 
        med.id === id ? { ...suggestion, id } : med
      )
    }));
    setSuggestions([]);
    setActiveInputId(null);
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    
    // Save to database before printing ONLY if not already saved
    if (!hasSaved) {
      try {
        await savePrescription(data);
        setHasSaved(true); // Mark as saved to prevent duplicates
      } catch (error) {
        console.error("Failed to save prescription:", error);
      }
    }

    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    setData(prev => ({
      ...prev,
      medicines: prev.medicines.map(med => 
        med.id === id ? { ...med, [field]: value } : med
      )
    }));
  };

  const addMedicine = () => {
    const newMed: Medicine = {
      id: crypto.randomUUID(),
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instruction: ''
    };
    setData(prev => ({
      ...prev,
      medicines: [...prev.medicines, newMed]
    }));
  };

  const removeMedicine = (id: string) => {
    setData(prev => ({
      ...prev,
      medicines: prev.medicines.filter(med => med.id !== id)
    }));
  };

  const updateField = (field: keyof PrescriptionData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'symptoms' | 'diagnosis' | 'advice', index: number, value: string) => {
    const newArray = [...data[field]];
    newArray[index] = value;
    setData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'symptoms' | 'diagnosis' | 'advice') => {
    setData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field: 'symptoms' | 'diagnosis' | 'advice', index: number) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getAlternatives = (medicineName: string) => {
    // Mock logic to generate alternatives based on preferred companies
    // In a real app, this would query a drug database
    const genericName = medicineName.split(' ')[0]; // Naive extraction
    return preferences.pharmaCompanies.map(company => ({
      name: `${genericName} (${company})`,
      company: company
    }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-20 print:p-0 print:max-w-none print:space-y-0">
      
      {/* Header / Actions (Hidden in Print) */}
      <div className="flex items-center justify-between print:hidden">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recorder
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Prescription
          </button>
        </div>
      </div>

      {/* Prescription Paper Layout */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden print:shadow-none print:rounded-none min-h-[1123px] print:min-h-0 w-full relative flex flex-col print:block" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
        
        {/* Header Section (Repeats on each page ideally, but basic block flow works) */}
        <div className="bg-emerald-50 p-8 border-b border-emerald-100 print:bg-emerald-50 print:border-b-2 print:border-slate-800 relative group">
          
          {/* Clinic Selector (Hidden in Print) */}
          {preferences.profile.clinics.length > 1 && (
            <div className="absolute top-4 right-4 print:hidden opacity-0 group-hover:opacity-100 transition-opacity">
              <select
                value={selectedClinicId}
                onChange={(e) => setSelectedClinicId(e.target.value)}
                className="bg-white border border-emerald-200 text-emerald-800 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              >
                {preferences.profile.clinics.map(clinic => (
                  <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-emerald-900 print:text-black">{preferences.profile.name}</h1>
              <p className="text-emerald-700 font-medium print:text-black">{preferences.profile.qualifications}</p>
              <p className="text-emerald-600 text-sm mt-1 print:text-black">Reg No: {preferences.profile.regNo}</p>
              <p className="text-emerald-600 text-sm print:text-black">{preferences.profile.designation}</p>
            </div>
            {selectedClinic && (
              <div className="text-right max-w-xs">
                <div className="text-emerald-900 font-bold text-xl print:text-black">{selectedClinic.name}</div>
                <p className="text-emerald-600 text-sm print:text-black">{selectedClinic.address}</p>
                <p className="text-emerald-600 text-sm print:text-black">{selectedClinic.phone}</p>
                
                {/* Visiting Hours Display */}
                <div className="mt-2 text-emerald-600 text-xs print:text-black">
                  {Object.entries(selectedClinic.visitingHours)
                    .filter(([_, time]) => time && time.toLowerCase() !== 'closed')
                    .map(([day, time]) => (
                      <div key={day} className="flex justify-end gap-2">
                        <span className="font-semibold w-16">{day.slice(0, 3)}:</span>
                        <span>{time}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Patient Info Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-wrap gap-6 text-sm print:bg-white print:border-b print:border-black">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 print:text-black">Name:</span>
            <input 
              type="text" 
              value={data.patientName || ''} 
              onChange={(e) => updateField('patientName', e.target.value)}
              className="bg-transparent border-b border-slate-300 focus:border-emerald-500 outline-none w-48 print:border-none"
              placeholder="Patient Name"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 print:text-black">Age:</span>
            <input 
              type="text" 
              value={data.patientAge || ''} 
              onChange={(e) => updateField('patientAge', e.target.value)}
              className="bg-transparent border-b border-slate-300 focus:border-emerald-500 outline-none w-16 print:border-none"
              placeholder="Age"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 print:text-black">Weight:</span>
            <input 
              type="text" 
              value={data.patientWeight || ''} 
              onChange={(e) => updateField('patientWeight', e.target.value)}
              className="bg-transparent border-b border-slate-300 focus:border-emerald-500 outline-none w-16 print:border-none"
              placeholder="kg"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 print:text-black">Height:</span>
            <input 
              type="text" 
              value={data.patientHeight || ''} 
              onChange={(e) => updateField('patientHeight', e.target.value)}
              className="bg-transparent border-b border-slate-300 focus:border-emerald-500 outline-none w-20 print:border-none"
              placeholder="cm/ft"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 print:text-black">BP:</span>
            <input 
              type="text" 
              value={data.patientBp || ''} 
              onChange={(e) => updateField('patientBp', e.target.value)}
              className="bg-transparent border-b border-slate-300 focus:border-emerald-500 outline-none w-20 print:border-none"
              placeholder="mmHg"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 print:text-black">Gender:</span>
            <input 
              type="text" 
              value={data.patientGender || ''} 
              onChange={(e) => updateField('patientGender', e.target.value)}
              className="bg-transparent border-b border-slate-300 focus:border-emerald-500 outline-none w-20 print:border-none"
              placeholder="Gender"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="font-semibold text-slate-700 print:text-black">Date:</span>
            <span className="text-slate-900 print:text-black">{new Date().toLocaleDateString('en-GB')}</span>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="flex flex-1 flex-col md:flex-row print:flex-row print:block">
          
          {/* Left Sidebar: Symptoms & Diagnosis */}
          <div className="w-full md:w-1/3 print:w-1/3 print:float-left p-6 border-r border-slate-200 print:border-r print:border-slate-300 bg-slate-50/50 print:bg-slate-50 flex flex-col print:h-full">
            
            {/* Symptoms */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider border-b-2 border-slate-300 inline-block pb-1 print:text-black">Symptoms</h3>
                <button onClick={() => addArrayItem('symptoms')} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded print:hidden">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <ul className="space-y-2">
                {data.symptoms.map((symptom, idx) => (
                  <li key={idx} className="group flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 print:bg-black flex-shrink-0" />
                    <input 
                      value={symptom}
                      onChange={(e) => handleArrayChange('symptoms', idx, e.target.value)}
                      className="bg-transparent w-full outline-none text-slate-700 print:text-black text-sm"
                      placeholder="Symptom..."
                    />
                    <button onClick={() => removeArrayItem('symptoms', idx)} className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 print:hidden">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Diagnosis */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider border-b-2 border-slate-300 inline-block pb-1 print:text-black">Diagnosis</h3>
                <button onClick={() => addArrayItem('diagnosis')} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded print:hidden">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <ul className="space-y-2">
                {data.diagnosis.map((item, idx) => (
                  <li key={idx} className="group flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 print:bg-black flex-shrink-0" />
                    <input 
                      value={item}
                      onChange={(e) => handleArrayChange('diagnosis', idx, e.target.value)}
                      className="bg-transparent w-full outline-none text-slate-700 font-medium print:text-black text-sm"
                      placeholder="Diagnosis..."
                    />
                    <button onClick={() => removeArrayItem('diagnosis', idx)} className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 print:hidden">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tests / Investigations */}
            <div className="mb-8 flex-1">
              <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider border-b-2 border-slate-300 inline-block pb-1 mb-3 print:text-black">Tests / Inv.</h3>
              <div className="h-24 border border-dashed border-slate-300 rounded p-2 text-xs text-slate-400 print:hidden mb-4">
                (Optional: Add tests here)
              </div>
              
              {/* Preferred Diagnostic Centre */}
              {preferences.diagnosticCentres.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 print:border-t print:border-black">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block print:text-black">Recommended Diagnostic Centre:</label>
                  <select 
                    value={data.recommendedDiagnosticCentre || ''}
                    onChange={(e) => updateField('recommendedDiagnosticCentre', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded p-1 text-sm outline-none focus:border-emerald-500 print:hidden"
                  >
                    <option value="">Select Centre...</option>
                    {preferences.diagnosticCentres.map((center, idx) => (
                      <option key={idx} value={center}>{center}</option>
                    ))}
                  </select>
                  {data.recommendedDiagnosticCentre && (
                    <p className="hidden print:block text-sm font-medium text-black mt-1">
                      {data.recommendedDiagnosticCentre}
                    </p>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Right Content: Rx */}
          <div className="w-full md:w-2/3 print:w-2/3 p-8 flex flex-col">
            <div className="mb-6">
              <span className="text-4xl font-serif font-bold text-emerald-800 print:text-black italic">Rx</span>
            </div>

            <div className="space-y-6 flex-1">
              {data.medicines.map((med, index) => (
                <div key={med.id} className="group relative pl-4 border-l-2 border-transparent hover:border-emerald-200 transition-colors print:border-none">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-400 w-6 print:text-black">{index + 1}.</span>
                    <div className="flex-1 relative">
                      <input 
                        value={med.name}
                        onChange={(e) => {
                          updateMedicine(med.id, 'name', e.target.value);
                          handleMedicineSearch(med.id, e.target.value);
                        }}
                        onFocus={() => med.name.length >= 2 && handleMedicineSearch(med.id, med.name)}
                        className="w-full text-lg font-bold text-slate-900 placeholder:text-slate-300 outline-none bg-transparent print:text-black"
                        placeholder="Medicine Name (e.g. Napa Extra)"
                      />
                      
                      {/* Autocomplete Suggestions */}
                      {activeInputId === med.id && (suggestions.length > 0 || isSearching) && (
                        <div className="absolute top-full left-0 z-[60] bg-white border border-slate-200 shadow-xl rounded-lg p-2 w-80 mt-1 print:hidden">
                           {isSearching && (
                             <div className="flex items-center gap-2 p-2 text-xs text-slate-500">
                               <Loader2 className="w-3 h-3 animate-spin" /> Searching Medex...
                             </div>
                           )}
                           <ul className="max-h-60 overflow-y-auto">
                              {suggestions.map((s, i) => (
                                <li key={i}>
                                  <button 
                                    onClick={() => selectSuggestion(med.id, s)}
                                    className="w-full text-left p-2 hover:bg-emerald-50 rounded transition-colors"
                                  >
                                    <div className="font-bold text-sm text-slate-900">{s.name}</div>
                                    <div className="text-[10px] text-slate-500">{s.dosage} • {s.frequency} • {s.instruction}</div>
                                  </button>
                                </li>
                              ))}
                           </ul>
                        </div>
                      )}

                      {/* Alternatives Dropdown (keeping old functionality if needed, but autocomplete is primary) */}
                      {showAlternatives === med.id && (
                        <div className="absolute top-full left-0 z-10 bg-white border border-slate-200 shadow-xl rounded-lg p-2 w-64 mt-1 print:hidden">
                          <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-500">Alternatives</span>
                            <button onClick={() => setShowAlternatives(null)} className="text-slate-400 hover:text-slate-600">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          {preferences.pharmaCompanies.length > 0 ? (
                            <ul className="space-y-1">
                              {getAlternatives(med.name).map((alt, i) => (
                                <li key={i}>
                                  <button 
                                    onClick={() => {
                                      updateMedicine(med.id, 'name', alt.name);
                                      setShowAlternatives(null);
                                    }}
                                    className="w-full text-left text-sm hover:bg-emerald-50 p-1.5 rounded transition-colors"
                                  >
                                    {alt.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-400 italic p-2">Add pharma companies in settings to see alternatives.</p>
                          )}
                        </div>
                      )}
                    </div>

                    <input 
                      value={med.dosage}
                      onChange={(e) => updateMedicine(med.id, 'dosage', e.target.value)}
                      className="w-24 text-right text-sm font-medium text-slate-600 placeholder:text-slate-300 outline-none bg-transparent print:text-black"
                      placeholder="500mg"
                    />
                    
                    {/* Swap Brand Button */}
                    <button 
                      onClick={() => setShowAlternatives(showAlternatives === med.id ? null : med.id)}
                      className="p-1 text-slate-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                      title="Find Alternatives"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 pl-8 text-sm text-slate-600 print:text-black">
                    <input 
                      value={med.frequency}
                      onChange={(e) => updateMedicine(med.id, 'frequency', e.target.value)}
                      className="w-32 outline-none bg-transparent placeholder:text-slate-300"
                      placeholder="1+0+1"
                    />
                    <span className="text-slate-300 print:hidden">|</span>
                    <input 
                      value={med.duration}
                      onChange={(e) => updateMedicine(med.id, 'duration', e.target.value)}
                      className="w-32 outline-none bg-transparent placeholder:text-slate-300"
                      placeholder="7 days"
                    />
                    <span className="text-slate-300 print:hidden">|</span>
                    <input 
                      value={med.instruction}
                      onChange={(e) => updateMedicine(med.id, 'instruction', e.target.value)}
                      className="flex-1 outline-none bg-transparent placeholder:text-slate-300 italic"
                      placeholder="After meal"
                    />
                  </div>

                  <button 
                    onClick={() => removeMedicine(med.id)}
                    className="absolute right-0 top-0 p-2 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button 
                onClick={addMedicine}
                className="flex items-center gap-2 text-emerald-600 font-medium hover:bg-emerald-50 px-4 py-2 rounded-lg transition-colors print:hidden"
              >
                <Plus className="w-4 h-4" />
                Add Medicine
              </button>
            </div>

            {/* Preferred Pharmacy */}
            {preferences.pharmacies.length > 0 && (
              <div className="mt-8 pt-4 border-t border-dashed border-slate-200 print:border-black">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block print:text-black">Recommended Pharmacy:</label>
                <select 
                  value={data.recommendedPharmacy || ''}
                  onChange={(e) => updateField('recommendedPharmacy', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded p-1 text-sm outline-none focus:border-emerald-500 print:hidden"
                >
                  <option value="">Select Pharmacy...</option>
                  {preferences.pharmacies.map((pharmacy, idx) => (
                    <option key={idx} value={pharmacy}>{pharmacy}</option>
                  ))}
                </select>
                {data.recommendedPharmacy && (
                  <p className="hidden print:block text-sm font-medium text-black mt-1">
                    {data.recommendedPharmacy}
                  </p>
                )}
              </div>
            )}

            {/* Advice Section */}
            <div className="mt-8 pt-8 border-t border-slate-200 print:border-black">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider print:text-black">Advice / পরামর্শ</h3>
                <button onClick={() => addArrayItem('advice')} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded print:hidden">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {data.advice.map((item, idx) => (
                  <li key={idx} className="group relative pl-1">
                    <input 
                      value={item}
                      onChange={(e) => handleArrayChange('advice', idx, e.target.value)}
                      className="w-full bg-transparent outline-none text-slate-700 print:text-black"
                      placeholder="Advice..."
                    />
                    <button 
                      onClick={() => removeArrayItem('advice', idx)} 
                      className="absolute -left-6 top-1 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 print:hidden"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto p-8 border-t border-slate-200 print:border-black">
          <div className="flex justify-between items-end">
            <div className="text-xs text-slate-400 print:text-black w-1/2">
              <p>Generated by RxVoice Assistant</p>
              <p>This prescription is valid only if signed by a registered physician.</p>
            </div>
            <div className="text-center w-48">
              <div className="h-16 border-b border-slate-900 mb-2"></div>
              <p className="font-bold text-slate-900 print:text-black">Signature</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18"/>
      <path d="m6 6 18 18"/>
    </svg>
  );
}
