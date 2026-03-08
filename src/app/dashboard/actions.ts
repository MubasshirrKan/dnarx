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

// Gemini Actions
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Step 1: Transcribe and Extract (No Search)
export async function transcribeAudioAction(formData: FormData) {
  if (!genAI) throw new Error("GEMINI_API_KEY is not set.");

  const audioFile = formData.get('audio') as File;
  const chiefComplaints = formData.get('chiefComplaints') as string;
  const patientDataStr = formData.get('patientData') as string;

  if (!audioFile) throw new Error('No audio file provided');
  
  const patientData = JSON.parse(patientDataStr);

  const arrayBuffer = await audioFile.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString('base64');

  const prompt = `
    You are an expert medical scribe.
    Patient: ${patientData.name}, Age: ${patientData.age}, Gender: ${patientData.gender}.
    Doctor's Notes: ${chiefComplaints}

    Task:
    1. Transcribe the audio conversation between doctor and patient accurately.
    2. Extract ALL symptoms, diagnosis, and a list of ALL medicines mentioned (generic or brand).
    3. Extract advice and recommended tests. For tests, ALWAYS use the standard, formal medical terminology (the "bookish" name, e.g., "Complete Blood Count (CBC)", "Ultrasonography of Whole Abdomen").
    
    Output a JSON object:
    {
      "symptoms": ["string"],
      "diagnosis": ["string"],
      "medicines_raw": ["string (name)"],
      "advice": ["string"],
      "transcript_summary": "string"
    }
    RETURN ONLY JSON.
  `;

  const generate = async (model: string) => {
    return await genAI.models.generateContent({
      model: model,
      contents: [
        {
          parts: [
            { inlineData: { mimeType: audioFile.type || 'audio/webm', data: base64Data } },
            { text: prompt }
          ]
        }
      ],
      config: { responseMimeType: "application/json" }
    });
  };

  try {
    let response;
    try {
      response = await generate("gemini-2.0-flash");
    } catch (e) {
      console.warn("Primary model failed, retrying with 1.5-flash...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      response = await generate("gemini-1.5-flash");
    }

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error('Transcription Error:', error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

// Step 2: Verify and Finalize (With Google Search)
export async function verifyPrescriptionAction(initialData: any, preferences: any, patientData: any) {
  if (!genAI) throw new Error("GEMINI_API_KEY is not set.");

  const prompt = `
    You are an expert medical assistant for a doctor in Bangladesh.
    
    Context:
    - Patient: ${patientData.name}, ${patientData.age}
    - Initial Findings: ${JSON.stringify(initialData)}
    - Preferred Pharma Companies: [${preferences?.pharmaCompanies?.join(', ') || 'None'}]
    - Preferred Diagnostic Centres: [${preferences?.diagnosticCentres?.join(', ') || 'None'}]
    - Preferred Pharmacies: [${preferences?.pharmacies?.join(', ') || 'None'}]

    CRITICAL TASK (VERIFICATION):
    1. For every medicine in "medicines_raw", VERIFY it using Google Search on \`medex.com.bd\`.
    2. Search query pattern: "site:medex.com.bd [Medicine Name] [Preferred Company]".
    3. If the mentioned medicine is NOT from a preferred company, FIND an equivalent brand from a preferred company using the search.
    4. If no preferred alternative exists, keep the original but verify its dosage forms available in BD.
    5. Suggest ALL possible relevant medicines based on diagnosis if they were implied but not explicitly named, ensuring they are from preferred companies.
    6. **STRICT RULE (TESTS):** For any tests or investigations, ALWAYS use the formal, standard medical terminology (the "bookish" name, e.g., "Ultrasonography of Whole Abdomen", "Serum Creatinine").
    7. **STRICT RULE (MEDICINES):** NEVER use vague names like "Painkiller", "Antibiotic", "Gastric medicine". ALWAYS use the specific Brand Name found on Medex (e.g., "Napa", "Seclo", "Azithrocin"). If a generic is transcribed, you MUST convert it to a verified Brand Name.

    Output a FINAL JSON object matching this structure:
    {
      "patientName": "${patientData.name}",
      "patientAge": "${patientData.age}",
      "patientGender": "${patientData.gender}",
      "patientWeight": "${patientData.weight || ''}",
      "patientHeight": "${patientData.height || ''}",
      "patientBp": "${patientData.bp || ''}",
      "symptoms": ["string"],
      "diagnosis": ["string"],
      "medicines": [
        {
          "name": "string (Verified Brand Name from Medex)",
          "dosage": "string (e.g. 500mg)",
          "frequency": "string (e.g. 1+0+1)",
          "duration": "string (e.g. 5 days)",
          "instruction": "string (e.g. After meal)"
        }
      ],
      "advice": ["string"],
      "recommendedDiagnosticCentre": "string (suggest from preferences)",
      "recommendedPharmacy": "string (suggest from preferences)"
    }
  `;

  const generate = async (model: string) => {
    return await genAI.models.generateContent({
      model: model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
  };

  try {
    let response;
    try {
      response = await generate("gemini-2.0-flash");
    } catch (e) {
      console.warn("Primary verification model failed, retrying...", e);
      await new Promise(resolve => setTimeout(resolve, 2000));
      response = await generate("gemini-1.5-flash");
    }

    const text = response.text;
    if (!text) throw new Error("No response from AI during verification");

    // Sanitize JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : text;
    const data = JSON.parse(jsonString);

    // Add IDs
    const medicinesWithIds = (data.medicines || []).map((med: any) => ({
      ...med,
      id: crypto.randomUUID()
    }));

    return {
      ...data,
      medicines: medicinesWithIds
    };

  } catch (error: any) {
    console.error('Verification Error:', error);
    throw new Error(`Verification failed: ${error.message}`);
  }
}

export async function searchMedicineAction(query: string, preferences: any, patientContext: any) {
  if (!genAI) throw new Error("GEMINI_API_KEY is not set.");
  if (query.length < 2) return [];

  const prompt = `
    You are an intelligent medical autocomplete assistant for doctors in Bangladesh.
    The doctor is typing: "${query}"
    
    Context:
    - Patient: ${patientContext.patientName}, Age ${patientContext.patientAge}, Diagnosis: ${patientContext.diagnosis?.join(', ')}
    - Preferred Pharma Companies: [${preferences?.pharmaCompanies?.join(', ')}]

    Task:
    1. Search \`medex.com.bd\` for brand names starting with or matching "${query}".
    2. Prioritize brands from the "Preferred Pharma Companies".
    3. Based on the patient's age and diagnosis, suggest the most appropriate 3-5 medicines.
    4. For each, provide the standard dosage, frequency, and instruction used in Bangladesh.

    Return a JSON array of objects:
    [
      {
        "name": "Exact Brand Name",
        "dosage": "e.g. 500mg",
        "frequency": "e.g. 1+0+1",
        "duration": "e.g. 5 days",
        "instruction": "e.g. After meal"
      }
    ]
    RETURN ONLY JSON.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
  } catch (error) {
    console.error('Autocomplete Error:', error);
    return [];
  }
}

export async function savePrescription(data: any) {
  const session = await getSession();
  
  // Extract patient phone if available, or leave null
  const patientPhone = null; 

  // Check for duplicate within the last 2 minutes
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const existingPrescription = await prisma.prescription.findFirst({
    where: {
      doctorId: session.user.id,
      patientName: data.patientName,
      createdAt: { gte: twoMinutesAgo },
    },
    orderBy: { createdAt: 'desc' },
  });

  // If a recent prescription exists, compare the content
  if (existingPrescription) {
    const existingDataStr = JSON.stringify(existingPrescription.prescriptionData);
    const newDataStr = JSON.stringify(data);
    
    // Deep comparison (simple stringify works for consistent object structures)
    if (existingDataStr === newDataStr) {
      console.log('Duplicate prescription detected, skipping save.');
      return { success: true, duplicate: true };
    }
  }

  await prisma.prescription.create({
    data: {
      doctorId: session.user.id,
      patientName: data.patientName,
      patientPhone: patientPhone,
      patientData: {
        age: data.patientAge,
        gender: data.patientGender,
        weight: data.patientWeight,
        height: data.patientHeight,
        bp: data.patientBp,
      },
      prescriptionData: data,
    },
  });

  return { success: true };
}