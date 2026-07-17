// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// =============================================================================
// 1. IMPORT ROUTE GUARDS (GATEKEEPERS)
// =============================================================================
import GuestOnlyRoute from "./routes/GuestOnlyRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

// =============================================================================
// 2. IMPORT PUBLIC SCREENS
// =============================================================================
import LandingPage from "./components/screens/public/LandingPage";
import AuthScreen from "./components/screens/auth/AuthScreen";
import PrivacyPolicy from "./components/screens/public/PrivacyPolicy";
import PaymentPolicy from "./components/screens/public/PaymentPolicy";

// =============================================================================
// 3. IMPORT AUTHENTICATED LAYOUTS / ROUTERS
// =============================================================================
import StudentLayout from "./components/screens/student/StudentLayout";
import LecturerRoute from "./components/screens/lecturer/LecturerRoute";

export default function App() {
  return (
    <Routes>
      {/* =======================================================================
          PUBLIC STANDALONE ROUTES
          Must be accessible by ANYONE (logged in or out) for app store review
          and legal compliance.
          ======================================================================= */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/payment-policy" element={<PaymentPolicy />} />

      {/* =======================================================================
          GATEKEEPER 1: GUEST-ONLY ROUTES (Public Visitors & Auth)
          If a user is ALREADY logged in, GuestOnlyRoute automatically redirects
          them straight to /student or /lecturer based on their profiles.role!
          ======================================================================= */}
      <Route element={<GuestOnlyRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthScreen />} />
      </Route>

      {/* =======================================================================
          GATEKEEPER 2: STUDENT PWA ROUTES (Any Authenticated Role)
          Handles /student, /student/explore, /student/progress, /student/profile,
          plus the Canvas DRM reader and timed MCQ Arena overrides under /student/*
          ======================================================================= */}
      <Route element={<ProtectedRoute />}>
        <Route path="/student/*" element={<StudentLayout />} />
      </Route>

      {/* =======================================================================
          GATEKEEPER 3: LECTURER DESKTOP PORTAL (Strict Role Check)
          Requires userProfile.role === "lecturer". If an authenticated student
          tries to type /lecturer in their browser, ProtectedRoute blocks them
          and bounces them safely back to /student!

          Unverified lecturers are no longer intercepted by a separate pending
          screen — they route directly to LecturerRoute, which renders the
          dashboard in "Mode Brouillon / Standby" with a prominent banner.
          ======================================================================= */}
      <Route element={<ProtectedRoute requireRole="lecturer" />}>
        <Route path="/lecturer/*" element={<LecturerRoute />} />
      </Route>

      {/* =======================================================================
          FALLBACK: CATCH-ALL WILDCARD
          Any typos or unknown URLs (e.g., /random-page) get cleanly redirected
          back to the root Monolith storefront.
          ======================================================================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
