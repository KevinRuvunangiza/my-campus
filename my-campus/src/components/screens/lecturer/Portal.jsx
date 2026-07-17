// src/components/screens/lecturer/Portal.jsx
import { useState, useEffect } from "react";
import { LazyMotion, domAnimation, AnimatePresence, m } from "framer-motion";
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import * as lecturerService from "../../../services/lecturerService";

// Layout Imports
import Sidebar from "../../layout/lecturer/Sidebar";
import TopNavbar from "../../layout/lecturer/TopNavbar";

// Screen Imports
import LecturerDashboard from "./Dashboard";
import SyllabusManager from "./SyllabusManager";
import StudentAnalytics from "./StudentAnalytics";
import QcmBuilder from "./QcmBuilder";
import Financials from "./Financials";

export default function LecturerPortal({ user, onSwitchToStudent }) {
  // Navigation & Layout States
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Database States
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [financeMetrics, setFinanceMetrics] = useState({
    totalSalesCount: 0,
    grossRevenueFc: 0,
    netLecturerShareFc: 0,
  });

  // Load live data from Supabase
  const loadDashboardData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const coursesData = await lecturerService.getLecturerCourses(user.id);
      setCourses(coursesData || []);

      const financesData = await lecturerService.getFinancialDashboard(user.id);
      if (financesData) {
        setFinanceMetrics(financesData);
      }
    } catch (err) {
      console.error("Erreur Monolith [Lecturer Portal]:", err);
      setError(
        err.message || "Impossible de synchroniser vos données Supabase.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Global Syllabus Cap Calculation (Max 5 across all courses)
  const totalSyllabiCount = courses.reduce(
    (acc, course) => acc + (course.syllabi?.length || 0),
    0,
  );
  const isCapReached = totalSyllabiCount >= 5;
  const isVerified = user?.is_verified === true;

  // Action Handlers
  const handleCreateCourse = async ({ title, department, priceFc }) => {
    setError(null);
    try {
      const newCourse = await lecturerService.createCourse({
        lecturerId: user.id,
        title,
        department,
        priceFc,
      });
      setCourses([newCourse, ...courses]);
      setSuccessMsg(`✅ Cours "${newCourse.title}" créé en mode brouillon !`);
      setTimeout(() => setSuccessMsg(null), 4000);
      return true;
    } catch (err) {
      setError(err.message || "Échec de la création du cours.");
      return false;
    }
  };

  const handleTogglePublish = async (course) => {
    setError(null);
    try {
      const updated = await lecturerService.toggleCoursePublication(
        course.id,
        !course.is_published,
        user,
      );
      setCourses(
        courses.map((c) =>
          c.id === course.id ? { ...c, is_published: updated.is_published } : c,
        ),
      );
      setSuccessMsg(
        `✅ Cours ${updated.is_published ? "publié sur le Market !" : "retiré du Market."}`,
      );
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUploadSyllabus = async (file, courseId, title) => {
    setError(null);
    try {
      await lecturerService.uploadSyllabusFile(file, courseId, title);
      setSuccessMsg(
        "🚀 Syllabus uploadé avec succès et sécurisé par DRM Canvas !",
      );
      await loadDashboardData(); // Refresh counts
      setTimeout(() => setSuccessMsg(null), 4000);
      return true;
    } catch (err) {
      setError(err.message); // Catches the 10MB guard or Postgres 5-cap exception
      return false;
    }
  };

  const handleDeleteSyllabus = async (syllabusId, filePath) => {
    setError(null);
    try {
      await lecturerService.deleteSyllabus(syllabusId, filePath);
      setSuccessMsg(
        "🗑️ Syllabus supprimé. Une place a été libérée sur votre quota.",
      );
      await loadDashboardData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression du fichier.");
    }
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen bg-[#0A222F] text-white flex selection:bg-[#00ED64] selection:text-[#001E2B] font-sans">
        {/* SIDEBAR NAVIGATION */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onSwitchToStudent={onSwitchToStudent}
        />

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <TopNavbar
            lecturerName={
              user?.full_name
                ? `${user?.academic_title || "Prof."} ${user.full_name}`
                : "Professeur USCITECH"
            }
            department={user?.department || "Faculté d'Informatique"}
            syllabiCount={totalSyllabiCount}
            isCapReached={isCapReached}
          />

          <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto">
            {/* SANDBOX / UNVERIFIED NOTICE */}
            {!isVerified && (
              <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-200">
                <div className="flex items-center gap-3">
                  <FiAlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <strong className="font-bold text-white block mb-0.5">
                      Mode Brouillon (Sandbox) Actif
                    </strong>
                    <span>
                      Vous pouvez structurer vos cours et uploader vos TP, mais
                      la publication sur le Market nécessite la validation de
                      votre profil par l'équipe Monolith.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* GLOBAL NOTIFICATIONS */}
            <AnimatePresence>
              {error && (
                <m.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between shadow-lg"
                >
                  <div className="flex items-center gap-2.5">
                    <FiAlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      <strong>Erreur :</strong> {error}
                    </span>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="font-bold underline hover:text-white transition-colors"
                  >
                    Fermer
                  </button>
                </m.div>
              )}

              {successMsg && (
                <m.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-[#00ED64]/50 text-emerald-200 text-xs flex items-center gap-2.5 font-bold shadow-lg"
                >
                  <FiCheckCircle className="w-4 h-4 text-[#00ED64] shrink-0" />
                  <span>{successMsg}</span>
                </m.div>
              )}
            </AnimatePresence>

            {/* CONTENT VIEW SWITCHER */}
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4 text-slate-400 font-mono text-xs">
                <div className="w-8 h-8 border-2 border-[#00ED64] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,237,100,0.3)]" />
                <span>Synchronisation avec la base de données Supabase...</span>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === "dashboard" && (
                  <m.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <LecturerDashboard
                      courses={courses}
                      isVerified={isVerified}
                      totalSyllabiCount={totalSyllabiCount}
                      financeMetrics={financeMetrics}
                      onCreateCourse={handleCreateCourse}
                      onTogglePublish={handleTogglePublish}
                      onNavigate={(tab) => setActiveTab(tab)}
                    />
                  </m.div>
                )}

                {activeTab === "students" && (
                  <m.div
                    key="students"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <StudentAnalytics courses={courses} />
                  </m.div>
                )}

                {activeTab === "syllabus" && (
                  <m.div
                    key="syllabus"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <SyllabusManager
                      courses={courses}
                      totalSyllabiCount={totalSyllabiCount}
                      isCapReached={isCapReached}
                      onUploadSyllabus={handleUploadSyllabus}
                      onDeleteSyllabus={handleDeleteSyllabus}
                    />
                  </m.div>
                )}

                {activeTab === "qcm" && (
                  <m.div
                    key="qcm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <QcmBuilder courses={courses} />
                  </m.div>
                )}

                {activeTab === "financials" && (
                  <m.div
                    key="financials"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Financials user={user} financeMetrics={financeMetrics} />
                  </m.div>
                )}
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>
    </LazyMotion>
  );
}
