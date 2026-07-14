import { useState } from "react";
import { LazyMotion, domAnimation, AnimatePresence, m } from "framer-motion";

// Import all Student Screens
import StudentDashboard from "./components/screens/student/Dashboard";
import Explore from "./components/screens/student/Explore";
import Progress from "./components/screens/student/Progress";
import Profile from "./components/screens/student/Profile";
import PaymentModal from "./components/screens/student/PaymentModal";
import SyllabusReader from "./components/screens/student/SyllabusReader";
import McqArena from "./components/screens/student/McqArena";

export default function App() {
  // 1. Primary Bottom Navigation State ('home' | 'explore' | 'progress' | 'profile')
  const [activeTab, setActiveTab] = useState("home");

  // 2. Full-Screen & Modal Overlay States
  const [selectedCourseForPaywall, setSelectedCourseForPaywall] = useState(null);
  const [activeReaderCourse, setActiveReaderCourse] = useState(null);
  const [activeArenaCourse, setActiveArenaCourse] = useState(null);

  // Handler: When a course card is clicked anywhere in the app
  const handleCourseSelect = (course) => {
    if (course.isUnlocked) {
      // Open full-screen Canvas Reader
      setActiveReaderCourse(course);
    } else {
      // Trigger USSD Mobile Money Paywall
      setSelectedCourseForPaywall(course);
    }
  };

  // Handler: When Mobile Money payment succeeds
  const handlePaymentSuccess = (courseId) => {
    console.log(`Course ${courseId} unlocked successfully via USSD!`);
    setSelectedCourseForPaywall(null);
    setActiveTab("progress"); // Route to progress to see newly unlocked stats
  };

  // OVERRIDE 1: Full-screen Syllabus Canvas Reader
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

  // OVERRIDE 2: Full-screen Timed MCQ Practice Arena
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
              <Profile activeTab={activeTab} setActiveTab={setActiveTab} />
            </m.div>
          )}
        </AnimatePresence>

        {/* MOBILE MONEY PAYWALL MODAL OVERLAY */}
        <AnimatePresence>
          {selectedCourseForPaywall && (
            <PaymentModal
              course={selectedCourseForPaywall}
              onClose={() => setSelectedCourseForPaywall(null)}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </AnimatePresence>

      </div>
    </LazyMotion>
  );
}