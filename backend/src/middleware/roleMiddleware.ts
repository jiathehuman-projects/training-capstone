import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';

interface JwtPayloadWithRoles extends JwtPayload {
  id: number;
  roles: string[];
}

export const requireManagerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  const currentUser = req.currentUser;
  
  if (!currentUser || typeof currentUser === 'string') {
    return res.status(403).json({ message: 'Access denied: Invalid token' });
  }

  const payload = currentUser as JwtPayloadWithRoles;
  
  if (!payload.roles || !Array.isArray(payload.roles)) {
    return res.status(403).json({ message: 'Access denied: No roles found' });
  }

  const hasManagerOrAdminRole = payload.roles.some(role => 
    ['manager', 'admin'].includes(role.toLowerCase())
  );

  if (!hasManagerOrAdminRole) {
    return res.status(403).json({ message: 'Access denied: Manager or Admin role required' });
  }

  next();
};