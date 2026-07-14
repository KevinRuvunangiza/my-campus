import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  FiBarChart2,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiBookOpen,
  FiPlay,
  FiAlertTriangle,
  FiAward,
  FiTarget,
  FiChevronRight,
} from "react-icons/fi";
import TopNav from "../../layout/TopNav";
import BottomNav from "../../layout/BottomNav";

// Mock data reflecting multi-lecturer purchases with deep metrics
const MOCK_UNLOCKED_COURSES = [
  {
    id: "1",
    title: "Algorithmique & Structures de Données II",
    professor: "Prof. Mpunga",
    department: "Algorithmique",
    readinessScore: 82,
    metrics: {
      accuracy: 88, // 50% weight (A_correct / A_total)
      coverage: 75, // 35% weight (S_completed / S_total)
      speedEfficiency: 85, // 15% weight (1 - T_avg / T_limit)
      totalQuestions: 142,
      correctAnswers: 125,
      avgTimeSeconds: 45,
      timeLimitSeconds: 60,
    },
    chapters: [
      {
        id: "c1",
        title: "Ch. 1 : Récursivité & Complexité",
        progress: 100,
        accuracy: 95,
        status: "mastered",
      },
      {
        id: "c2",
        title: "Ch. 2 : Arbres Binaires de Recherche",
        progress: 80,
        accuracy: 85,
        status: "good",
      },
      {
        id: "c3",
        title: "Ch. 3 : Arbres AVL & Équilibrage",
        progress: 45,
        accuracy: 58,
        status: "needs_work",
      },
      {
        id: "c4",
        title: "Ch. 4 : Graphes & Parcours",
        progress: 20,
        accuracy: 70,
        status: "started",
      },
    ],
    recommendation:
      "Focus prioritaire sur le Chapitre 3 (Arbres AVL) où votre taux de précision est de 58%.",
  },
  {
    id: "2",
    title: "Systèmes d'Exploitation et Réseaux",
    professor: "Prof. Kabasele",
    department: "Systèmes",
    readinessScore: 64,
    metrics: {
      accuracy: 70,
      coverage: 50,
      speedEfficiency: 75,
      totalQuestions: 80,
      correctAnswers: 56,
      avgTimeSeconds: 48,
      timeLimitSeconds: 60,
    },
    chapters: [
      {
        id: "c1_sys",
        title: "Ch. 1 : Gestion des Processus & Threads",
        progress: 90,
        accuracy: 80,
        status: "good",
      },
      {
        id: "c2_sys",
        title: "Ch. 2 : Ordonnanceur & CPU",
        progress: 60,
        accuracy: 65,
        status: "good",
      },
      {
        id: "c3_sys",
        title: "Ch. 3 : Gestion de la Mémoire Virtuelle",
        progress: 10,
        accuracy: 40,
        status: "needs_work",
      },
    ],
    recommendation:
      "Augmentez votre couverture globale (50%) en complétant les séries du Chapitre 3.",
  },
];

export default function Progress({ activeTab, setActiveTab, onOpenArena }) {
  const [selectedCourseId, setSelectedCourseId] = useState(
    MOCK_UNLOCKED_COURSES[0].id,
  );

  const course =
    MOCK_UNLOCKED_COURSES.find((c) => c.id === selectedCourseId) ||
    MOCK_UNLOCKED_COURSES[0];

  return (
    <div className="min-h-screen bg-[#0A222F] text-white flex flex-col justify-between pb-24 md:pb-6 font-sans">
      <TopNav name="Kevin Ruvunangiza" university="UNIKIN" />

      <main className="flex-1 max-w-md w-full mx-auto px-5 py-6 space-y-6">
        {/* HEADER & LECTURER SELECTOR PILLS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <FiBarChart2 className="text-[#00ED64]" /> Analyses par Professeur
            </h1>
            <span className="text-xs font-mono text-slate-400">
              {MOCK_UNLOCKED_COURSES.length} cours débloqués
            </span>
          </div>

          {/* Horizontal Course Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {MOCK_UNLOCKED_COURSES.map((c) => {
              const isSelected = c.id === selectedCourseId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourseId(c.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-medium shrink-0 transition-all cursor-pointer border flex flex-col text-left ${
                    isSelected
                      ? "bg-[#1C364B] border-[#00ED64] text-white shadow-[0_0_15px_rgba(0,237,100,0.15)]"
                      : "bg-[#162C3D]/60 border-[#3D4F58]/30 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="font-bold line-clamp-1 max-w-[160px]">
                    {c.department}
                  </span>
                  <span
                    className={`text-[10px] font-mono ${isSelected ? "text-[#00ED64]" : "text-slate-500"}`}
                  >
                    {c.professor} • {c.readinessScore}% R
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <m.div
            key={course.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* MASTER SCORE & WEIGHTED ALGORITHM CARD */}
            <section className="bg-gradient-to-br from-[#162C3D] to-[#0D2633] border border-[#3D4F58]/50 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-36 h-36 bg-[#00ED64]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#00ED64] block mb-0.5">
                    SCORE DE PRÉPARATION SPÉCIFIQUE
                  </span>
                  <h2 className="text-base font-bold text-white leading-snug">
                    {course.title}
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {course.professor}
                  </p>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-[#00684A] border border-[#00ED64]/40 flex flex-col items-center justify-center shrink-0 shadow-lg">
                  <span className="text-xl font-extrabold font-mono text-[#00ED64] leading-none">
                    {course.readinessScore}%
                  </span>
                  <span className="text-[8px] font-mono text-white uppercase tracking-wider mt-1">
                    Indice R
                  </span>
                </div>
              </div>

              {/* Algorithm Metrics Breakdown (50% / 35% / 15%) */}
              <div className="space-y-3.5 pt-4 border-t border-[#3D4F58]/40">
                {/* Accuracy */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-mono">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <FiTarget className="text-[#00ED64]" /> Précision QCM
                      (Poids: 50%)
                    </span>
                    <span className="text-[#00ED64] font-bold">
                      {course.metrics.accuracy}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#0A222F] rounded-full overflow-hidden p-0.5 border border-[#3D4F58]/30">
                    <m.div
                      className="h-full bg-gradient-to-r from-[#00684A] to-[#00ED64] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${course.metrics.accuracy}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Coverage */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-mono">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <FiBookOpen className="text-[#00ED64]" /> Couverture
                      Syllabus (Poids: 35%)
                    </span>
                    <span className="text-[#00ED64] font-bold">
                      {course.metrics.coverage}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#0A222F] rounded-full overflow-hidden p-0.5 border border-[#3D4F58]/30">
                    <m.div
                      className="h-full bg-gradient-to-r from-[#00684A] to-[#00ED64] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${course.metrics.coverage}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    />
                  </div>
                </div>

                {/* Speed */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-mono">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <FiClock className="text-[#00ED64]" /> Efficacité Temps
                      (Poids: 15%)
                    </span>
                    <span className="text-[#00ED64] font-bold">
                      {course.metrics.speedEfficiency}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#0A222F] rounded-full overflow-hidden p-0.5 border border-[#3D4F58]/30">
                    <m.div
                      className="h-full bg-gradient-to-r from-[#00684A] to-[#00ED64] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${course.metrics.speedEfficiency}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  </div>
                </div>
              </div>

              {/* Deep Quantitative Stats Ledger */}
              <div className="grid grid-cols-3 gap-2 pt-5 mt-4 border-t border-[#3D4F58]/30 text-center font-mono">
                <div className="bg-[#0A222F]/60 p-2.5 rounded-xl border border-[#3D4F58]/20">
                  <span className="text-[10px] text-slate-400 block">
                    Questions
                  </span>
                  <span className="text-sm font-bold text-white">
                    {course.metrics.totalQuestions}
                  </span>
                </div>
                <div className="bg-[#0A222F]/60 p-2.5 rounded-xl border border-[#3D4F58]/20">
                  <span className="text-[10px] text-slate-400 block">
                    Réussies
                  </span>
                  <span className="text-sm font-bold text-[#00ED64]">
                    {course.metrics.correctAnswers}
                  </span>
                </div>
                <div className="bg-[#0A222F]/60 p-2.5 rounded-xl border border-[#3D4F58]/20">
                  <span className="text-[10px] text-slate-400 block">
                    Temps Moy.
                  </span>
                  <span className="text-sm font-bold text-white">
                    {course.metrics.avgTimeSeconds}s
                  </span>
                </div>
              </div>
            </section>

            {/* AI/SYSTEM INSIGHT BOX */}
            <div className="bg-[#162C3D] border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 shadow-md">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                <FiAlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-300 font-mono uppercase tracking-wide">
                  Analyse Stratégique TP
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {course.recommendation}
                </p>
              </div>
            </div>

            {/* CHAPTER BY CHAPTER MASTERY BREAKDOWN */}
            <section className="space-y-3">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 pl-1">
                Maîtrise par Chapitre ({course.chapters.length})
              </h3>

              <div className="space-y-2.5">
                {course.chapters.map((ch) => {
                  let badgeColor =
                    "bg-[#0A222F] text-slate-400 border-[#3D4F58]/40";
                  let badgeText = "En Cours";
                  if (ch.status === "mastered") {
                    badgeColor =
                      "bg-[#00684A]/40 text-[#00ED64] border-[#00ED64]/30";
                    badgeText = "Maîtrisé";
                  } else if (ch.status === "needs_work") {
                    badgeColor =
                      "bg-rose-950/40 text-rose-300 border-rose-500/30";
                    badgeText = "Révision Recommandée";
                  }

                  return (
                    <m.div
                      key={ch.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-[#162C3D]/90 border border-[#3D4F58]/40 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-white leading-snug">
                            {ch.title}
                          </h4>
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded border shrink-0 font-bold ${badgeColor}`}
                          >
                            {badgeText}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                          <span>
                            Couverture:{" "}
                            <strong className="text-white">
                              {ch.progress}%
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            Précision:{" "}
                            <strong
                              className={
                                ch.accuracy < 60
                                  ? "text-rose-400"
                                  : "text-[#00ED64]"
                              }
                            >
                              {ch.accuracy}%
                            </strong>
                          </span>
                        </div>

                        <div className="w-full h-1 bg-[#0A222F] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${ch.accuracy < 60 ? "bg-rose-500" : "bg-[#00ED64]"}`}
                            style={{ width: `${ch.progress}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenArena(course)}
                        title="Lancer un entraînement sur ce chapitre"
                        className="p-3 rounded-xl bg-[#0A222F] hover:bg-[#00ED64] text-slate-300 hover:text-[#001E2B] border border-[#3D4F58]/50 hover:border-[#00ED64] transition-all cursor-pointer shrink-0 shadow-sm group"
                      >
                        <FiPlay className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                      </button>
                    </m.div>
                  );
                })}
              </div>
            </section>

            {/* GLOBAL LAUNCH CTA FOR THIS LECTURER */}
            <button
              onClick={() => onOpenArena(course)}
              className="w-full bg-[#00ED64] hover:bg-[#00c753] text-[#001E2B] font-extrabold py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,237,100,0.25)] hover:shadow-[0_6px_25px_rgba(0,237,100,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <FiPlay className="fill-current w-4 h-4" />
              <span>Lancer une série TP — {course.department}</span>
            </button>
          </m.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
