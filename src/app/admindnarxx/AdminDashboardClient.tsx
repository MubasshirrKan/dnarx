'use client';

import { useState } from 'react';
import { toggleDoctorStatus } from './actions';
import { Stethoscope, LogOut, CheckCircle, XCircle, Search } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { motion } from 'motion/react';

interface Doctor {
  id: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: Date;
  profile: {
    name: string;
    qualifications: string;
    regNo: string;
    designation: string;
  } | null;
}

export function AdminDashboardClient({ doctors: initialDoctors }: { doctors: any[] }) {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setDoctors(doctors.map(d => d.id === id ? { ...d, isActive: !currentStatus } : d));
    
    try {
      await toggleDoctorStatus(id, !currentStatus);
    } catch (error) {
      // Revert on error
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
                        <div className="font-medium text-slate-900">{doctor.profile?.name || 'Unset'}</div>
                        <div className="text-xs text-slate-500">{doctor.profile?.designation || 'Unset'}</div>
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
    </div>
  );
}
