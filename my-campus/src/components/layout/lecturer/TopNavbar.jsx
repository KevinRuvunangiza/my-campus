import { useState } from "react";
import {
  FiBell,
  FiSearch,
  FiUser,
  FiChevronDown,
  FiDollarSign,
} from "react-icons/fi";

const UNIVERSITIES = [
  "UNIKIN - Kinshasa",
  "UPC - Kinshasa",
  "ULK - Kinshasa",
  "ISC - Kinshasa",
];

export default function TopNavbar({
  lecturerName = "Prof. Mpunga",
  department = "Faculté d'Informatique",
}) {
  const [selectedUni, setSelectedUni] = useState(UNIVERSITIES[0]);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-20 bg-[#0A222F]/80 backdrop-blur-md border-b border-[#3D4F58]/40 px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* RECHERCHE GLOBALE ET BREADCRUMB */}
      <div className="flex items-center gap-6 flex-1 max-w-xl">
        <div>
          <span className="text-[10px] font-mono text-[#00ED64] uppercase tracking-widest block font-bold">
            {department}
          </span>
          <h1 className="text-base font-extrabold text-white">
            Tableau de Bord Professeur
          </h1>
        </div>

        <div className="relative flex-1 hidden md:block">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un étudiant, un paiement ou un QCM..."
            className="w-full bg-[#162C3D] border border-[#3D4F58]/50 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00ED64] transition-all"
          />
        </div>
      </div>

      {/* ACTIONS ET PROFIL */}
      <div className="flex items-center gap-4">
        {/* Sélecteur d'Institution */}
        <div className="relative hidden sm:block">
          <select
            value={selectedUni}
            onChange={(e) => setSelectedUni(e.target.value)}
            className="bg-[#162C3D] border border-[#3D4F58]/60 text-slate-200 text-xs font-semibold rounded-xl pl-3.5 pr-8 py-2.5 focus:outline-none focus:border-[#00ED64] cursor-pointer appearance-none"
          >
            {UNIVERSITIES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
        </div>

        {/* Cloche de notifications (Achats FlexPay) */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-[#162C3D] border border-[#3D4F58]/60 text-slate-300 hover:text-[#00ED64] transition-colors relative cursor-pointer"
          >
            <FiBell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00ED64] text-[#001E2B] font-extrabold text-[9px] rounded-full flex items-center justify-center animate-pulse">
              3
            </span>
          </button>

          {/* Popup de notifications */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-[#0D2633] border border-[#3D4F58] rounded-2xl shadow-2xl p-4 space-y-3 z-50">
              <div className="flex justify-between items-center pb-2 border-b border-[#3D4F58]/40">
                <span className="text-xs font-bold text-white">
                  Achats Récents (M-Pesa)
                </span>
                <span className="text-[10px] font-mono text-[#00ED64]">
                  En direct
                </span>
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 bg-[#162C3D]/60 p-2.5 rounded-xl text-xs border border-[#3D4F58]/20"
                  >
                    <div className="p-1.5 rounded-lg bg-[#00684A]/40 text-[#00ED64] mt-0.5">
                      <FiDollarSign className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        Nouveau syllabus débloqué
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        +2,450 FC (Part 70%) • Il y a {i * 12} min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar du Professeur */}
        <div className="flex items-center gap-3 pl-2 border-l border-[#3D4F58]/40">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00684A] to-[#00ED64] p-[1.5px] shadow-md">
            <div className="w-full h-full bg-[#0D2633] rounded-[10px] flex items-center justify-center text-white font-bold text-xs font-mono">
              PM
            </div>
          </div>
          <div className="hidden lg:block">
            <span className="text-xs font-bold text-white block leading-none">
              {lecturerName}
            </span>
            <span className="text-[10px] font-mono text-[#00ED64]">
              Compte Distributeur
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
