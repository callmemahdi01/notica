// authContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth', { credentials: 'include' });
      const data = await response.json();
      if (response.ok && data.isAuthenticated) {
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async () => {
    await checkAuthStatus();
  };

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}