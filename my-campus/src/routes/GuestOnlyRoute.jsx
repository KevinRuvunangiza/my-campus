// src/routes/GuestOnlyRoute.jsx
//
// Monolith. — "My Campus"
// Inverse of ProtectedRoute — used for `/` (landing) and `/auth` so that
// an already-authenticated person is redirected straight to their
// dashboard instead of seeing the marketing page or login form again.

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function GuestOnlyRoute() {
  const { session, userProfile, loading } = useAuth();

  // Wait for the initial session check before deciding — otherwise a
  // logged-in user briefly sees the landing page flash on every refresh.
  if (loading) return null;

  if (session && userProfile) {
    const dashboardPath = userProfile.role === "lecturer" ? "/lecturer" : "/student";
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
}