import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AUTH_STORAGE_KEY = 'studypulse_auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, password, name) => {
    // Mock login - in a real app this would hit Firebase/Backend
    const mockUser = {
      id: Date.now().toString(),
      email,
      name: name || email.split('@')[0],
      avatar: '🌱'
    };
    setUser(mockUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    return Promise.resolve(mockUser);
  };

  const register = (email, password, name) => {
    // Mock register
    return login(email, password, name);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const newUser = { ...prev, ...updates };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
