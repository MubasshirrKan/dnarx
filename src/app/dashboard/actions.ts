'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { DoctorPreferences } from '@/types';
import { GoogleGenAI } from "@google/genai";
import { revalidatePath } from 'next/cache';
import { Buffer } from 'node:buffer';

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function getDoctorPreferences(): Promise<DoctorPreferences> {
  const session = await getSession();
  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    throw new Error('Profile not found');
  }

  return {
    diagnosticCentres: profile.diagnosticCentres,
    pharmaCompanies: profile.pharmaCompanies,
    pharmacies: profile.pharmacies,
    profile: {
      name: profile.name,
      qualifications: profile.qualifications,
      regNo: profile.regNo,
      designation: profile.designation,
      clinics: (profile.clinics as any[]) || [],
    },
  };
}

export async function saveDoctorPreferences(preferences: DoctorPreferences) {
  const session = await getSession();
  
  // Validation
  const { profile } = preferences;
  if (!profile.name || !profile.regNo || !profile.qualifications || !profile.designation) {
    throw new Error('All profile fields are required.');
  }
  if (!profile.clinics || profile.clinics.length === 0) {
    throw new Error('At least one clinic is required.');
  }

  await prisma.doctorProfile.update({
    where: { userId: session.user.id },
    data: {
      name: profile.name,
      qualifications: profile.qualifications,
      regNo: profile.regNo,
      designation: profile.designation,
      clinics: profile.clinics as any,
      diagnosticCentres: preferences.diagnosticCentres,
      pharmaCompanies: preferences.pharmaCompanies,
      pharmacies: preferences.pharmacies,
    },
  });
  
  revalidatePath('/dashboard');
  return { success: true };
}

// Gemini Action
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function processAudioAction(formData: FormData) {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const audioFile = formData.get('audio') as File;
  const patientDataStr = formData.get('patientData') as string;
  const chiefComplaints = formData.get('chiefComplaints') as string;
  const preferencesStr = formData.get('preferences') as string;

  if (!audioFile) throw new Error('No audio file provided');

  const patientData = JSON.parse(patientDataStr);
  const selectedPreferences = JSON.parse(preferencesStr);

  const arrayBuffer = await audioFile.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString('base64');

  const prompt = `
      You are an expert medical assistant for a doctor in Bangladesh. 
      
      Patient Details:
      - Name: ${patientData.name}
      - Age: ${patientData.age}
      - Gender: ${patientData.gender || 'Not specified'}
      - Weight: ${patientData.weight || 'Not specified'}
      - Height: ${patientData.height || 'Not specified'}
      - Blood Pressure: ${patientData.bp || 'Not specified'}
      - Chronic Diseases: ${patientData.chronicDiseases.join(', ') || 'None'}
      - Known Allergies: ${patientData.allergies || 'None'}
      
      Doctor's Initial Notes (Chief Complaints):
      ${chiefComplaints}

      Doctor's Preferences:
      - Preferred Pharmaceutical Companies: ${selectedPreferences?.pharmaCompanies?.join(', ') || 'None specified'}
      - Preferred Diagnostic Centres: ${selectedPreferences?.diagnosticCentres?.join(', ') || 'None specified'}
      - Preferred Pharmacies: ${selectedPreferences?.pharmacies?.join(', ') || 'None specified'}

      Task:
      Listen to the doctor-patient conversation provided in the audio and extract the prescription details.
      Combine the audio information with the provided patient details and doctor's notes.
      
      IMPORTANT:
      - Use the patient's age, gender, weight, height, blood pressure, and medical history to calculate safe dosages and check for contraindications.
      - Incorporate the chief complaints into the symptoms or diagnosis section if relevant.
      - If the audio contradicts the initial notes, prioritize the audio but note the discrepancy if significant.
      - **Medicine Suggestions**: Prioritize medicines from the "Preferred Pharmaceutical Companies" listed above. If a generic medicine is identified, try to suggest a brand name from these companies if available in Bangladesh.
      - **Diagnostic Suggestions**: If any tests are recommended, suggest the "Preferred Diagnostic Centres" in the advice section or as a note.
      - **Pharmacy Suggestions**: Suggest the "Preferred Pharmacies" in the advice section or as a note.
      
      Output a JSON object with the following structure:
      {
        "patientName": "string (Use provided name: ${patientData.name})",
        "patientAge": "string (Use provided age: ${patientData.age})",
        "patientGender": "string (Use provided gender: ${patientData.gender})",
        "patientWeight": "string (Use provided weight: ${patientData.weight})",
        "patientHeight": "string (Use provided height: ${patientData.height})",
        "patientBp": "string (Use provided BP: ${patientData.bp})",
        "symptoms": ["string", "string"],
        "diagnosis": ["string", "string"],
        "medicines": [
          {
            "name": "string (Use popular Bangladeshi brand names like Napa, Seclo, Monas, Sergel, Maxpro, etc. where appropriate, or generic names. Prioritize brands from preferred companies: ${selectedPreferences?.pharmaCompanies?.join(', ')})",
            "dosage": "string (e.g., 500mg)",
            "frequency": "string (e.g., 1+0+1 or Twice daily)",
            "duration": "string (e.g., 5 days)",
            "instruction": "string (e.g., After meal)"
          }
        ],
        "advice": ["string", "string"],
        "recommendedDiagnosticCentre": "string (suggest one from preferences if applicable)",
        "recommendedPharmacy": "string (suggest one from preferences if applicable)"
      }
      
      Ensure the output is valid JSON. Do not include markdown code blocks.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: {
        parts: [
            {
              inlineData: {
                mimeType: audioFile.type || 'audio/webm',
                data: base64Data
              }
            },
            {
              text: prompt
            }
          ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) {
      console.error('Gemini API Response Empty:', JSON.stringify(response, null, 2));
      throw new Error("No response from AI");
    }
    
    const data = JSON.parse(text);
     // Add IDs to medicines for React keys
     const medicinesWithIds = (data.medicines || []).map((med: any) => ({
      ...med,
      id: crypto.randomUUID()
    }));

    return {
      ...data,
      medicines: medicinesWithIds
    };

  } catch (error: any) {
    console.error('Gemini API Error Full:', error);
    if (error.response) {
       console.error('Gemini API Error Response:', JSON.stringify(error.response, null, 2));
    }
    throw new Error(`Failed to process audio: ${error.message || 'Unknown error'}`);
  }
}
