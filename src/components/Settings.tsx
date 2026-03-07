import { useState } from 'react';
import { Plus, Trash2, Save, X, User, Building, Clock, Phone, MapPin } from 'lucide-react';
import { DoctorPreferences, DoctorProfile, Clinic } from '../types';

interface SettingsProps {
  preferences: DoctorPreferences;
  onSave: (prefs: DoctorPreferences) => void;
  onClose: () => void;
}

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function Settings({ preferences, onSave, onClose }: SettingsProps) {
  const [localPrefs, setLocalPrefs] = useState<DoctorPreferences>(preferences);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');

  const addItem = (field: keyof Omit<DoctorPreferences, 'profile'>, value: string) => {
    if (!value.trim()) return;
    setLocalPrefs(prev => ({
      ...prev,
      [field]: [...prev[field], value]
    }));
  };

  const removeItem = (field: keyof Omit<DoctorPreferences, 'profile'>, index: number) => {
    setLocalPrefs(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateProfile = (field: keyof DoctorProfile, value: any) => {
    setLocalPrefs(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }));
  };

  const addClinic = () => {
    const newClinic: Clinic = {
      id: crypto.randomUUID(),
      name: '',
      address: '',
      phone: '',
      visitingHours: DAYS.reduce((acc, day) => ({ ...acc, [day]: '' }), {})
    };
    updateProfile('clinics', [...localPrefs.profile.clinics, newClinic]);
  };

  const removeClinic = (index: number) => {
    const newClinics = localPrefs.profile.clinics.filter((_, i) => i !== index);
    updateProfile('clinics', newClinics);
  };

  const updateClinic = (index: number, field: keyof Clinic, value: any) => {
    const newClinics = [...localPrefs.profile.clinics];
    newClinics[index] = { ...newClinics[index], [field]: value };
    updateProfile('clinics', newClinics);
  };

  const updateVisitingHours = (clinicIndex: number, day: string, value: string) => {
    const newClinics = [...localPrefs.profile.clinics];
    newClinics[clinicIndex] = {
      ...newClinics[clinicIndex],
      visitingHours: {
        ...newClinics[clinicIndex].visitingHours,
        [day]: value
      }
    };
    updateProfile('clinics', newClinics);
  };

  const handleSave = () => {
    onSave(localPrefs);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'profile' 
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Doctor Profile
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'preferences' 
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Preferences
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 flex-1 bg-slate-50/30">
          
          {activeTab === 'profile' && (
            <div className="space-y-8">
              {/* Basic Info */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Doctor Name</label>
                    <input
                      type="text"
                      value={localPrefs.profile.name}
                      onChange={(e) => updateProfile('name', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. Dr. Anisul Islam"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Registration No.</label>
                    <input
                      type="text"
                      value={localPrefs.profile.regNo}
                      onChange={(e) => updateProfile('regNo', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. A-12345"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Qualifications</label>
                    <input
                      type="text"
                      value={localPrefs.profile.qualifications}
                      onChange={(e) => updateProfile('qualifications', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. MBBS, FCPS (Medicine)"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Designation / Hospital</label>
                    <input
                      type="text"
                      value={localPrefs.profile.designation}
                      onChange={(e) => updateProfile('designation', e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="e.g. Consultant, Dhaka Medical College Hospital"
                    />
                  </div>
                </div>
              </div>

              {/* Clinics Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Building className="w-5 h-5 text-emerald-600" />
                    Clinics & Chambers
                  </h3>
                  <button 
                    onClick={addClinic}
                    className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Clinic
                  </button>
                </div>

                {localPrefs.profile.clinics.map((clinic, index) => (
                  <div key={clinic.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group">
                    <button 
                      onClick={() => removeClinic(index)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 p-1"
                      title="Remove Clinic"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Clinic Name</label>
                        <input
                          type="text"
                          value={clinic.name}
                          onChange={(e) => updateClinic(index, 'name', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                          placeholder="e.g. RxVoice Clinic"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Phone Number</label>
                        <input
                          type="text"
                          value={clinic.phone}
                          onChange={(e) => updateClinic(index, 'phone', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                          placeholder="e.g. +880 1711-000000"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700">Address</label>
                        <input
                          type="text"
                          value={clinic.address}
                          onChange={(e) => updateClinic(index, 'address', e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                          placeholder="e.g. House #12, Road #5, Dhanmondi, Dhaka"
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        Visiting Hours
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {DAYS.map(day => (
                          <div key={day} className="flex items-center gap-3">
                            <span className="text-xs font-medium text-slate-500 w-20">{day}</span>
                            <input
                              type="text"
                              value={clinic.visitingHours[day] || ''}
                              onChange={(e) => updateVisitingHours(index, day, e.target.value)}
                              className="flex-1 border border-slate-200 rounded px-3 py-1.5 text-sm focus:border-emerald-500 outline-none placeholder:text-slate-300"
                              placeholder="e.g. 4pm-9pm or Closed"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {localPrefs.profile.clinics.length === 0 && (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500 mb-2">No clinics added yet.</p>
                    <button 
                      onClick={addClinic}
                      className="text-emerald-600 font-medium hover:underline"
                    >
                      Add your first clinic
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <>
              {/* Diagnostic Centres */}
              <section>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Preferred Diagnostic Centres</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      id="new-diagnostic"
                      placeholder="Add Diagnostic Centre..." 
                      className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addItem('diagnosticCentres', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById('new-diagnostic') as HTMLInputElement;
                        addItem('diagnosticCentres', input.value);
                        input.value = '';
                      }}
                      className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {localPrefs.diagnosticCentres.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-slate-700">{item}</span>
                        <button onClick={() => removeItem('diagnosticCentres', idx)} className="text-rose-500 hover:text-rose-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                    {localPrefs.diagnosticCentres.length === 0 && (
                      <p className="text-slate-400 text-sm italic">No diagnostic centres added yet.</p>
                    )}
                  </ul>
                </div>
              </section>

              {/* Pharmaceutical Companies */}
              <section>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Preferred Pharmaceutical Companies</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      id="new-pharma"
                      placeholder="Add Pharma Company (e.g. Square, Beximco)..." 
                      className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addItem('pharmaCompanies', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById('new-pharma') as HTMLInputElement;
                        addItem('pharmaCompanies', input.value);
                        input.value = '';
                      }}
                      className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {localPrefs.pharmaCompanies.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-slate-700">{item}</span>
                        <button onClick={() => removeItem('pharmaCompanies', idx)} className="text-rose-500 hover:text-rose-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                    {localPrefs.pharmaCompanies.length === 0 && (
                      <p className="text-slate-400 text-sm italic">No pharma companies added yet.</p>
                    )}
                  </ul>
                </div>
              </section>

              {/* Pharmacies */}
              <section>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Preferred Pharmacies</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      id="new-pharmacy"
                      placeholder="Add Pharmacy..." 
                      className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addItem('pharmacies', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById('new-pharmacy') as HTMLInputElement;
                        addItem('pharmacies', input.value);
                        input.value = '';
                      }}
                      className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {localPrefs.pharmacies.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-slate-700">{item}</span>
                        <button onClick={() => removeItem('pharmacies', idx)} className="text-rose-500 hover:text-rose-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                    {localPrefs.pharmacies.length === 0 && (
                      <p className="text-slate-400 text-sm italic">No pharmacies added yet.</p>
                    )}
                  </ul>
                </div>
              </section>
            </>
          )}

        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-200 font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
