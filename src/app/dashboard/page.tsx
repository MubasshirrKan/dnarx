import { MainApp } from '@/components/MainApp';
import { getDoctorPreferences } from './actions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // If user is ADMIN, redirect to Admin Panel?
  if (session.user.role === 'ADMIN') {
    redirect('/admindnarxx');
  }

  const preferences = await getDoctorPreferences();

  return <MainApp initialPreferences={preferences} />;
}
