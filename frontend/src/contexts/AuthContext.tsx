import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tokenManager, type User } from '@/services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in on app start
    const token = tokenManager.getToken();
    if (token) {
      setIsAuthenticated(true);
      // TODO: Optionally verify token with backend and get user data
      // For now, we'll just set authenticated state
    }
  }, []);

  const login = (token: string, userData: User) => {
    tokenManager.setToken(token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    tokenManager.removeToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}