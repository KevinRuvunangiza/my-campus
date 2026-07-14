
import { m } from "framer-motion";
import { FiTrendingUp } from "react-icons/fi";

export default function ReadinessGauge({ score, metrics }) {
  // SVG circumference calculation: 2 * π * r (2 * 3.14159 * 40 ≈ 251.2)
  const circumference = 251.2;
  const strokeOffset = circumference - (circumference * score) / 100;

  return (
    <section className="bg-[#1C2D38] border border-[#3D4F58]/60 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-wide text-slate-200 flex items-center gap-2">
          <FiTrendingUp className="text-[#00ED64] w-5 h-5" /> Score de Préparation (R)
        </h2>
        <span className="font-mono text-[10px] bg-[#001E2B] text-[#00ED64] px-2.5 py-1 rounded-full border border-[#3D4F58]/50">
          FORMULE OFFICIELLE
        </span>
      </div>

      <div className="flex items-center gap-6 mb-5">
        {/* Radial Gauge */}
        <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r="40" 
              className="stroke-[#001E2B]" 
              strokeWidth="8" fill="transparent" 
            />
            <m.circle 
              cx="50" cy="50" r="40" 
              className="stroke-[#00ED64]" 
              strokeWidth="8" fill="transparent" 
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: strokeOffset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-mono tracking-tighter text-[#00ED64]">
              {score}%
            </span>
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Prêt</span>
          </div>
        </div>

        {/* Breakdown Bars */}
        <div className="flex-1 space-y-2.5">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Précision (50%)</span>
              <span className="font-mono text-[#00ED64]">{metrics.accuracy}%</span>
            </div>
            <div className="h-1.5 bg-[#001E2B] rounded-full overflow-hidden">
              <div className="h-full bg-[#00684A] rounded-full" style={{ width: `${metrics.accuracy}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Couverture Syllabus (35%)</span>
              <span className="font-mono text-[#00ED64]">{metrics.coverage}%</span>
            </div>
            <div className="h-1.5 bg-[#001E2B] rounded-full overflow-hidden">
              <div className="h-full bg-[#00684A] rounded-full" style={{ width: `${metrics.coverage}%` }} />
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 bg-[#001E2B]/50 p-3 rounded-lg border border-[#3D4F58]/30">
        Complétez les TP du <strong>Chapitre 5</strong> pour augmenter votre couverture et booster votre score global !
      </p>
    </section>
  );
}