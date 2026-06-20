import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const password = process.env.SITE_PASSWORD || 'easykorea2025';
  const access = cookieStore.get('ek_access');

  if (!access || access.value !== password) {
    redirect('/access');
  }

  return <>{children}</>;
}
