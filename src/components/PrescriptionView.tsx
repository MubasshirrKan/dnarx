import React from 'react';
import { PrescriptionData, DoctorPreferences } from '@/types';
import { X, Printer } from 'lucide-react';

interface PrescriptionViewProps {
  data: PrescriptionData;
  onClose: () => void;
  doctorProfile: DoctorPreferences['profile'];
}

export function PrescriptionView({ data, onClose, doctorProfile }: PrescriptionViewProps) {
  // Use the first clinic from profile for display
  const selectedClinic = doctorProfile.clinics[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col print:h-auto print:shadow-none print:rounded-none print:w-full">
        
        {/* Header Actions (Hidden in Print) */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 print:hidden">
          <h2 className="font-bold text-slate-800">Prescription Preview</h2>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 text-sm"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prescription Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto print:overflow-visible bg-slate-100/50 print:bg-white p-4 md:p-8">
          <div className="bg-white shadow-sm border border-slate-200 min-h-[1000px] w-full relative flex flex-col print:shadow-none print:border-none print:min-h-0">
            
            {/* Header Section */}
            <div className="bg-emerald-50 p-8 border-b border-emerald-100 print:bg-emerald-50 print:border-b-2 print:border-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-emerald-900 print:text-black">{doctorProfile.name}</h1>
                  <p className="text-emerald-700 font-medium print:text-black">{doctorProfile.qualifications}</p>
                  <p className="text-emerald-600 text-sm mt-1 print:text-black">Reg No: {doctorProfile.regNo}</p>
                  <p className="text-emerald-600 text-sm print:text-black">{doctorProfile.designation}</p>
                </div>
                {selectedClinic && (
                  <div className="text-right max-w-xs">
                    <div className="text-emerald-900 font-bold text-xl print:text-black">{selectedClinic.name}</div>
                    <p className="text-emerald-600 text-sm print:text-black">{selectedClinic.address}</p>
                    <p className="text-emerald-600 text-sm print:text-black">{selectedClinic.phone}</p>
                    
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
                <span className="font-bold text-slate-900 print:text-black">{data.patientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 print:text-black">Age:</span>
                <span className="text-slate-900 print:text-black">{data.patientAge}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 print:text-black">Gender:</span>
                <span className="text-slate-900 print:text-black">{data.patientGender}</span>
              </div>
               <div className="flex items-center gap-2 ml-auto">
                <span className="font-semibold text-slate-700 print:text-black">Date:</span>
                <span className="text-slate-900 print:text-black">{new Date().toLocaleDateString('en-GB')}</span>
              </div>
            </div>

            {/* Main Body */}
            <div className="flex flex-1 flex-col md:flex-row print:block">
              {/* Sidebar */}
              <div className="w-full md:w-1/3 print:w-1/3 print:float-left p-6 border-r border-slate-200 print:border-r print:border-slate-300 bg-slate-50/50 print:bg-slate-50 print:h-full">
                {/* Symptoms */}
                {data.symptoms.length > 0 && (
                  <div className="mb-8 break-inside-avoid">
                    <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider border-b-2 border-slate-300 inline-block pb-1 mb-2 print:text-black">Symptoms</h3>
                    <ul className="list-disc pl-4 text-sm text-slate-700 print:text-black">
                      {data.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                
                {/* Diagnosis */}
                {data.diagnosis.length > 0 && (
                  <div className="mb-8 break-inside-avoid">
                    <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider border-b-2 border-slate-300 inline-block pb-1 mb-2 print:text-black">Diagnosis</h3>
                    <ul className="list-disc pl-4 text-sm text-slate-700 font-medium print:text-black">
                      {data.diagnosis.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                )}

                {/* Tests */}
                <div className="mb-8 break-inside-avoid">
                  <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider border-b-2 border-slate-300 inline-block pb-1 mb-2 print:text-black">Tests / Inv.</h3>
                  {data.recommendedDiagnosticCentre && (
                     <div className="mt-2 text-xs text-slate-500 print:text-black">
                        <strong>Rec. Centre:</strong> {data.recommendedDiagnosticCentre}
                     </div>
                  )}
                </div>
              </div>

              {/* Medicines */}
              <div className="w-full md:w-2/3 print:w-2/3 p-8">
                <div className="mb-6">
                  <span className="text-4xl font-serif font-bold text-emerald-800 print:text-black italic">Rx</span>
                </div>
                
                <div className="space-y-6">
                  {data.medicines.map((med, index) => (
                    <div key={index} className="pl-4 border-l-2 border-transparent hover:border-emerald-200 transition-colors print:border-none break-inside-avoid">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-400 w-6 print:text-black">{index + 1}.</span>
                        <div className="font-bold text-lg text-slate-900 print:text-black">{med.name}</div>
                        <div className="text-sm font-medium text-slate-600 print:text-black">{med.dosage}</div>
                      </div>
                      <div className="pl-8 text-sm text-slate-600 print:text-black flex gap-4">
                        <span>{med.frequency}</span>
                        <span className="text-slate-300 print:hidden">|</span>
                        <span>{med.duration}</span>
                        <span className="text-slate-300 print:hidden">|</span>
                        <span className="italic">{med.instruction}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Advice */}
                {data.advice.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-slate-200 print:border-black break-inside-avoid">
                    <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider mb-2 print:text-black">Advice / পরামর্শ</h3>
                    <ul className="list-disc pl-5 space-y-1 text-slate-700 print:text-black">
                      {data.advice.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
                
                {data.recommendedPharmacy && (
                    <div className="mt-6 pt-4 border-t border-dashed border-slate-200 print:border-black break-inside-avoid">
                        <span className="text-xs font-bold text-slate-500 uppercase print:text-black">Recommended Pharmacy:</span>
                        <span className="ml-2 text-sm text-slate-900 print:text-black">{data.recommendedPharmacy}</span>
                    </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto p-8 border-t border-slate-200 print:border-black break-inside-avoid">
               <div className="flex justify-between items-end">
                <div className="text-xs text-slate-400 print:text-black w-1/2">
                  <p>Generated by RxVoice Assistant</p>
                </div>
                <div className="text-center w-48">
                  <div className="h-16 border-b border-slate-900 mb-2"></div>
                  <p className="font-bold text-slate-900 print:text-black">Signature</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
