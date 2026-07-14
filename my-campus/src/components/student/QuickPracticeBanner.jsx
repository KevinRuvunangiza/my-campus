
import { m } from "framer-motion";
import { FiPlay } from "react-icons/fi";

export default function QuickPracticeBanner() {
  return (
    <section className="bg-gradient-to-br from-[#00684A] to-[#001E2B] border border-[#00ED64]/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
      <div className="relative z-10 space-y-2">
        <span className="font-mono text-[9px] font-bold text-[#00ED64] uppercase tracking-widest bg-[#001E2B]/80 px-2.5 py-1 rounded-full border border-[#00ED64]/20">
          PRÉPARATION FLASH
        </span>
        <h3 className="text-md font-bold text-white pt-1">Prêt pour un test rapide ?</h3>
        <p className="text-xs text-emerald-100/80 leading-relaxed max-w-[85%]">
          Testez vos connaissances sur le chapitre 2 d'Algorithmique. 10 questions chronométrées.
        </p>
        <m.button 
          whileTap={{ scale: 0.95 }}
          className="mt-3 bg-[#00ED64] text-[#001E2B] text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 transition-transform hover:opacity-90 cursor-pointer shadow-md"
        >
          <FiPlay className="fill-current w-3 h-3" /> Lancer l'Arène MCQ
        </m.button>
      </div>
    </section>
  );
}