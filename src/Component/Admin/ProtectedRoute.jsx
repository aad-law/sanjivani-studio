import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const isAuthenticated = localStorage.getItem("isAdminAuthenticated") === "true";

    // Check if session is still valid (24 hours)
    const loginTime = localStorage.getItem("adminLoginTime");
    const isSessionValid = loginTime && (Date.now() - parseInt(loginTime)) < 24 * 60 * 60 * 1000;

    if (!isAuthenticated || !isSessionValid) {
        // Clear invalid session
        localStorage.removeItem("isAdminAuthenticated");
        localStorage.removeItem("adminLoginTime");
        return <Navigate to="/admin" replace />;
    }

    return children;
}
