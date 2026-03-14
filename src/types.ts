export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instruction: string;
}

export interface PatientData {
  name: string;
  phone: string;
  age: string;
  gender: string;
  weight?: string;
  height?: string;
  bp?: string;
  chronicDiseases: string[];
  allergies?: string;
}

export interface PrescriptionData {
  patientName?: string;
  patientPhone?: string;
  patientAge?: string;
  patientGender?: string;
  patientWeight?: string;
  patientHeight?: string;
  patientBp?: string;
  symptoms: string[];
  diagnosis: string[];
  medicines: Medicine[];
  advice: string[];
  recommendedDiagnosticCentre?: string;
  recommendedPharmacy?: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  visitingHours: {
    [key: string]: string; // e.g., "Saturday": "4:00 PM - 9:00 PM"
  };
}

export interface DoctorProfile {
  name: string;
  qualifications: string;
  regNo: string;
  designation: string;
  clinics: Clinic[];
}

export interface DoctorPreferences {
  diagnosticCentres: string[];
  pharmaCompanies: string[];
  pharmacies: string[];
  profile: DoctorProfile;
}
