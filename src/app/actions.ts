'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().regex(/^(?:\+8801|8801|01)[3-9]\d{8}$/, "Invalid Bangladeshi phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerUser(prevState: any, formData: FormData) {
  const fullName = formData.get('fullName') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const password = formData.get('password') as string;

  const validation = registerSchema.safeParse({ fullName, phoneNumber, password });

  if (!validation.success) {
    return {
      error: validation.error.errors[0].message,
    };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingUser) {
      return { error: 'User already exists with this phone number.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        phoneNumber,
        password: hashedPassword,
        role: 'DOCTOR',
        profile: {
          create: {
            name: fullName,
            qualifications: '',
            regNo: '',
            designation: '',
            clinics: [],
            diagnosticCentres: [],
            pharmaCompanies: [],
            pharmacies: [],
          },
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}
