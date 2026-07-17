// src/components/screens/lecturer/Portal.jsx
import { useState, useEffect } from "react";
import { LazyMotion, domAnimation, AnimatePresence, m } from "framer-motion";
import {
  FiCheckCircle,
  FiSliders,
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

export default function LecturerPortal({ user }) {
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
    grossRevenueUsd: 0,
    netLecturerShareUsd: 0,
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
  const handleCreateCourse = async ({ title, department, priceUsd }) => {
    setError(null);
    try {
      const newCourse = await lecturerService.createCourse({
        lecturerId: user.id,
        title,
        department,
        priceUsd,
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
            {/* ── STANDBY BANNER — affiché tant que is_verified === false ── */}
            {!isVerified && (
              <div className="mb-8 bg-gradient-to-r from-amber-950/60 to-[#162C3D]/80 border-2 border-amber-500/50 rounded-3xl p-6 shadow-[0_0_40px_rgba(245,158,11,0.08)]">
                <div className="flex items-start gap-4">
                  {/* Icon cluster */}
                  <div className="relative shrink-0 mt-0.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                      <FiSliders className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500/30 border border-amber-400/60 flex items-center justify-center">
                      <FiAlertCircle className="w-3 h-3 text-amber-300" />
                    </div>
                  </div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                        Compte en Veille
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        En attente de vérification facultaire
                      </span>
                    </div>
                    <h2 className="text-base font-extrabold text-white leading-snug">
                      Mode Brouillon Actif — Publication désactivée
                    </h2>
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                      Votre dossier d'accréditation est en cours d'examen par
                      l'équipe USCITECH. Jusqu'à validation de vos titres
                      académiques, la publication de vos cours sur le marché
                      étudiant en direct est <strong className="text-amber-300">temporairement suspendue</strong>.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        Création de cours (brouillon)
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        Upload de syllabus & TP
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        Construction de la banque QCM
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-rose-400/80 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                        Publication sur le Market (bloquée)
                      </div>
                    </div>
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
