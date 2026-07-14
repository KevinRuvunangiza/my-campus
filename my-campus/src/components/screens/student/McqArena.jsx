import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiRotateCcw,
  FiAward,
  FiBookOpen,
} from "react-icons/fi";

const MOCK_QUIZ = {
  courseTitle: "Algorithmique & Structures de Données II",
  chapter: "Chapitre 2 : Les Arbres Binaires de Recherche",
  timeLimitSeconds: 60, // T_limit per question
  questions: [
    {
      id: "q1",
      text: "Quelle est la complexité temporelle pire cas pour une recherche dans un arbre binaire de recherche (ABR) non équilibré ?",
      options: ["O(log n)", "O(n)", "O(n log n)", "O(1)"],
      correctIndex: 1,
      explanation:
        "Dans le pire des cas (arbre dégénéré sous forme de liste chaînée), il faut parcourir tous les 'n' nœuds de l'arbre.",
    },
    {
      id: "q2",
      text: "Quel parcours d'arbre permet de visiter les nœuds d'un ABR dans l'ordre croissant ?",
      options: [
        "Parcours Préfixe",
        "Parcours Postfixe",
        "Parcours Infixe",
        "Parcours en Largeur",
      ],
      correctIndex: 2,
      explanation:
        "Le parcours infixe (Gauche, Racine, Droite) sur un ABR visite systématiquement les valeurs de la plus petite à la plus grande.",
    },
    {
      id: "q3",
      text: "Dans un ABR, où se trouve le successeur infixe d'un nœud qui possède un sous-arbre droit ?",
      options: [
        "Le minimum du sous-arbre droit",
        "Le maximum du sous-arbre gauche",
        "La racine de l'arbre",
        "Le parent du nœud",
      ],
      correctIndex: 0,
      explanation:
        "Si le sous-arbre droit n'est pas vide, le successeur infixe est toujours le nœud le plus à gauche (le minimum) de ce sous-arbre droit.",
    },
  ],
};

export default function McqArena({ onExit, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MOCK_QUIZ.timeLimitSeconds);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  const currentQ = MOCK_QUIZ.questions[currentIndex];

  // Countdown Timer Effect
  useEffect(() => {
    if (isSubmitted || quizFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
      setTotalTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isSubmitted, quizFinished]);

  const handleSelectOption = (index) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null && timeLeft > 0) return;
    setIsSubmitted(true);
    if (selectedOption === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < MOCK_QUIZ.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setTimeLeft(MOCK_QUIZ.timeLimitSeconds);
    } else {
      setQuizFinished(true);
    }
  };

  // 1. COMPLETION SCREEN (Calculates accuracy & speed efficiency for Readiness R-Score)
  if (quizFinished) {
    const accuracyRate = Math.round((score / MOCK_QUIZ.questions.length) * 100);
    const avgTimePerQuestion = Math.round(
      totalTimeSpent / MOCK_QUIZ.questions.length,
    );

    return (
      <div className="min-h-screen bg-[#0A222F] text-white flex flex-col items-center justify-center p-6 font-sans">
        <m.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden space-y-6"
        >
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#00ED64]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 bg-[#00684A] text-[#00ED64] rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(0,237,100,0.3)] border border-[#00ED64]/30">
            <FiAward className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00ED64] block mb-1">
              ENTRAÎNEMENT TERMINÉ
            </span>
            <h2 className="text-xl font-extrabold text-white">
              Résultats du Test TP
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {MOCK_QUIZ.courseTitle}
            </p>
          </div>

          {/* Metrics breakdown grid */}
          {/* Metrics breakdown grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-[#0A222F]/60 p-4 rounded-2xl border border-[#3D4F58]/40">
              <span className="text-xs text-slate-400 font-mono block mb-1">
                Précision (A
                <sub className="text-[9px] uppercase ml-0.5 font-bold">
                  corr
                </sub>
                )
              </span>
              <span className="text-2xl font-bold font-mono text-[#00ED64]">
                {accuracyRate}%
              </span>
            </div>
            <div className="bg-[#0A222F]/60 p-4 rounded-2xl border border-[#3D4F58]/40">
              <span className="text-xs text-slate-400 font-mono block mb-1">
                Temps Moyen (T
                <sub className="text-[9px] uppercase ml-0.5 font-bold">moy</sub>
                )
              </span>
              <span className="text-2xl font-bold font-mono text-white">
                {avgTimePerQuestion}s
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-300 bg-[#0A222F]/40 p-3.5 rounded-xl border border-[#3D4F58]/30 leading-relaxed">
            🚀 Votre performance a été enregistrée ! Votre{" "}
            <strong>Score de Préparation (R)</strong> a augmenté de{" "}
            <strong>+4%</strong> sur votre tableau de bord.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setScore(0);
                setQuizFinished(false);
                setIsSubmitted(false);
                setSelectedOption(null);
                setTimeLeft(MOCK_QUIZ.timeLimitSeconds);
              }}
              className="flex-1 bg-[#0A222F] hover:bg-[#1C364B] text-slate-300 border border-[#3D4F58]/60 font-bold py-3.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiRotateCcw className="w-4 h-4" /> Réessayer
            </button>
            <button
              onClick={onExit}
              className="flex-1 bg-[#00ED64] hover:bg-[#00c753] text-[#001E2B] font-extrabold py-3.5 rounded-xl text-xs shadow-[0_4px_15px_rgba(0,237,100,0.25)] transition-all cursor-pointer"
            >
              Terminer
            </button>
          </div>
        </m.div>
      </div>
    );
  }

  // 2. ACTIVE QUIZ ARENA SCREEN
  return (
    <div className="min-h-screen bg-[#0A222F] text-white flex flex-col justify-between font-sans selection:bg-[#00ED64] selection:text-[#001E2B]">
      {/* TOP ARENA HEADER & TIMER */}
      <header className="p-4 bg-[#0D2633] border-b border-[#3D4F58]/50 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 rounded-xl bg-[#162C3D] hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-mono text-[#00ED64] block font-semibold uppercase">
              Question {currentIndex + 1} / {MOCK_QUIZ.questions.length}
            </span>
            <h1 className="text-xs font-bold text-slate-200 line-clamp-1">
              {MOCK_QUIZ.chapter}
            </h1>
          </div>
        </div>

        {/* Dynamic Countdown Pill */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-extrabold border transition-colors ${
            timeLeft <= 10
              ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
              : "bg-[#162C3D] text-[#00ED64] border-[#3D4F58]/60"
          }`}
        >
          <FiClock className="w-3.5 h-3.5 shrink-0" />
          <span>{timeLeft}s</span>
        </div>
      </header>

      {/* QUESTION & OPTIONS BODY */}
      <main className="flex-1 max-w-md w-full mx-auto px-5 py-6 flex flex-col justify-center space-y-6">
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#162C3D] rounded-full overflow-hidden">
          <m.div
            className="h-full bg-[#00ED64] rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentIndex + 1) / MOCK_QUIZ.questions.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question Text Card */}
        <div className="bg-gradient-to-br from-[#162C3D] to-[#0D2633] border border-[#3D4F58]/40 rounded-3xl p-6 shadow-lg">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-[#0A222F] px-2.5 py-1 rounded-md border border-[#3D4F58]/40 mb-3">
            <FiBookOpen className="text-[#00ED64] w-3 h-3" /> TP Inclus
          </span>
          <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQ.text}
          </h2>
        </div>

        {/* Interactive Option Cards */}
        <div className="space-y-3">
          {currentQ.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = currentQ.correctIndex === index;

            let btnStyle =
              "bg-[#162C3D] border-[#3D4F58]/50 text-slate-200 hover:bg-[#1C364B] hover:border-[#3D4F58]";
            let badgeStyle = "bg-[#0A222F] text-slate-400 border-[#3D4F58]/40";

            if (isSelected && !isSubmitted) {
              btnStyle =
                "bg-[#1C364B] border-[#00ED64] text-white shadow-[0_0_15px_rgba(0,237,100,0.15)]";
              badgeStyle = "bg-[#00ED64] text-[#001E2B] font-extrabold";
            } else if (isSubmitted) {
              if (isCorrect) {
                btnStyle = "bg-[#00684A]/60 border-[#00ED64] text-white";
                badgeStyle = "bg-[#00ED64] text-[#001E2B] font-extrabold";
              } else if (isSelected && !isCorrect) {
                btnStyle = "bg-red-900/30 border-red-500/60 text-slate-200";
                badgeStyle = "bg-red-500 text-white font-bold";
              } else {
                btnStyle =
                  "bg-[#162C3D]/40 border-[#3D4F58]/20 text-slate-500 opacity-60";
              }
            }

            return (
              <m.button
                key={index}
                whileTap={{ scale: isSubmitted ? 1 : 0.98 }}
                onClick={() => handleSelectOption(index)}
                disabled={isSubmitted}
                className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
              >
                <span className="flex-1 leading-snug">{option}</span>
                <span
                  className={`w-7 h-7 rounded-lg text-xs font-mono flex items-center justify-center shrink-0 border transition-colors ${badgeStyle}`}
                >
                  {String.fromCharCode(65 + index)} {/* A, B, C, D */}
                </span>
              </m.button>
            );
          })}
        </div>

        {/* LECTURER SOLUTION EXPLANATION (Appears immediately after submitting) */}
        <AnimatePresence>
          {isSubmitted && (
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border text-xs space-y-1.5 shadow-md ${
                selectedOption === currentQ.correctIndex ||
                (selectedOption === null && timeLeft === 0)
                  ? "bg-[#00684A]/30 border-[#00ED64]/40 text-emerald-200"
                  : "bg-red-950/40 border-red-500/40 text-rose-200"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold font-mono">
                {selectedOption === currentQ.correctIndex ? (
                  <>
                    <FiCheckCircle className="text-[#00ED64] w-4 h-4 shrink-0" />
                    <span className="text-[#00ED64]">
                      EXCELLENT ! BONNE RÉPONSE
                    </span>
                  </>
                ) : (
                  <>
                    <FiAlertCircle className="text-red-400 w-4 h-4 shrink-0" />
                    <span className="text-red-400">
                      EXPLICATION DU PROFESSEUR
                    </span>
                  </>
                )}
              </div>
              <p className="text-slate-300 leading-relaxed pl-5">
                {currentQ.explanation}
              </p>
            </m.div>
          )}
        </AnimatePresence>
      </main>

      {/* BOTTOM ACTION BAR */}
      <footer className="p-4 bg-[#0D2633] border-t border-[#3D4F58]/50 flex justify-end max-w-md w-full mx-auto">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOption === null && timeLeft > 0}
            className="w-full bg-[#00ED64] disabled:opacity-40 hover:bg-[#00c753] text-[#001E2B] font-extrabold py-3.5 rounded-xl text-xs shadow-[0_4px_15px_rgba(0,237,100,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Valider la réponse
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="w-full bg-white hover:bg-slate-100 text-[#001E2B] font-extrabold py-3.5 rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>
              {currentIndex < MOCK_QUIZ.questions.length - 1
                ? "Question Suivante"
                : "Voir les résultats"}
            </span>
            <FiArrowRight className="w-4 h-4" />
          </button>
        )}
      </footer>
    </div>
  );
}
