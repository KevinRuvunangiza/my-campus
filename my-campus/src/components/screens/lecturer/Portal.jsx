import { useState } from "react";
import { LazyMotion, domAnimation, AnimatePresence, m } from "framer-motion";

// Import du layout
import Sidebar from "../../layout/lecturer/Sidebar";
import TopNavbar from "../../layout/lecturer/TopNavbar";

// Import des écrans
import LecturerDashboard from "./Dashboard";

export default function LecturerPortal({ onSwitchToStudent }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen bg-[#0A222F] text-white flex selection:bg-[#00ED64] selection:text-[#001E2B] font-sans">
        {/* BARRE LATÉRALE DE NAVIGATION */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onSwitchToStudent={onSwitchToStudent}
        />

        {/* CONTENU PRINCIPAL AVEC EN-TÊTE FIXE */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <TopNavbar
            lecturerName="Prof. Mpunga"
            department="Faculté d'Informatique"
          />

          <main className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <m.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <LecturerDashboard onNavigate={(tab) => setActiveTab(tab)} />
                </m.div>
              )}

              {/* Les écrans Syllabus, QCM et Financier seront injectés ici au prochain tour */}
              {activeTab !== "dashboard" && (
                <m.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-[#162C3D] border border-[#00ED64]/30 rounded-2xl mx-auto flex items-center justify-center text-2xl animate-pulse">
                    ⚡
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Module en cours de montage...
                  </h3>
                  <p className="text-xs text-slate-400">
                    Nous construisons l'interface {activeTab.toUpperCase()} au
                    prochain tour !
                  </p>
                </m.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </LazyMotion>
  );
}
