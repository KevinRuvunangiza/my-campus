// src/components/screens/student/StudentLayout.jsx
import React, { useState } from "react";
import { LazyMotion, domAnimation, AnimatePresence, m } from "framer-motion";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

import StudentDashboard from "./Dashboard";
import Explore from "./Explore";
import Progress from "./Progress";
import Profile from "./Profile";
import PaymentModal from "./PaymentModal";
import SyllabusReader from "./SyllabusReader";
import McqArena from "./McqArena";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A222F] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-8 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-rose-400">Une erreur est survenue</h2>
            <p className="text-xs text-slate-300">
              {this.state.error?.message || "Erreur indéterminée"}
            </p>
            <pre className="text-[10px] text-slate-400 bg-[#071721] p-3 rounded-lg overflow-auto max-h-40 text-left font-mono">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2.5 bg-[#00ED64] text-[#001E2B] font-bold rounded-xl cursor-pointer"
            >
              Recharger l'application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// 💥 PROTECTION DES SOUS-ROUTES
function ReaderRoute() {
  const { state } = useLocation();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const course = state?.course;

  if (!course) return <Navigate to="/student" replace />;

  return (
    <ErrorBoundary>
      <SyllabusReader
        course={course}
        studentName={userProfile?.full_name || "Étudiant USCITECH"}
        studentPhone={userProfile?.phone_number || "084 000 0000"}
        onBack={() => navigate("/student")}
      />
    </ErrorBoundary>
  );
}

function ArenaRoute() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const course = state?.course;

  if (!course) return <Navigate to="/student" replace />;

  return (
    <McqArena
      course={course}
      onExit={() => navigate(-1)}
      onComplete={() => navigate("/student/progress", { replace: true })}
    />
  );
}

// 💥 GESTIONNAIRE D'ONGLETS INTELLIGENT
// Maps URL segment → canonical BottomNav tab ID
// Segments:  ""         → "library"  (home / dashboard)
//            "explore"  → "explorer" (market catalogue)
//            "profile"  → "profile"
function useActiveTab() {
  const location = useLocation();
  const navigate = useNavigate();
  const segment = location.pathname.split("/")[2];

  const segmentToTab = {
    explore: "explorer",
    progress: "stats",
    profile: "profile",
  };
  const activeTab = segmentToTab[segment] ?? "library";

  const setActiveTab = (tab) => {
    const tabToSegment = {
      library: "/student",
      explorer: "/student/explore",
      stats: "/student/progress",
      profile: "/student/profile",
    };
    navigate(tabToSegment[tab] ?? "/student");
  };

  return [activeTab, setActiveTab];
}

// ============================================================================
// MASTER LAYOUT ÉTUDIANT
// ============================================================================
export default function StudentLayout() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedCourseForPaywall, setSelectedCourseForPaywall] =
    useState(null);
  const [activeTab, setActiveTab] = useActiveTab();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const handleCourseSelect = (course) => {
    if (course.isUnlocked) {
      navigate(`/student/course/${course.id}/reader`, { state: { course } });
    } else {
      setSelectedCourseForPaywall(course);
    }
  };

  const handlePaymentSuccess = () => {
    // Close the payment modal and send the student to their dashboard
    // where the newly purchased course will appear.
    setSelectedCourseForPaywall(null);
    navigate("/student/progress", { replace: true });
    // Force a full page reload so getStudentDashboard() re-fetches
    // and the purchased course shows as unlocked without a manual refresh.
    setTimeout(() => window.location.reload(), 100);
  };

  const openArena = (course) => {
    navigate(`/student/course/${course.id}/arena`, { state: { course } });
  };

  return (
    // 💥 CORRECTION ÉCRAN BLANC: Injection de domAnimation obligatoire pour <m.div> !
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen bg-[#0A222F] text-white selection:bg-[#00ED64] selection:text-[#001E2B] font-sans">
        <AnimatePresence mode="wait">
          <m.div
            key={useLocation().pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col min-h-screen"
          >
            <ErrorBoundary>
              <Routes>
                <Route
                  index
                  element={
                    <StudentDashboard
                      user={userProfile}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      onOpenSyllabus={handleCourseSelect}
                      onOpenQuiz={openArena}
                    />
                  }
                />
                <Route
                  path="explore"
                  element={
                    <Explore
                      user={userProfile}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      onSelectCourse={handleCourseSelect}
                    />
                  }
                />
                <Route
                  path="progress"
                  element={
                    <Progress
                      user={userProfile}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      onOpenArena={openArena}
                    />
                  }
                />
                <Route
                  path="profile"
                  element={
                    <Profile
                      user={userProfile}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      onLogout={handleLogout}
                    />
                  }
                />
                <Route path="course/:courseId/reader" element={<ReaderRoute />} />
                <Route path="course/:courseId/arena" element={<ArenaRoute />} />
                <Route path="*" element={<Navigate to="/student" replace />} />
              </Routes>
            </ErrorBoundary>
          </m.div>
        </AnimatePresence>

        <AnimatePresence>
          {selectedCourseForPaywall && (
            <PaymentModal
              courseId={selectedCourseForPaywall.id}
              priceUsd={selectedCourseForPaywall.price_usd}
              onClose={() => setSelectedCourseForPaywall(null)}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}
