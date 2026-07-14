
import { FiBook, FiCompass, FiBarChart2, FiUser } from "react-icons/fi";

export default function BottomNav({ activeTab, setActiveTab }) {
  const navItems = [
    { id: "home", label: "Accueil", icon: FiBook },
    { id: "explore", label: "Explorer", icon: FiCompass },
    { id: "progress", label: "Progrès", icon: FiBarChart2 },
    { id: "profile", label: "Compte", icon: FiUser },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0A222F]/95 backdrop-blur-md border-t border-[#3D4F58]/50 py-3 px-6 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                isActive
                  ? "text-[#00ED64] scale-105 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-mono tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}