// src/components/screens/student/McqArena.jsx
import React, { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiAward,
  FiArrowRight,
  FiRotateCcw,
} from "react-icons/fi";
import * as studentService from "../../../services/studentService";

export default function McqArena({ course, onExit, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  useEffect(() => {
    studentService.getCourseQuiz(course.id).then((chapters) => {
      // Cherche le premier chapitre qui contient des questions
      const validChapter = chapters.find(
        (c) => c.questions && c.questions.length > 0,
      );
      if (validChapter) {
        setActiveChapter(validChapter);
        setQuestions(validChapter.questions);
        setTimeLeft(validChapter.questions[0].time_limit_seconds || 60);
      }
      setLoading(false);
    });
  }, [course.id]);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    if (isSubmitted || quizFinished || !currentQ) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev < 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
      setTotalTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex, isSubmitted, quizFinished, currentQ]);

  const handleSubmit = () => {
    if (selectedOption == null && timeLeft > 0) return;
    setIsSubmitted(true);
    if (selectedOption === currentQ.correct_option_index)
      setScore((prev) => prev + 1);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setTimeLeft(questions[currentIndex + 1].time_limit_seconds || 60);
    } else {
      setQuizFinished(true);
      const acc = Math.round((score / questions.length) * 100) || 0;
      // Enregistrement BD du score
      studentService.saveQcmAttempt(activeChapter.id, acc, totalTimeSpent);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0A222F] flex items-center justify-center text-white">
        <div className="animate-spin border-2 border-[#00ED64] border-t-transparent rounded-full w-8 h-8" />
      </div>
    );
  if (questions.length === 0)
    return (
      <div className="min-h-screen bg-[#0A222F] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Aucun TP disponible</h2>
        <p className="text-slate-400 mb-6">
          Le professeur n'a pas encore créé de QCM pour ce cours.
        </p>
        <button
          onClick={onExit}
          className="bg-[#00ED64] text-[#001E2B] px-6 py-2 rounded-xl font-bold"
        >
          Retour
        </button>
      </div>
    );

  if (quizFinished) {
    const accuracyRate = Math.round((score / questions.length) * 100);
    const avgTime = Math.round(totalTimeSpent / questions.length);
    return (
      <div className="min-h-screen bg-[#0A222F] text-white flex flex-col items-center justify-center p-6">
        <m.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-6 text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-[#00684A] text-[#00ED64] rounded-2xl mx-auto flex items-center justify-center mb-4 border border-[#00ED64]/30">
            <FiAward className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-extrabold text-white mb-6">
            Résultats du Test TP
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-[#0A222F]/60 p-4 rounded-2xl border border-[#3D4F58]/40">
              <span className="text-xs text-slate-400 block mb-1">
                Précision
              </span>
              <span className="text-2xl font-bold text-[#00ED64]">
                {accuracyRate}%
              </span>
            </div>
            <div className="bg-[#0A222F]/60 p-4 rounded-2xl border border-[#3D4F58]/40">
              <span className="text-xs text-slate-400 block mb-1">
                Temps Moy.
              </span>
              <span className="text-2xl font-bold text-white">{avgTime}s</span>
            </div>
          </div>
          <button
            onClick={onComplete}
            className="w-full bg-[#00ED64] text-[#001E2B] font-extrabold py-3.5 rounded-xl text-sm"
          >
            Terminer et voir mon Score R
          </button>
        </m.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A222F] text-white flex flex-col font-sans">
      <header className="p-4 bg-[#0D2633] border-b border-[#3D4F58]/50 flex items-center justify-between sticky top-0 z-50">
        <button
          onClick={onExit}
          className="p-2 rounded-xl bg-[#162C3D] text-slate-400 cursor-pointer"
        >
          <FiX className="w-5 h-5" />
        </button>
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-extrabold border ${timeLeft <= 10 ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse" : "bg-[#162C3D] text-[#00ED64] border-[#3D4F58]/60"}`}
        >
          <FiClock className="w-3.5 h-3.5" /> {timeLeft}s
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto px-5 py-6 flex flex-col justify-center space-y-6">
        <div className="bg-[#162C3D] border border-[#3D4F58]/40 rounded-3xl p-6 shadow-lg">
          <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQ.question_text}
          </h2>
        </div>
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = currentQ.correct_option_index === idx;
            let btnStyle = "bg-[#162C3D] border-[#3D4F58]/50 text-slate-200";
            if (isSelected && !isSubmitted)
              btnStyle = "bg-[#1C364B] border-[#00ED64] text-white";
            else if (isSubmitted && isCorrect)
              btnStyle = "bg-[#00684A]/60 border-[#00ED64] text-white";
            else if (isSubmitted && isSelected && !isCorrect)
              btnStyle = "bg-red-900/30 border-red-500/60 text-slate-200";
            else if (isSubmitted)
              btnStyle =
                "bg-[#162C3D]/40 border-[#3D4F58]/20 text-slate-500 opacity-60";

            return (
              <m.button
                key={idx}
                whileTap={{ scale: isSubmitted ? 1 : 0.98 }}
                onClick={() => !isSubmitted && setSelectedOption(idx)}
                className={`w-full p-4 rounded-2xl border text-left text-sm transition-all ${btnStyle}`}
              >
                {opt}
              </m.button>
            );
          })}
        </div>
        {isSubmitted && (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border text-xs space-y-1.5 ${selectedOption === currentQ.correct_option_index ? "bg-[#00684A]/30 border-[#00ED64]/40 text-emerald-200" : "bg-red-950/40 border-red-500/40 text-rose-200"}`}
          >
            <p className="pl-2">{currentQ.explanation}</p>
          </m.div>
        )}
      </main>

      <footer className="p-4 bg-[#0D2633] border-t border-[#3D4F58]/50 flex justify-end max-w-md w-full mx-auto">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOption == null && timeLeft > 0}
            className="w-full bg-[#00ED64] text-[#001E2B] font-extrabold py-3.5 rounded-xl disabled:opacity-40"
          >
            Valider la réponse
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="w-full bg-white text-[#001E2B] font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2"
          >
            {currentIndex < questions.length - 1
              ? "Question Suivante"
              : "Voir les résultats"}{" "}
            <FiArrowRight />
          </button>
        )}
      </footer>
    </div>
  );
}
