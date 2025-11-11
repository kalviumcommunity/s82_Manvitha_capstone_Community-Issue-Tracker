// src/components/RoleRedirect.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const RoleRedirect = () => {
  // Get role from cookies instead of localStorage
  const role = Cookies.get("role");

  if (role === "president") return <Navigate to="/president" replace />;
  if (role === "vice-president") return <Navigate to="/vice-president" replace />;
  if (role === "resident") return <Navigate to="/resident" replace />;

  return <Navigate to="/login" replace />;
};

export default RoleRedirect;