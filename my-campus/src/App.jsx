import { useState } from "react";
import { LazyMotion, domAnimation, AnimatePresence, m } from "framer-motion";
import { FiUsers, FiMonitor, FiLogOut } from "react-icons/fi";

// =============================================================================
// 1. IMPORT PUBLIC & AUTH SCREENS
// =============================================================================
import LandingPage from "./components/screens/public/LandingPage";
import AuthScreen from "./components/screens/auth/AuthScreen";

// =============================================================================
// 2. IMPORT STUDENT PWA SCREENS
// =============================================================================
import StudentDashboard from "./components/screens/student/Dashboard";
import Explore from "./components/screens/student/Explore";
import Progress from "./components/screens/student/Progress";
import Profile from "./components/screens/student/Profile";
import PaymentModal from "./components/screens/student/PaymentModal";
import SyllabusReader from "./components/screens/student/SyllabusReader";
import McqArena from "./components/screens/student/McqArena";

// =============================================================================
// 3. IMPORT LECTURER PORTAL (DESKTOP)
// =============================================================================
import LecturerPortal from "./components/screens/lecturer/Portal";

export default function App() {
  // ---------------------------------------------------------------------------
  // MASTER APPLICATION & SESSION STATE
  // ---------------------------------------------------------------------------
  const [showLanding, setShowLanding] = useState(true); // Defaults to Monolith Landing Page
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [viewMode, setViewMode] = useState("student"); // 'student' | 'lecturer'

  // Captures if the user clicked "Connexion" vs "S'inscrire" and their intended role
  const [authIntent, setAuthIntent] = useState({
    mode: "login",
    role: "student",
  });

  // ---------------------------------------------------------------------------
  // STUDENT PWA ROUTING STATES
  // ---------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState("home"); // 'home' | 'explore' | 'progress' | 'profile'
  const [selectedCourseForPaywall, setSelectedCourseForPaywall] =
    useState(null);
  const [activeReaderCourse, setActiveReaderCourse] = useState(null);
  const [activeArenaCourse, setActiveArenaCourse] = useState(null);

  // ---------------------------------------------------------------------------
  // NAVIGATION & AUTH HANDLERS
  // ---------------------------------------------------------------------------
  const handleNavigateToAuth = (mode, role) => {
    setAuthIntent({ mode, role });
    setShowLanding(false); // Transitions from public site to login/signup
  };

  const handleAuthSuccess = ({ role, user }) => {
    setUserProfile(user);
    setViewMode(role); // Automatically routes to the dashboard matching their role
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    setShowLanding(true); // Sends the user back to the public Monolith landing page
    setActiveTab("home");
  };

  // Course selection logic (Routes to Canvas Reader if unlocked, Paywall if locked)
  const handleCourseSelect = (course) => {
    if (course.isUnlocked) {
      setActiveReaderCourse(course);
    } else {
      setSelectedCourseForPaywall(course);
    }
  };

  // FlexPay / CinetPay USSD Success Callback
  const handlePaymentSuccess = (courseId) => {
    console.log(`Syllabus ${courseId} débloqué via USSD Mobile Money !`);
    setSelectedCourseForPaywall(null);
    setActiveTab("progress"); // Routes to progress tab so they can see their new stats
  };

  // ===========================================================================
  // GATEKEEPER 1: PUBLIC LANDING PAGE (MONOLITH / USCITECH)
  // ===========================================================================
  if (showLanding && !isAuthenticated) {
    return (
      <LazyMotion features={domAnimation} strict>
        <LandingPage onNavigateToAuth={handleNavigateToAuth} />
      </LazyMotion>
    );
  }

  // ===========================================================================
  // GATEKEEPER 2: AUTHENTICATION SCREEN (LOGIN / SIGNUP)
  // ===========================================================================
  if (!isAuthenticated) {
    return (
      <LazyMotion features={domAnimation} strict>
        <AuthScreen
          onAuthSuccess={handleAuthSuccess}
          initialMode={authIntent.mode}
          initialRole={authIntent.role}
        />
      </LazyMotion>
    );
  }

  // ===========================================================================
  // AUTHENTICATED: LECTURER DESKTOP PORTAL VIEW
  // ===========================================================================
  if (viewMode === "lecturer") {
    return (
      <>
        <LecturerPortal onSwitchToStudent={() => setViewMode("student")} />

        {/* TEMPORARY FLOATING SWITCHER BUTTON (TESTING UTILITY) */}
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          <button
            onClick={() => setViewMode("student")}
            className="bg-[#00ED64] hover:bg-[#00c753] text-[#001E2B] font-extrabold px-5 py-3 rounded-full shadow-[0_8px_30px_rgba(0,237,100,0.4)] flex items-center gap-2 text-xs cursor-pointer border-2 border-[#001E2B] transition-transform hover:scale-105"
          >
            <FiUsers className="w-4 h-4" />
            <span>Basculer sur Vue PWA Étudiant</span>
          </button>
          <button
            onClick={handleLogout}
            title="Se déconnecter"
            className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg cursor-pointer transition-transform hover:scale-105"
          >
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </>
    );
  }

  // ===========================================================================
  // AUTHENTICATED: STUDENT FULL-SCREEN OVERRIDES (CANVAS & ARENA)
  // ===========================================================================

  // 1. Anti-Piracy Canvas Reader Override
  if (activeReaderCourse) {
    return (
      <LazyMotion features={domAnimation} strict>
        <SyllabusReader
          course={activeReaderCourse}
          // DYNAMIC DRM ANCHOR: Burns logged-in user's identity into the 15% opacity watermark
          studentName={userProfile?.fullName || "KEVIN RUVUNANGIZA"}
          studentPhone={userProfile?.phone || "084 123 4567"}
          onBack={() => setActiveReaderCourse(null)}
        />
      </LazyMotion>
    );
  }

  // 2. Timed MCQ Practice Arena Override
  if (activeArenaCourse) {
    return (
      <LazyMotion features={domAnimation} strict>
        <McqArena
          course={activeArenaCourse}
          onExit={() => setActiveArenaCourse(null)}
          onComplete={() => {
            setActiveArenaCourse(null);
            setActiveTab("progress");
          }}
        />
      </LazyMotion>
    );
  }

  // ===========================================================================
  // AUTHENTICATED: STUDENT PWA STANDARD VIEW (MOBILE-FIRST)
  // ===========================================================================
  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen bg-[#0A222F] text-white selection:bg-[#00ED64] selection:text-[#001E2B] font-sans">
        {/* VIEW ROUTER WITH SMOOTH FADE TRANSITIONS */}
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <m.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <StudentDashboard
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenReader={(course) => setActiveReaderCourse(course)}
                onOpenArena={(course) => setActiveArenaCourse(course)}
              />
            </m.div>
          )}

          {activeTab === "explore" && (
            <m.div
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Explore
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onSelectCourse={handleCourseSelect}
              />
            </m.div>
          )}

          {activeTab === "progress" && (
            <m.div
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Progress
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenArena={(course) => setActiveArenaCourse(course)}
              />
            </m.div>
          )}

          {activeTab === "profile" && (
            <m.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Profile
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}
              />
            </m.div>
          )}
        </AnimatePresence>

        {/* USSD MOBILE MONEY PAYWALL MODAL */}
        <AnimatePresence>
          {selectedCourseForPaywall && (
            <PaymentModal
              course={selectedCourseForPaywall}
              onClose={() => setSelectedCourseForPaywall(null)}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </AnimatePresence>

        {/* TEMPORARY FLOATING SWITCHER BUTTON (TESTING UTILITY) */}
        <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6 flex items-center gap-2">
          <button
            onClick={() => setViewMode("lecturer")}
            className="bg-[#00ED64] hover:bg-[#00c753] text-[#001E2B] font-extrabold px-4 py-2.5 rounded-full shadow-[0_8px_30px_rgba(0,237,100,0.4)] flex items-center gap-2 text-xs cursor-pointer border-2 border-[#001E2B] transition-transform hover:scale-105"
          >
            <FiMonitor className="w-4 h-4" />
            <span>Basculer sur Espace Prof (Bureau)</span>
          </button>
          <button
            onClick={handleLogout}
            title="Se déconnecter"
            className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg cursor-pointer transition-transform hover:scale-105"
          >
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </LazyMotion>
  );
}
