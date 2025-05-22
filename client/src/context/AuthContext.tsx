import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextProps {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Check if user is already authenticated on load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    console.log('Auth token from localStorage:', token);
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      
      // Get env variables (these will be injected at build time or from .env)
      const expectedUsername = process.env.REACT_APP_LOGIN_USERNAME;
      const expectedPassword = process.env.REACT_APP_LOGIN_PASSWORD;
      
      console.log('Login attempt:', { 
        providedUsername: username,
        expectedUsernameMatch: username === expectedUsername,
        envUsernameDefined: !!process.env.REACT_APP_LOGIN_USERNAME
      });
      
      if (!process.env.REACT_APP_LOGIN_USERNAME || !process.env.REACT_APP_LOGIN_PASSWORD) {
        console.warn('Authentication credentials not configured in environment variables, using defaults');
      }

      // Simple authentication against env variables
      if (username === expectedUsername && password === expectedPassword) {
        // Store auth in local storage (simple token)
        localStorage.setItem('auth_token', 'authenticated');
        setIsAuthenticated(true);
        return true;
      } else {
        setError('Invalid username or password');
        return false;
      }
    } catch (err) {
      setError('Authentication failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
