// Centralized role utilities
// Priority order used for landing route decisions
export const ROLE_PRIORITY = ['admin', 'manager', 'staff', 'customer'] as const;
export type AppRole = typeof ROLE_PRIORITY[number];

export function normalizeRoles(raw?: string[] | null): AppRole[] {
  if (!raw) return [];
  return raw.map(r => r.toLowerCase()).filter((r): r is AppRole =>
    (ROLE_PRIORITY as readonly string[]).includes(r)
  );
}

export function getPrimaryRole(raw?: string[] | null): AppRole | null {
  const roles = normalizeRoles(raw);
  if (!roles.length) return null;
  for (const p of ROLE_PRIORITY) {
    if (roles.includes(p)) return p as AppRole;
  }
  return roles[0] as AppRole; // fallback
}

export function isCustomerOnly(raw?: string[] | null): boolean {
  const roles = normalizeRoles(raw);
  return roles.length === 1 && roles[0] === 'customer';
}

export function isStaffLike(raw?: string[] | null): boolean {
  const roles = normalizeRoles(raw);
  return roles.includes('staff') || roles.includes('manager') || roles.includes('admin');
}

export function isManagerLike(raw?: string[] | null): boolean {
  const roles = normalizeRoles(raw);
  return roles.includes('manager') || roles.includes('admin');
}
