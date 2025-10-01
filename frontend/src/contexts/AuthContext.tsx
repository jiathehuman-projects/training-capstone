import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tokenManager, type User } from '@/services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  hydrated: boolean; // indicates initial localStorage load complete
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Hydrate auth state from localStorage synchronously inside effect cycle
    const token = tokenManager.getToken();
    const savedUser = localStorage.getItem('user_data');
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        tokenManager.removeToken();
        localStorage.removeItem('user_data');
      }
    }
    setHydrated(true);
  }, []);

  const login = (token: string, userData: User) => {
    tokenManager.setToken(token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    tokenManager.removeToken();
    localStorage.removeItem('user_data');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, hydrated, user, login, logout }}>
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