// src/components/RoleRedirect.jsx
import React from "react";
import { Navigate } from "react-router-dom";
// import Cookies from "js-cookie"; // Unused
import { useAuth } from "../contexts/AuthContext";

const RoleRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Or a spinner
  if (!user) return <Navigate to="/" replace />; // Login page

  if (user.role === "PRESIDENT") return <Navigate to="/president/dashboard" replace />;
  if (user.role === "RESIDENT") return <Navigate to="/resident/dashboard" replace />;

  return <Navigate to="/resident/dashboard" replace />; // Default fallback
};

export default RoleRedirect;
