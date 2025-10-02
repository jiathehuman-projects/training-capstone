import DefaultLayout from '@/layouts/default';
import { title } from '@/components/primitives';
import { useAuth } from '@/contexts/AuthContext';
import { getPrimaryRole } from '@/components/roleUtils';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@heroui/button';

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
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className={title({ size: 'lg', class: 'text-white' })}>Manager / Admin Dashboard</h1>
          <p className="mt-4 text-gray-300">Manage your restaurant operations from here.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Menu Management Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-3">Menu Management</h3>
            <p className="text-gray-300 mb-4">
              Add, edit, and manage menu items, categories, pricing, and inventory.
            </p>
            <Button 
              color="primary"
              className="w-full"
              onPress={() => navigate('/manager/menu')}
            >
              Manage Menu
            </Button>
          </div>

          {/* Staff Management Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-3">Staff Management</h3>
            <p className="text-gray-300 mb-4">
              View staff list, roles, availability, and manage team members.
            </p>
            <Button 
              color="secondary"
              className="w-full"
              onPress={() => navigate('/manager/staff')}
            >
              Manage Staff
            </Button>
          </div>

          {/* Shift Applications Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-3">Shift Applications</h3>
            <p className="text-gray-300 mb-4">
              Review and approve staff shift applications with time conflict warnings.
            </p>
            <Button 
              color="warning"
              className="w-full"
              onPress={() => navigate('/manager/shifts')}
            >
              Review Applications
            </Button>
          </div>

          {/* Analytics Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-3">Analytics</h3>
            <p className="text-gray-300 mb-4">
              View sales reports, menu performance, staff utilization, and revenue analytics.
            </p>
            <Button 
              color="primary"
              className="w-full"
              onPress={() => navigate('/manager/analytics')}
            >
              View Analytics
            </Button>
          </div>

          {/* Orders Management Card - Placeholder */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-3">Orders Management</h3>
            <p className="text-gray-300 mb-4">
              Monitor active orders, update statuses, and track kitchen operations.
            </p>
            <Button 
              color="default"
              variant="flat"
              className="w-full"
              isDisabled
            >
              Coming Soon
            </Button>
          </div>

          {/* Settings Card - Placeholder */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-3">Settings</h3>
            <p className="text-gray-300 mb-4">
              Configure restaurant settings, payment options, and system preferences.
            </p>
            <Button 
              color="default"
              variant="flat"
              className="w-full"
              isDisabled
            >
              Coming Soon
            </Button>
          </div>

          {/* Reports Card - Placeholder */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-3">Reports</h3>
            <p className="text-gray-300 mb-4">
              Generate detailed reports for sales, inventory, and staff performance.
            </p>
            <Button 
              color="default"
              variant="flat"
              className="w-full"
              isDisabled
            >
              Coming Soon
            </Button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
