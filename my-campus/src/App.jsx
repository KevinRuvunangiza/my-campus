import { useState } from "react";
import { LazyMotion, domAnimation, AnimatePresence, m } from "framer-motion";
import { FiUsers, FiMonitor } from "react-icons/fi";

// IMPORT DES VUES ÉTUDIANT
import StudentDashboard from "./components/screens/student/Dashboard";
import Explore from "./components/screens/student/Explore";
import Progress from "./components/screens/student/Progress";
import Profile from "./components/screens/student/Profile";
import PaymentModal from "./components/screens/student/PaymentModal";
import SyllabusReader from "./components/screens/student/SyllabusReader";
import McqArena from "./components/screens/student/McqArena";

// IMPORT DE LA VUE PROFESSEUR
import LecturerPortal from "./components/screens/lecturer/Portal";

export default function App() {
  // ---------------------------------------------------------------------------
  // COMMUTATEUR MAÎTRE TEMPORAIRE : 'student' vs 'lecturer'
  // ---------------------------------------------------------------------------
  const [viewMode, setViewMode] = useState("student");

  // États du routeur Étudiant
  const [activeTab, setActiveTab] = useState("home");
  const [selectedCourseForPaywall, setSelectedCourseForPaywall] = useState(null);
  const [activeReaderCourse, setActiveReaderCourse] = useState(null);
  const [activeArenaCourse, setActiveArenaCourse] = useState(null);

  const handleCourseSelect = (course) => {
    if (course.isUnlocked) setActiveReaderCourse(course);
    else setSelectedCourseForPaywall(course);
  };

  const handlePaymentSuccess = (courseId) => {
    console.log(`Syllabus ${courseId} débloqué via USSD FlexPay !`);
    setSelectedCourseForPaywall(null);
    setActiveTab("progress");
  };

  // ===========================================================================
  // 1. VUE PORTAIL PROFESSEUR (BUREAU)
  // ===========================================================================
  if (viewMode === "lecturer") {
    return (
      <>
        <LecturerPortal onSwitchToStudent={() => setViewMode("student")} />
        
        {/* PILULE FLOTTANTE DE COMMUTATION TEMPORAIRE */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setViewMode("student")}
            className="bg-[#00ED64] hover:bg-[#00c753] text-[#001E2B] font-extrabold px-5 py-3 rounded-full shadow-[0_8px_30px_rgba(0,237,100,0.4)] flex items-center gap-2 text-xs cursor-pointer border-2 border-[#001E2B] transition-transform hover:scale-105"
          >
            <FiUsers className="w-4 h-4" />
            <span>Basculer sur Vue PWA Étudiant</span>
          </button>
        </div>
      </>
    );
  }

  // ===========================================================================
  // 2. SURCHARGES ÉTUDIANT (Plein écran : Lecteur Canvas ou Arène QCM)
  // ===========================================================================
  if (activeReaderCourse) {
    return (
      <LazyMotion features={domAnimation} strict>
        <SyllabusReader
          course={activeReaderCourse}
          studentName="Kevin Ruvunangiza"
          studentPhone="084 123 4567"
          onBack={() => setActiveReaderCourse(null)}
        />
      </LazyMotion>
    );
  }

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
  // 3. VUE PWA ÉTUDIANT STANDARD (MOBILE-FIRST)
  // ===========================================================================
  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen bg-[#0A222F] text-white selection:bg-[#00ED64] selection:text-[#001E2B] font-sans">
        
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <m.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <StudentDashboard
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenReader={(course) => setActiveReaderCourse(course)}
                onOpenArena={(course) => setActiveArenaCourse(course)}
              />
            </m.div>
          )}

          {activeTab === "explore" && (
            <m.div key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <Explore
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onSelectCourse={handleCourseSelect}
              />
            </m.div>
          )}

          {activeTab === "progress" && (
            <m.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <Progress
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenArena={(course) => setActiveArenaCourse(course)}
              />
            </m.div>
          )}

          {activeTab === "profile" && (
            <m.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <Profile activeTab={activeTab} setActiveTab={setActiveTab} />
            </m.div>
          )}
        </AnimatePresence>

        {/* MODALE DE PAIEMENT USSD */}
        <AnimatePresence>
          {selectedCourseForPaywall && (
            <PaymentModal
              course={selectedCourseForPaywall}
              onClose={() => setSelectedCourseForPaywall(null)}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </AnimatePresence>

        {/* PILULE FLOTTANTE DE COMMUTATION TEMPORAIRE */}
        <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6">
          <button
            onClick={() => setViewMode("lecturer")}
            className="bg-[#00ED64] hover:bg-[#00c753] text-[#001E2B] font-extrabold px-4 py-2.5 rounded-full shadow-[0_8px_30px_rgba(0,237,100,0.4)] flex items-center gap-2 text-xs cursor-pointer border-2 border-[#001E2B] transition-transform hover:scale-105"
          >
            <FiMonitor className="w-4 h-4" />
            <span>Basculer sur Espace Prof (Bureau)</span>
          </button>
        </div>

      </div>
    </LazyMotion>
  );
}