// src/components/layout/BottomNav.jsx

import { FiCompass, FiBookOpen, FiUser, FiBarChart2 } from "react-icons/fi";
import { m } from "framer-motion";

const NAV_ITEMS = [
  { id: "explorer", label: "Explorer", icon: FiCompass },
  { id: "library", label: "Bibliothèque", icon: FiBookOpen },
  { id: "stats", label: "Stats", icon: FiBarChart2 },
  { id: "profile", label: "Profil", icon: FiUser },
];

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D2633]/95 backdrop-blur-lg border-t border-[#3D4F58]/60 py-2 px-6 md:py-3 font-sans shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive ? "text-[#00ED64]" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {/* Active Neon Background Glow */}
              {isActive && (
                <m.div
                  layoutId="activeTabGlow"
                  className="absolute inset-0 bg-[#162C3D] border border-[#00ED64]/30 rounded-2xl shadow-[0_0_12px_rgba(0,237,100,0.15)] -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}

              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110 stroke-[2.5]" : "stroke-2"}`} />
              
              <span className={`text-[10px] font-mono mt-1 font-bold tracking-tight ${isActive ? "text-[#00ED64]" : "text-slate-400"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}