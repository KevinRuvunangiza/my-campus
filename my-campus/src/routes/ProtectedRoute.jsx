// src/routes/ProtectedRoute.jsx
//
// Monolith. — "My Campus"
// Guards a route behind an authenticated Supabase session, with an
// optional role requirement (e.g. `requireRole="lecturer"`).
//
// Usage:
//   <Route element={<ProtectedRoute />}>
//     <Route path="/student/*" element={<StudentLayout />} />
//   </Route>
//
//   <Route element={<ProtectedRoute requireRole="lecturer" />}>
//     <Route path="/lecturer/*" element={<LecturerPortal />} />
//   </Route>

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function FullScreenSpinner({ label }) {
  return (
    <div className="min-h-screen bg-[#06141D] flex items-center justify-center text-white font-mono selection:bg-[#00ED64]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#00ED64] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,237,100,0.4)]" />
        <p className="text-xs text-slate-400 tracking-wider uppercase">{label}</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ requireRole }) {
  const { session, userProfile, loading } = useAuth();
  const location = useLocation();

  // 1. Still checking for an existing session (page load / refresh).
  if (loading) {
    return <FullScreenSpinner label="Chargement de My Campus..." />;
  }

  // 2. No session at all -> bounce to /auth, remembering where they meant
  //    to go so we can send them back after login.
  if (!session) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // 3. Session exists but the profiles row hasn't resolved yet — this is
  //    normal for a brief moment right after login/signup.
  if (!userProfile) {
    return <FullScreenSpinner label="Préparation de votre profil..." />;
  }

  // 4. Role check, if this route requires one. Send mis-matched roles to
  //    their OWN dashboard rather than back to /auth (they're logged in,
  //    just in the wrong place).
  if (requireRole && userProfile.role !== requireRole) {
    const fallbackPath = userProfile.role === "lecturer" ? "/lecturer" : "/student";
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}