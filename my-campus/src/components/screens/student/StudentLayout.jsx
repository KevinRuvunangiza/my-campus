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

// 💥 PROTECTION DES SOUS-ROUTES
function ReaderRoute() {
  const { state } = useLocation();
  const { userProfile } = useAuth();
  const course = state?.course;

  if (!course) return <Navigate to="/student" replace />;

  return (
    <SyllabusReader
      course={course}
      studentName={userProfile?.full_name || "Étudiant USCITECH"}
      studentPhone={userProfile?.phone_number || "084 000 0000"}
      onBack={() => window.history.back()}
    />
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
function useActiveTab() {
  const location = useLocation();
  const navigate = useNavigate();
  const segment = location.pathname.split("/")[2];
  const activeTab = ["explore", "progress", "profile"].includes(segment)
    ? segment
    : "home";

  const setActiveTab = (tab) => {
    navigate(tab === "home" ? "/student" : `/student/${tab}`);
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

  const handlePaymentSuccess = (courseId) => {
    setSelectedCourseForPaywall(null);
    navigate("/student/progress", { replace: true });
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
            <Routes>
              <Route
                index
                element={
                  <StudentDashboard
                    user={userProfile}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onOpenReader={handleCourseSelect}
                    onOpenArena={openArena}
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
          </m.div>
        </AnimatePresence>

        <AnimatePresence>
          {selectedCourseForPaywall && (
            <PaymentModal
              course={selectedCourseForPaywall}
              user={userProfile}
              onClose={() => setSelectedCourseForPaywall(null)}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}
