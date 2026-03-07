import { getDoctors } from './actions';
import { AdminDashboardClient } from './AdminDashboardClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const doctors = await getDoctors();

  return <AdminDashboardClient doctors={doctors} />;
}
