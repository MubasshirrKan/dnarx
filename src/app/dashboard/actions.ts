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
      
      MEDICINE SELECTION RULES (CRITICAL):
      1. **VERIFY WITH GOOGLE SEARCH (medex.com.bd):** You MUST use the \`googleSearch\` tool to verify every medicine. Specifically search for the medicine brand name on \`https://medex.com.bd/\` to ensure it is a valid, currently available product in Bangladesh.
      2. **Preferred Companies First:** You MUST prioritize medicines from the "Preferred Pharmaceutical Companies" list: [${selectedPreferences?.pharmaCompanies?.join(', ') || 'None specified'}].
      3. **Exact Brand Search:** For every medicine identified:
         - Search query example: "site:medex.com.bd [Medicine Name] [Company Name]"
         - Ensure the brand name matches the company. If the preferred company doesn't make that exact generic, find the equivalent brand they DO make using Medex data.
      4. **Suggest ALL Options:** Do NOT limit suggestions to a minimum. If multiple valid treatment options or supportive medicines exist based on the diagnosis and notes, include ALL of them.
      5. **Brand Name Priority:**
         - If a specific brand is mentioned in the audio, verify it on Medex. If it belongs to a preferred company, use it.
         - If it doesn't, or if a generic is used, find the brand from a preferred company on Medex.
      
      - **Diagnostic Suggestions:** If any tests are recommended, suggest the "Preferred Diagnostic Centres" in the advice section or as a note.
      - **Pharmacy Suggestions:** Suggest the "Preferred Pharmacies" in the advice section or as a note.
      
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
            "name": "string (Exact Brand Name found on medex.com.bd)",
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

  const generateContent = async (model: string) => {
    return await genAI.models.generateContent({
      model: model,
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
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });
  };

  try {
    let response;
    try {
      // Try with the latest model first
      response = await generateContent("gemini-2.0-flash");
    } catch (primaryError: any) {
      console.warn("Primary model (gemini-2.0-flash) failed, attempting fallback...", primaryError.message);
      // Wait for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Fallback to stable model
      response = await generateContent("gemini-1.5-flash");
    }

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
