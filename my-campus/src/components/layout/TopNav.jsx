
import { m } from "framer-motion";
import { FiSearch } from "react-icons/fi";

export default function TopNav({ name, university }) {
  const initials = name ? name.split(" ").map(n => n[0]).join("") : "KR";

  return (
    <header className="p-5 border-b border-[#3D4F58]/40 bg-[#001E2B]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00684A] border border-[#00ED64]/30 flex items-center justify-center text-white font-bold tracking-wider shadow-sm">
            {initials}
          </div>
          <div>
            <span className="font-mono text-[10px] tracking-widest text-[#00ED64] block font-semibold">
              ETUDIANT • {university}
            </span>
            <h1 className="text-md font-semibold text-slate-100">{name}</h1>
          </div>
        </div>
        
        <m.button 
          whileTap={{ scale: 0.95 }}
          aria-label="Rechercher des cours"
          className="p-2.5 rounded-full bg-[#1C2D38] border border-[#3D4F58]/60 text-slate-300 hover:text-[#00ED64] transition-colors"
        >
          <FiSearch className="w-5 h-5" />
        </m.button>
      </div>
    </header>
  );
}