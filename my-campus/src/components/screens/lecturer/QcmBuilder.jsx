// src/components/screens/lecturer/QcmBuilder.jsx
import React, { useState } from "react";
import {
  FiCheckSquare,
  FiPlus,
  FiClock,
  FiCheckCircle,
  FiHelpCircle,
  FiSave,
  FiList,
  FiAlertTriangle,
  FiUploadCloud,
} from "react-icons/fi";
import * as lecturerService from "../../../services/lecturerService";

export default function QcmBuilder({ courses = [] }) {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [activeChapter, setActiveChapter] = useState(null);

  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);

  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [timeLimit, setTimeLimit] = useState(60);
  const [explanation, setExplanation] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const chapters = selectedCourse?.chapters || [];

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (!newChapterTitle.trim() || !selectedCourseId) return;
    setLoading(true);
    try {
      const newChapter = await lecturerService.createChapter(
        selectedCourseId,
        newChapterTitle,
        chapters.length + 1,
      );
      chapters.push({ ...newChapter, questions: [] });
      setActiveChapter(newChapter);
      setNewChapterTitle("");
      setIsCreatingChapter(false);
      setSuccessMsg("Chapitre créé avec succès.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async () => {
    setErrorMsg("");
    if (!activeChapter)
      return setErrorMsg("Veuillez sélectionner un chapitre.");
    if (!questionText.trim()) return setErrorMsg("L'énoncé est vide.");
    if (options.some((opt) => !opt.trim()))
      return setErrorMsg("Toutes les options doivent être remplies.");

    setLoading(true);
    try {
      await lecturerService.createQuestion({
        chapterId: activeChapter.id,
        questionText,
        options,
        correctIndex,
        timeLimitSeconds: timeLimit,
        explanation,
      });
      setSuccessMsg("Question ajoutée à la base de données !");
      setQuestionText("");
      setOptions(["", "", "", ""]);
      setExplanation("");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 💥 NEW: Bulk JSON Upload Handler
  const handleBulkUpload = (event) => {
    const file = event.target.files[0];
    if (!file || !activeChapter) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsedQuestions = JSON.parse(e.target.result);
        setLoading(true);
        for (const q of parsedQuestions) {
          await lecturerService.createQuestion({
            chapterId: activeChapter.id,
            questionText: q.questionText,
            options: q.options,
            correctIndex: q.correctIndex,
            timeLimitSeconds: q.timeLimitSeconds || 60,
            explanation: q.explanation || "",
          });
        }
        setSuccessMsg(
          `${parsedQuestions.length} questions importées avec succès !`,
        );
        setTimeout(() => setSuccessMsg(""), 4000);
      } catch (err) {
        setErrorMsg(
          "Format de fichier invalide. Veuillez utiliser un tableau JSON correct.",
        );
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
    event.target.value = null; // reset input
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FiCheckSquare className="text-[#00ED64]" /> Banque de Questions QCM
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Construisez vos quiz chronométrés manuellement ou via JSON.
          </p>
        </div>

        {/* 💥 NEW: Bulk Upload Button */}
        {activeChapter && (
          <label className="bg-[#00ED64]/10 hover:bg-[#00ED64]/20 text-[#00ED64] border border-[#00ED64]/30 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2 transition-colors">
            <FiUploadCloud className="w-4 h-4" />{" "}
            <span>Import JSON Rapide</span>
            <input
              type="file"
              accept=".json"
              onChange={handleBulkUpload}
              className="hidden"
              disabled={loading}
            />
          </label>
        )}
      </div>

      {(successMsg || errorMsg) && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${successMsg ? "bg-emerald-950/80 text-emerald-200 border border-[#00ED64]/50" : "bg-rose-950/80 text-rose-200 border border-rose-500/50"}`}
        >
          {successMsg ? (
            <FiCheckCircle className="w-4 h-4" />
          ) : (
            <FiAlertTriangle className="w-4 h-4" />
          )}
          <span>{successMsg || errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 bg-[#162C3D]/80 border border-[#3D4F58]/50 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="space-y-2 mb-4">
            <label className="text-xs text-slate-300 font-bold block">
              1. Choisir le cours
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setActiveChapter(null);
              }}
              className="w-full px-4 py-2.5 bg-[#0A222F] border border-[#3D4F58] rounded-xl text-xs text-white outline-none cursor-pointer"
            >
              <option value="" disabled>
                Sélectionner une matière...
              </option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-[#3D4F58]/40">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FiList className="text-[#00ED64]" /> Chapitres
            </h3>
            <button
              onClick={() => setIsCreatingChapter(!isCreatingChapter)}
              disabled={!selectedCourseId}
              className="p-1.5 rounded-lg bg-[#0A222F] text-[#00ED64] hover:bg-[#00ED64] hover:text-[#001E2B] cursor-pointer disabled:opacity-50"
            >
              <FiPlus className="w-4 h-4" />
            </button>
          </div>

          {isCreatingChapter && (
            <form onSubmit={handleCreateChapter} className="flex gap-2">
              <input
                type="text"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                placeholder="Nom du chapitre..."
                className="flex-1 bg-[#0A222F] border border-[#3D4F58] rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#00ED64] text-[#001E2B] px-3 rounded-xl font-bold text-xs cursor-pointer"
              >
                Go
              </button>
            </form>
          )}

          <div className="space-y-2">
            {!selectedCourseId ? (
              <p className="text-xs text-slate-500 text-center py-4">
                Sélectionnez un cours.
              </p>
            ) : chapters.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">
                Aucun chapitre.
              </p>
            ) : (
              chapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapter(ch)}
                  className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer flex justify-between items-center transition-all ${activeChapter?.id === ch.id ? "bg-[#1C364B] border-[#00ED64] text-white shadow-[0_0_15px_rgba(0,237,100,0.15)]" : "bg-[#0A222F]/60 border-[#3D4F58]/30 text-slate-300 hover:border-[#3D4F58]"}`}
                >
                  <span className="text-xs font-bold truncate max-w-[180px]">
                    {ch.title}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-8 bg-[#162C3D]/80 border border-[#3D4F58]/50 rounded-3xl p-6 space-y-6 shadow-xl">
          {!activeChapter ? (
            <div className="py-20 text-center space-y-3">
              <FiCheckSquare className="w-12 h-12 text-[#3D4F58] mx-auto" />
              <p className="text-slate-400 text-sm">
                Sélectionnez un chapitre dans la liste de gauche pour ajouter
                des questions.
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center pb-3 border-b border-[#3D4F58]/40">
                <div>
                  <span className="text-[10px] font-mono text-[#00ED64] uppercase font-bold block">
                    Édition active • {activeChapter.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-[#0A222F] px-3 py-1.5 rounded-xl border border-[#3D4F58]/50">
                  <FiClock className="text-[#00ED64] w-4 h-4" />
                  <span className="text-xs text-slate-300 font-mono">
                    Chrono :
                  </span>
                  <select
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="bg-transparent text-xs font-mono font-bold text-[#00ED64] outline-none cursor-pointer"
                  >
                    <option value={30} className="bg-[#0A222F]">
                      30s
                    </option>
                    <option value={45} className="bg-[#0A222F]">
                      45s
                    </option>
                    <option value={60} className="bg-[#0A222F]">
                      60s
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium block">
                  Énoncé de la question
                </label>
                <textarea
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full bg-[#0A222F] border border-[#3D4F58]/60 rounded-xl p-3.5 text-xs text-white outline-none focus:border-[#00ED64]"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs text-slate-300 font-medium block">
                  Options de réponse (Cochez la bonne réponse)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {options.map((opt, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCorrectIndex(idx)}
                      className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer ${correctIndex === idx ? "bg-[#1C364B] border-[#00ED64]" : "bg-[#0A222F]/60 border-[#3D4F58]/40"}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border ${correctIndex === idx ? "bg-[#00ED64] text-[#001E2B] border-[#00ED64]" : "bg-[#162C3D] text-slate-400 border-[#3D4F58]/50"}`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const n = [...options];
                          n[idx] = e.target.value;
                          setOptions(n);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-transparent text-xs text-white outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <FiHelpCircle className="text-[#00ED64]" /> Explication
                  pédagogique
                </label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full bg-[#0A222F]/80 border border-[#3D4F58]/50 rounded-xl p-3.5 text-xs text-slate-300 outline-none focus:border-[#00ED64]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveQuestion}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-[#00684A] hover:bg-[#00ED64] text-white hover:text-[#001E2B] text-xs font-extrabold flex items-center gap-2 disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4" /> Enregistrer la question
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
