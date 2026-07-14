import { useState } from "react";
import { LazyMotion, domAnimation, AnimatePresence, m } from "framer-motion";

// Import du layout
import Sidebar from "../../layout/lecturer/Sidebar";
import TopNavbar from "../../layout/lecturer/TopNavbar";
import LecturerDashboard from "./Dashboard";
import SyllabusManager from "./SyllabusManager";
import QcmBuilder from "./QcmBuilder";
import Financials from "./Financials";

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

              {activeTab === "syllabus" && (
                <m.div
                  key="syllabus"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <SyllabusManager />
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
                  <QcmBuilder />
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
                  <Financials />
                </m.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </LazyMotion>
  );
}
