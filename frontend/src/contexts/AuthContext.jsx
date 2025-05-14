import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../data/mockData';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      const presidentUser = mockUsers.find(u => u.role === 'president');
      if (presidentUser) {
        setUser(presidentUser);
        localStorage.setItem('currentUser', JSON.stringify(presidentUser));
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const foundUser = mockUsers.find(u => u.email === email);
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }

      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const switchRole = (role) => {
    const newUser = mockUsers.find(u => u.role === role);
    if (newUser) {
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
