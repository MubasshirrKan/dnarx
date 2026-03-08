'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
}

export async function getDoctors() {
  await checkAdmin();
  return prisma.user.findMany({
    where: { role: 'DOCTOR' },
    include: {
      profile: true,
      prescriptions: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function toggleDoctorStatus(doctorId: string, isActive: boolean) {
  await checkAdmin();
  await prisma.user.update({
    where: { id: doctorId },
    data: { isActive },
  });
  revalidatePath('/admindnarxx');
}
