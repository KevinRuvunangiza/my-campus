// src/components/layout/lecturer/Sidebar.jsx
import { m } from "framer-motion";
import {
  FiGrid,
  FiBook,
  FiCheckSquare,
  FiDollarSign,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiShield,
} from "react-icons/fi";

const NAV_ITEMS = [
  { id: "dashboard", label: "Tableau de Bord", icon: FiGrid },
  { id: "students", label: "Suivi des Étudiants", icon: FiUsers },
  { id: "syllabus", label: "Mes Syllabus & TP", icon: FiBook },
  { id: "qcm", label: "Banque de QCM", icon: FiCheckSquare },
  { id: "financials", label: "Revenus & Retraits", icon: FiDollarSign },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
}) {
  return (
    <m.aside
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-screen bg-[#0D2633] border-r border-[#3D4F58]/40 flex flex-col justify-between p-4 sticky top-0 z-40 shrink-0 font-sans shadow-xl"
    >
      {/* EN-TÊTE DE LA SIDEBAR */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#00ED64] flex items-center justify-center text-[#001E2B] font-extrabold text-base font-mono shrink-0 shadow-[0_0_15px_rgba(0,237,100,0.3)]">
                DC
              </div>
              <span className="font-bold text-white text-sm tracking-tight truncate">
                Campus Digital{" "}
                <span className="text-[#00ED64] text-xs font-mono block">
                  ESPACE PROF
                </span>
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-[#162C3D] hover:bg-[#1C364B] text-slate-300 hover:text-[#00ED64] transition-colors cursor-pointer mx-auto"
          >
            {isCollapsed ? (
              <FiChevronRight className="w-4 h-4" />
            ) : (
              <FiChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* BADGE DE VÉRIFICATION ADMIN */}
        {!isCollapsed ? (
          <div className="bg-[#162C3D]/80 border border-[#00ED64]/30 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00684A] text-[#00ED64] flex items-center justify-center shrink-0">
              <FiShield className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#00ED64] block font-bold">
                Statut Admin
              </span>
              <span className="text-xs text-slate-200 font-semibold truncate block">
                Professeur Vérifié
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Professeur Vérifié">
            <div className="w-10 h-10 rounded-xl bg-[#00684A] text-[#00ED64] flex items-center justify-center border border-[#00ED64]/30 shadow-sm">
              <FiShield className="w-5 h-5" />
            </div>
          </div>
        )}

        {/* LISTE DES LIENS DE NAVIGATION */}
        <nav className="space-y-1.5 pt-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : ""}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#00ED64] text-[#001E2B] shadow-[0_4px_15px_rgba(0,237,100,0.2)] scale-[1.02]"
                    : "text-slate-300 hover:bg-[#162C3D] hover:text-white"
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${isActive ? "text-[#001E2B]" : "text-slate-400"}`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* PIED DE SIDEBAR — intentionnellement vide (pas de switcher de rôle) */}
      <div className="pt-4 border-t border-[#3D4F58]/30" />
    </m.aside>
  );
}
