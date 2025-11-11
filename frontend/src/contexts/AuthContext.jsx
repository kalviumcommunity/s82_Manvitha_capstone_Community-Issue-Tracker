import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// --- IMPORTANT ---
// This tells axios to send the HttpOnly cookie with every request.
// This MUST be set for our authentication to work.
axios.defaults.withCredentials = true;
// ---

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (via cookie) when app loads
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // The cookie is sent automatically by the browser
        const res = await axios.get('http://localhost:3551/api/auth/me');
        setUser(res.data);
      } catch (error) {
        console.log('No user logged in', error.response?.data?.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ✅ Login
  const login = async (mail, password) => {
    setLoading(true);
    try {
      // The backend will send user data AND set the HttpOnly cookie
      const res = await axios.post('http://localhost:3551/api/auth/login', { mail, password });
      
      // The response data *is* the user object. There is no token.
      setUser(res.data);
      return res.data; // Return user for navigation

    } catch (error) {
      setUser(null);
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Signup
  const signup = async (formData) => {
    setLoading(true);
    try {
      // The backend will send user data AND set the HttpOnly cookie
      const res = await axios.post('http://localhost:3551/api/auth/signup', formData);

      // The response data *is* the user object.
      setUser(res.data);
      return res.data; // Return user for navigation

    } catch (error) {
      setUser(null);
      throw new Error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      // We MUST call the backend to clear the HttpOnly cookie
      await axios.post('http://localhost:3551/api/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still log them out on the frontend
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook for easy usage
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;