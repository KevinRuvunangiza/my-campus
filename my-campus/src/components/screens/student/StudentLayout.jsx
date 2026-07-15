// src/components/screens/student/StudentLayout.jsx
//
// Monolith. — "My Campus"
// Wraps the student PWA. Tabs (home/explore/progress/profile) and the
// full-screen reader/arena overlays are now real routes instead of
// component-swap state, so the browser back button and page refresh
// behave the way a student expects on a mobile PWA.

import { AnimatePresence, m } from "framer-motion";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import StudentDashboard from "./Dashboard";
import Explore from "./Explore";
import Progress from "./Progress";
import Profile from "./Profile";
import PaymentModal from "./PaymentModal";
import SyllabusReader from "./SyllabusReader";
import McqArena from "./McqArena";

// --- Reader route ------------------------------------------------------
// Expects the course object via router `state` (passed by navigate()).
// If it's missing — e.g. someone hit this URL directly or refreshed —
// we bounce back to /student rather than rendering a broken reader.
// TODO: once courseService exposes a `getCourseById`, fetch by
// `useParams().courseId` here as a fallback instead of bouncing.
function ReaderRoute() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const course = state?.course;

  if (!course) {
    navigate("/student", { replace: true });
    return null;
  }

  return (
    <SyllabusReader
      course={course}
      studentName={userProfile?.full_name || "Écolier USCITECH"}
      studentPhone={userProfile?.phone_number || "084 000 0000"}
      onBack={() => navigate(-1)}
    />
  );
}

function ArenaRoute() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const course = state?.course;

  if (!course) {
    navigate("/student", { replace: true });
    return null;
  }

  return (
    <McqArena
      course={course}
      onExit={() => navigate(-1)}
      onComplete={() => navigate("/student/progress", { replace: true })}
    />
  );
}

// Maps the current URL to the tab keys your existing screens already
// expect ("home" | "explore" | "progress" | "profile"), so their internal
// bottom nav bar keeps working unchanged.
function useActiveTab() {
  const location = useLocation();
  const navigate = useNavigate();

  const segment = location.pathname.split("/")[2]; // "/student/<segment>"
  const activeTab =
    segment === "explore" || segment === "progress" || segment === "profile"
      ? segment
      : "home";

  const setActiveTab = (tab) => {
    navigate(tab === "home" ? "/student" : `/student/${tab}`);
  };

  return [activeTab, setActiveTab];
}

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
    console.log(
      `⚡ [Monolith USSD] Syllabus ${courseId} débloqué via FlexPay !`,
    );
    setSelectedCourseForPaywall(null);
    navigate("/student/progress");
  };

  const openArena = (course) =>
    navigate(`/student/course/${course.id}/arena`, { state: { course } });

  return (
    <div className="min-h-screen bg-[#0A222F] text-white selection:bg-[#00ED64] selection:text-[#001E2B] font-sans">
      <AnimatePresence mode="wait">
        <m.div
          key={useLocation().pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
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
  );
}
