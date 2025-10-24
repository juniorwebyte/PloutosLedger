import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import licenseService, { LicenseRecord } from '../services/licenseService';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  user: string | null;
  license?: LicenseRecord | null;
  setLicense?: (lic: LicenseRecord | null) => void;
  role: 'user' | 'admin' | 'superadmin';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [license, setLicense] = useState<LicenseRecord | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | 'superadmin'>(() => (localStorage.getItem('caixa_role') as any) || 'user');

  useEffect(() => {
    // Verificar se há uma sessão ativa no localStorage
    const savedUser = localStorage.getItem('caixa_user');
    const lastLogin = localStorage.getItem('caixa_last_login');
    
    if (savedUser && lastLogin) {
      const lastLoginTime = new Date(lastLogin).getTime();
      const currentTime = new Date().getTime();
      const hoursSinceLogin = (currentTime - lastLoginTime) / (1000 * 60 * 60);
      
      // Logout automático após 8 horas
      if (hoursSinceLogin < 8) {
        setIsAuthenticated(true);
        setUser(savedUser);
        const savedRole = (localStorage.getItem('caixa_role') as any) || 'user';
        setRole(savedRole);
        // Carregar status de licença (via backend futuramente)
        licenseService.ensureAccess(savedUser).then(setLicense).catch(() => setLicense(null));
      } else {
        localStorage.removeItem('caixa_user');
        localStorage.removeItem('caixa_last_login');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Credenciais válidas para teste offline
      const validCredentials = {
        'Webyte': { password: 'Webyte', role: 'user' },
        'admin': { password: 'admin123', role: 'superadmin' },
        'demo': { password: 'demo123', role: 'user' },
        'caderno': { password: 'caderno2025', role: 'user' }
      };

      const userCreds = validCredentials[username as keyof typeof validCredentials];
      
      if (userCreds && userCreds.password === password) {
        // Simular token JWT
        const token = btoa(JSON.stringify({ username, role: userCreds.role, timestamp: Date.now() }));
        
        localStorage.setItem('auth_token', token);
        localStorage.setItem('caixa_user', username);
        localStorage.setItem('caixa_last_login', new Date().toISOString());
        localStorage.setItem('caixa_role', userCreds.role);
        
        setIsAuthenticated(true);
        setUser(username);
        setRole(userCreds.role);
        
        // Simular licença
        setLicense({
          status: 'active',
          trialStart: new Date(),
          trialDays: 30,
          activationKey: 'DEMO-KEY',
          activatedAt: new Date(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
        
        console.log(`Login offline successful for user: ${username}`);
        return true;
      } else {
        console.log(`Invalid credentials for user: ${username}`);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setRole('user');
    localStorage.removeItem('caixa_user');
    localStorage.removeItem('caixa_last_login');
    localStorage.removeItem('caixa_role');
    localStorage.removeItem('auth_token');
  };

  const value: AuthContextType = {
    isAuthenticated,
    login,
    logout,
    user,
    license,
    setLicense,
    role,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
