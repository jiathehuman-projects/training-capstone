import DefaultLayout from '@/layouts/default';
import { title } from '@/components/primitives';
import { useAuth } from '@/contexts/AuthContext';
import { getPrimaryRole } from '@/components/roleUtils';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If somehow a staff-only user reaches here, redirect them away.
  useEffect(() => {
    const primary = getPrimaryRole(user?.roles);
    if (primary === 'staff') {
      navigate('/staff', { replace: true });
    } else if (primary === 'customer') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <DefaultLayout>
      <section className="py-16 text-center">
        <h1 className={title({ size: 'lg', class: 'text-white' })}>Manager / Admin Dashboard</h1>
        <p className="mt-4 text-gray-300">Placeholder: management analytics & controls will appear here.</p>
      </section>
    </DefaultLayout>
  );
}
