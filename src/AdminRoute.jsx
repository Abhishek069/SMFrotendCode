import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/login" />;
  }

  // Decode JWT payload
  let user = null;
  try {
    user = JSON.parse(atob(token.split(".")[1]));
  } catch (err) {
    console.error("Invalid token", err);
    return <Navigate to="/login" />;
  }

  // If role is not admin → redirect
  if (user.role !== "admin") {
    return <Navigate to="/allUser" />;
  }

  return children;
}
