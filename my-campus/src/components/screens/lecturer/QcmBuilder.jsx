import { useState } from "react";
import { m } from "framer-motion";
import {
  FiCheckSquare,
  FiPlus,
  FiTrash2,
  FiClock,
  FiCheckCircle,
  FiHelpCircle,
  FiSave,
  FiList,
} from "react-icons/fi";

const MOCK_CHAPTERS = [
  { id: "ch1", title: "Ch. 1 : Récursivité & Complexité", questionsCount: 5 },
  {
    id: "ch2",
    title: "Ch. 2 : Arbres Binaires de Recherche",
    questionsCount: 12,
  },
  { id: "ch3", title: "Ch. 3 : Arbres AVL & Équilibrage", questionsCount: 8 },
];

export default function QcmBuilder() {
  const [activeChapter, setActiveChapter] = useState(MOCK_CHAPTERS[1]);
  const [questionText, setQuestionText] = useState(
    "Quelle est la complexité temporelle pire cas pour une recherche dans un ABR non équilibré ?",
  );
  const [options, setOptions] = useState([
    "O(log n)",
    "O(n)",
    "O(n log n)",
    "O(1)",
  ]);
  const [correctIndex, setCorrectIndex] = useState(1);
  const [timeLimit, setTimeLimit] = useState(60); // Paramètre T_limit pour l'algorithme R
  const [explanation, setExplanation] = useState(
    "Dans le pire des cas (arbre dégénéré sous forme de liste chaînée), il faut parcourir tous les 'n' nœuds de l'arbre.",
  );

  const handleOptionChange = (index, value) => {
    const newOpts = [...options];
    newOpts[index] = value;
    setOptions(newOpts);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* EN-TÊTE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FiCheckSquare className="text-[#00ED64]" /> Banque de Questions QCM
            & TP
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Construisez vos quiz chronométrés. Chaque question alimente
            directement l'Indice de Préparation (R) des étudiants.
          </p>
        </div>

        <button className="bg-[#00ED64] hover:bg-[#00c753] text-[#001E2B] font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-[0_4px_15px_rgba(0,237,100,0.25)] transition-all flex items-center gap-2 cursor-pointer">
          <FiSave className="w-4 h-4" /> Enregistrer la série dans Supabase
        </button>
      </div>

      {/* ÉCRAN SCINDÉ : CHAPITRES À GAUCHE (4 SPANS), ÉDITEUR À DROITE (8 SPANS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* GAUCHE : SÉLECTEUR DE CHAPITRES */}
        <div className="lg:col-span-4 bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center pb-3 border-b border-[#3D4F58]/40">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FiList className="text-[#00ED64]" /> Chapitres du Syllabus
            </h3>
            <button
              className="p-1.5 rounded-lg bg-[#0A222F] text-[#00ED64] hover:bg-[#00ED64] hover:text-[#001E2B] transition-colors cursor-pointer"
              title="Ajouter un chapitre"
            >
              <FiPlus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {MOCK_CHAPTERS.map((ch) => {
              const isSelected = activeChapter.id === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapter(ch)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex justify-between items-center ${
                    isSelected
                      ? "bg-[#1C364B] border-[#00ED64] text-white shadow-[0_0_15px_rgba(0,237,100,0.15)]"
                      : "bg-[#0A222F]/60 border-[#3D4F58]/30 text-slate-300 hover:border-[#3D4F58]"
                  }`}
                >
                  <span className="text-xs font-bold truncate max-w-[180px]">
                    {ch.title}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isSelected
                        ? "bg-[#00ED64] text-[#001E2B] font-extrabold"
                        : "bg-[#162C3D] text-slate-400 border-[#3D4F58]/40"
                    }`}
                  >
                    {ch.questionsCount} Qs
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DROITE : ÉDITEUR DE QUESTION INTERACTIF */}
        <div className="lg:col-span-8 bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex justify-between items-center pb-3 border-b border-[#3D4F58]/40">
            <div>
              <span className="text-[10px] font-mono text-[#00ED64] uppercase tracking-wider block font-bold">
                Édition active • {activeChapter.title}
              </span>
              <h3 className="text-sm font-bold text-white">
                Créer une Nouvelle Question
              </h3>
            </div>

            {/* Sélecteur de Limite de Temps (T_limit) */}
            <div className="flex items-center gap-2 bg-[#0A222F] px-3 py-1.5 rounded-xl border border-[#3D4F58]/50">
              <FiClock className="text-[#00ED64] w-4 h-4" />
              <span className="text-xs text-slate-300 font-mono">Chrono :</span>
              <select
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="bg-transparent text-xs font-mono font-bold text-[#00ED64] focus:outline-none cursor-pointer"
              >
                <option value={30} className="bg-[#0A222F]">
                  30 sec
                </option>
                <option value={45} className="bg-[#0A222F]">
                  45 sec
                </option>
                <option value={60} className="bg-[#0A222F]">
                  60 sec
                </option>
                <option value={90} className="bg-[#0A222F]">
                  90 sec
                </option>
              </select>
            </div>
          </div>

          {/* Énoncé de la question */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium block">
              Énoncé de la question (Supporte le code et le texte technique)
            </label>
            <textarea
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full bg-[#0A222F] border border-[#3D4F58]/60 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-[#00ED64] font-sans"
              placeholder="Ex : Quelle est la structure de données la plus adaptée pour..."
            />
          </div>

          {/* Constructeur des 4 options (A, B, C, D) */}
          <div className="space-y-3">
            <label className="text-xs text-slate-300 font-medium block">
              Options de réponse (Cochez la bonne réponse)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((opt, idx) => {
                const isCorrect = correctIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setCorrectIndex(idx)}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                      isCorrect
                        ? "bg-[#1C364B] border-[#00ED64] shadow-[0_0_15px_rgba(0,237,100,0.15)]"
                        : "bg-[#0A222F]/60 border-[#3D4F58]/40 hover:border-[#3D4F58]"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg font-mono text-xs flex items-center justify-center shrink-0 border ${
                        isCorrect
                          ? "bg-[#00ED64] text-[#001E2B] font-extrabold border-[#00ED64]"
                          : "bg-[#162C3D] text-slate-400 border-[#3D4F58]/50"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-transparent text-xs text-white focus:outline-none font-medium"
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    />
                    {isCorrect && (
                      <FiCheckCircle className="text-[#00ED64] w-4 h-4 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Boîte d'explication pédagogique */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <FiHelpCircle className="text-[#00ED64]" /> Explication
              pédagogique (Affichée à l'étudiant après validation)
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full bg-[#0A222F]/80 border border-[#3D4F58]/50 rounded-xl p-3.5 text-xs text-slate-300 focus:outline-none focus:border-[#00ED64]"
              placeholder="Expliquez pourquoi cette réponse est correcte..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button className="px-4 py-2.5 rounded-xl bg-[#0A222F] text-slate-400 hover:text-rose-400 border border-[#3D4F58]/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5">
              <FiTrash2 className="w-4 h-4" /> Effacer
            </button>
            <button className="px-6 py-2.5 rounded-xl bg-[#00684A] hover:bg-[#00ED64] text-white hover:text-[#001E2B] border border-[#00ED64]/40 text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2">
              <FiPlus className="w-4 h-4" /> Ajouter cette question au chapitre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
