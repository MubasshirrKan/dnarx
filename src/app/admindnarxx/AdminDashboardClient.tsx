'use client';

import { useState } from 'react';
import { toggleDoctorStatus } from './actions';
import { Stethoscope, LogOut, CheckCircle, XCircle, Search, FileText, Calendar, X, Building, MapPin, Phone } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'motion/react';
import { DoctorProfile } from '@/types';

interface Doctor {
  id: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: Date;
  profile: (DoctorProfile & { diagnosticCentres: string[], pharmaCompanies: string[], pharmacies: string[] }) | null;
  prescriptions: any[];
}

export function AdminDashboardClient({ doctors: initialDoctors }: { doctors: any[] }) {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setDoctors(doctors.map(d => d.id === id ? { ...d, isActive: !currentStatus } : d));
    
    try {
      await toggleDoctorStatus(id, !currentStatus);
    } catch (error) {
      console.error(error);
      setDoctors(doctors.map(d => d.id === id ? { ...d, isActive: currentStatus } : d));
      alert('Failed to update status');
    }
  };

  const filteredDoctors = doctors.filter(doctor => 
    doctor.profile?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.phoneNumber.includes(searchTerm) ||
    doctor.profile?.regNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg text-white shadow-md">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">DNA Rx Admin</h1>
              <p className="text-xs text-slate-500 font-medium">System Administration</p>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">Doctor Management</h2>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, phone, or reg no..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Doctor Info</th>
                    <th className="px-6 py-4">Qualifications</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Prescriptions</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredDoctors.map((doctor) => (
                    <motion.tr 
                      key={doctor.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setSelectedDoctor(doctor)}
                          className="text-left hover:text-emerald-600 transition-colors group"
                        >
                          <div className="font-medium text-slate-900 group-hover:text-emerald-700">{doctor.profile?.name || 'Unset'}</div>
                          <div className="text-xs text-slate-500">{doctor.profile?.designation || 'Unset'}</div>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate" title={doctor.profile?.qualifications}>
                          {doctor.profile?.qualifications || 'N/A'}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Reg: {doctor.profile?.regNo || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500">
                        {doctor.phoneNumber}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          <FileText className="w-3 h-3" />
                          {doctor.prescriptions?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          doctor.isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {doctor.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {doctor.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(doctor.id, doctor.isActive)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                            doctor.isActive
                              ? 'bg-white border-red-200 text-red-600 hover:bg-red-50'
                              : 'bg-emerald-600 border-transparent text-white hover:bg-emerald-700'
                          }`}
                        >
                          {doctor.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredDoctors.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No doctors found matching your search.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Doctor Details Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedDoctor.profile?.name}</h3>
                  <p className="text-sm text-slate-500">{selectedDoctor.phoneNumber} • {selectedDoctor.profile?.designation}</p>
                </div>
                <button 
                  onClick={() => setSelectedDoctor(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Profile Details */}
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Building className="w-4 h-4 text-emerald-600" />
                        Clinics & Chambers
                      </h4>
                      {selectedDoctor.profile?.clinics?.length ? (
                        <div className="space-y-4">
                          {selectedDoctor.profile.clinics.map((clinic, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                              <div className="font-bold text-slate-800">{clinic.name}</div>
                              <div className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" /> {clinic.address}
                              </div>
                              <div className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                                <Phone className="w-3 h-3" /> {clinic.phone}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-sm italic">No clinics added.</p>
                      )}
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                       <h4 className="font-semibold text-slate-900 mb-4">Preferences</h4>
                       <div className="space-y-4">
                         <div>
                           <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pharma Companies</label>
                           <div className="flex flex-wrap gap-2 mt-2">
                             {selectedDoctor.profile?.pharmaCompanies?.map((p, i) => (
                               <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs border border-emerald-100">{p}</span>
                             ))}
                           </div>
                         </div>
                         <div>
                           <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diagnostic Centres</label>
                           <ul className="list-disc pl-4 mt-2 text-sm text-slate-600">
                             {selectedDoctor.profile?.diagnosticCentres?.map((d, i) => (
                               <li key={i}>{d}</li>
                             ))}
                           </ul>
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* Prescriptions List */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Recent Prescriptions
                    </h4>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                      {selectedDoctor.prescriptions?.map((prescription) => (
                        <div key={prescription.id} className="p-4 border border-slate-100 rounded-lg hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium text-slate-900">{prescription.patientName}</div>
                              <div className="text-xs text-slate-500">
                                {prescription.patientData?.age} • {prescription.patientData?.gender}
                              </div>
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(prescription.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-xs text-slate-600">
                            <strong>Diagnosis:</strong> {prescription.prescriptionData?.diagnosis?.join(', ') || 'N/A'}
                          </div>
                          <div className="text-xs text-slate-600 mt-1">
                            <strong>Meds:</strong> {prescription.prescriptionData?.medicines?.length || 0} items
                          </div>
                        </div>
                      ))}
                      {(!selectedDoctor.prescriptions || selectedDoctor.prescriptions.length === 0) && (
                        <div className="text-center py-10 text-slate-400">
                          No prescriptions generated yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}