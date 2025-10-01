import { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getPrimaryRole, normalizeRoles } from '@/components/roleUtils';
import NoRoutePage from '@/pages/NoRoutePage';

interface ProtectedRouteProps {
  element: ReactElement;
  allowedRoles: string[]; // lowercase
}

export default function ProtectedRoute({ element, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, hydrated } = useAuth();
  const location = useLocation();

  // Wait for hydration to avoid premature redirect during initial load
  if (!hydrated) {
    console.debug('[ProtectedRoute] awaiting hydration', { path: location.pathname });
    return null; // Could add spinner later
  }

  if (!isAuthenticated || !user) {
    // Not authenticated: send to appropriate login - default customer login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const roles = normalizeRoles(user.roles);
  console.debug('[ProtectedRoute] context roles check', { roles, path: location.pathname });
  const primary = getPrimaryRole(roles);

  const isAllowed = roles.some(r => allowedRoles.includes(r));
  if (!isAllowed) {
    const restrictedForCustomer = ['/staff', '/staff/shifts', '/portal', '/manager'];
    if (primary === 'customer' && restrictedForCustomer.includes(location.pathname)) {
      // Show static no-route page instead of redirect
      return <NoRoutePage />;
    }
    // Non-customer role mismatch keeps existing redirect semantics
    if (primary === 'staff') return <Navigate to="/staff" replace />;
    if (primary === 'manager' || primary === 'admin') return <Navigate to="/manager" replace />;
    return <Navigate to="/" replace />;
  }

  return element;
}
