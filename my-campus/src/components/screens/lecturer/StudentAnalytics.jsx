import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiBookOpen,
  FiChevronRight,
  FiX,
  FiAward,
} from "react-icons/fi";

// Mock student data linked to "Algorithmique II"
const MOCK_STUDENTS = [
  {
    id: "s1",
    name: "Jean-Paul Mbale",
    phone: "084 123 4567",
    uni: "UNIKIN",
    rScore: 88,
    accuracy: 92,
    coverage: 85,
    speed: 82,
    status: "Prêt",
    lastActive: "Aujourd'hui",
  },
  {
    id: "s2",
    name: "Divine Kankolongo",
    phone: "099 812 3456",
    uni: "UNIKIN",
    rScore: 74,
    accuracy: 78,
    coverage: 70,
    speed: 75,
    status: "Prêt",
    lastActive: "Hier",
  },
  {
    id: "s3",
    name: "Christian Lukusa",
    phone: "089 110 2345",
    uni: "UNIKIN",
    rScore: 52,
    accuracy: 55,
    coverage: 50,
    speed: 50,
    status: "Moyen",
    lastActive: "Il y a 3j",
  },
  {
    id: "s4",
    name: "Sarah Kasongo",
    phone: "081 900 1122",
    uni: "UNIKIN",
    rScore: 38,
    accuracy: 40,
    coverage: 35,
    speed: 40,
    status: "En Difficulté",
    lastActive: "Il y a 5j",
  },
  {
    id: "s5",
    name: "Emmanuel Mukendi",
    phone: "082 445 6789",
    uni: "UNIKIN",
    rScore: 91,
    accuracy: 94,
    coverage: 90,
    speed: 88,
    status: "Prêt",
    lastActive: "Aujourd'hui",
  },
  {
    id: "s6",
    name: "Bénédicte Ngalula",
    phone: "085 332 1987",
    uni: "UNIKIN",
    rScore: 45,
    accuracy: 48,
    coverage: 40,
    speed: 48,
    status: "En Difficulté",
    lastActive: "Hier",
  },
];

export default function StudentAnalytics() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Tous");
  const [selectedStudent, setSelectedStudent] = useState(null); // For detailed modal drawer

  // Filter logic
  const filteredStudents = MOCK_STUDENTS.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);
    const matchesStatus =
      selectedStatus === "Tous" || s.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalStudents = MOCK_STUDENTS.length;
  const avgClassR = Math.round(
    MOCK_STUDENTS.reduce((acc, s) => acc + s.rScore, 0) / totalStudents,
  );
  const examReadyCount = MOCK_STUDENTS.filter((s) => s.rScore >= 70).length;
  const strugglingCount = MOCK_STUDENTS.filter(
    (s) => s.status === "En Difficulté",
  ).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FiUsers className="text-[#00ED64]" /> Suivi Pédagogique &
            Analytique des Étudiants
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Surveillez la progression réelle de vos classes. Utilisez ces
            données pour attribuer vos cotes de TP et cibler vos révisions.
          </p>
        </div>

        <div className="bg-[#162C3D] border border-[#3D4F58]/60 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-mono text-slate-300">
          <span>Syllabus actif :</span>
          <strong className="text-[#00ED64]">
            Algorithmique & Structures II
          </strong>
        </div>
      </div>

      {/* 3 CLASS HEALTH KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Class Score */}
        <div className="bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-6 shadow-xl space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase font-bold block">
            Indice R Moyen de la Classe
          </span>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-extrabold font-mono text-white">
              {avgClassR}%
            </h3>
            <span className="text-xs text-[#00ED64] font-mono bg-[#00684A]/30 px-2 py-0.5 rounded border border-[#00ED64]/20 font-bold">
              +5% cette semaine
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Précision globale combinée à la vitesse de réponse
          </p>
        </div>

        {/* Exam Ready Ratio */}
        <div className="bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-6 shadow-xl space-y-2">
          <span className="text-xs font-mono text-[#00ED64] uppercase font-bold block">
            Étudiants Prêts pour l'Examen
          </span>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-extrabold font-mono text-[#00ED64]">
              {examReadyCount}{" "}
              <span className="text-lg text-slate-400 font-sans font-normal">
                / {totalStudents}
              </span>
            </h3>
            <span className="text-xs text-slate-300 font-mono">
              ({Math.round((examReadyCount / totalStudents) * 100)}%)
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Étudiants ayant atteint un score R supérieur à 70%
          </p>
        </div>

        {/* Struggling Alert Card */}
        <div className="bg-gradient-to-br from-[#162C3D] to-rose-950/30 border border-rose-500/30 rounded-3xl p-6 shadow-xl space-y-2">
          <span className="text-xs font-mono text-rose-400 uppercase font-bold flex items-center gap-1.5">
            <FiAlertTriangle /> Attention Requise
          </span>
          <h3 className="text-3xl font-extrabold font-mono text-white">
            {strugglingCount}{" "}
            <span className="text-sm font-sans font-normal text-rose-300">
              Étudiants
            </span>
          </h3>
          <p className="text-[11px] text-rose-200/80">
            Score R inférieur à 50%. Interventions ou TP de rattrapage
            recommandés.
          </p>
        </div>
      </div>

      {/* STRATEGIC BOTTLENECK ALERT BOX */}
      <div className="bg-[#162C3D] border border-amber-500/40 rounded-3xl p-5 flex items-start gap-4 shadow-lg">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5 border border-amber-500/20">
          <FiAlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-amber-300 font-mono uppercase tracking-wider">
              Point de Blocage Pédagogique Détecté par l'Algorithme
            </h4>
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
              Priorité Cours
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>Chapitre 3 : Arbres AVL & Équilibrage</strong> enregistre un
            taux d'échec de <strong>58%</strong> sur les QCM chronométrés. Nous
            vous recommandons de réviser les rotations gauche/droite lors de
            votre prochaine séance en auditoire.
          </p>
        </div>
      </div>

      {/* ROSTER TABLE WITH LIVE SEARCH & FILTERS */}
      <div className="bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-6 shadow-xl space-y-5">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-[#3D4F58]/40">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom ou numéro Mobile Money..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0A222F] border border-[#3D4F58]/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00ED64] transition-all"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <FiFilter className="text-slate-400 w-4 h-4 mr-1 shrink-0" />
            {["Tous", "Prêt", "Moyen", "En Difficulté"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedStatus === status
                    ? "bg-[#00ED64] text-[#001E2B] shadow-sm"
                    : "bg-[#0A222F] text-slate-300 hover:bg-[#1C364B] border border-[#3D4F58]/40"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#3D4F58]/40 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="pb-3 font-semibold">Étudiant Inscrit</th>
                <th className="pb-3 font-semibold">Téléphone Vérifié (DRM)</th>
                <th className="pb-3 font-semibold text-center">
                  Score de Préparation (R)
                </th>
                <th className="pb-3 font-semibold text-center">Statut TP</th>
                <th className="pb-3 font-semibold text-right">
                  Dernière Activité
                </th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3D4F58]/30 text-xs">
              {filteredStudents.map((student) => {
                let badgeStyle =
                  "bg-amber-500/20 text-amber-300 border-amber-500/30";
                if (student.status === "Prêt")
                  badgeStyle =
                    "bg-[#00684A]/40 text-[#00ED64] border-[#00ED64]/30";
                if (student.status === "En Difficulté")
                  badgeStyle =
                    "bg-rose-950/60 text-rose-300 border-rose-500/30";

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-[#0D2633]/50 transition-colors"
                  >
                    <td className="py-4 pr-4">
                      <p className="font-bold text-white leading-snug">
                        {student.name}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {student.uni}
                      </span>
                    </td>
                    <td className="py-4 font-mono text-slate-300">
                      {student.phone}
                    </td>
                    <td className="py-4 px-2 text-center font-mono">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md font-bold ${
                          student.rScore >= 70
                            ? "bg-[#00684A]/30 text-[#00ED64] border border-[#00ED64]/20"
                            : student.rScore >= 50
                              ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {student.rScore}%
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold border ${badgeStyle}`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right text-slate-400 font-mono text-[11px]">
                      {student.lastActive}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="px-3 py-1.5 bg-[#0A222F] hover:bg-[#00ED64] text-slate-300 hover:text-[#001E2B] rounded-xl border border-[#3D4F58]/50 hover:border-[#00ED64] transition-all font-bold text-[11px] cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Détails</span>
                        <FiChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT DETAIL MODAL DRAWER */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#162C3D] border border-[#3D4F58]/60 rounded-3xl p-6 shadow-2xl text-white space-y-6 relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00ED64]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#3D4F58]/40">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#00684A] border border-[#00ED64]/30 flex items-center justify-center font-bold font-mono text-lg text-white">
                    {selectedStudent.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      {selectedStudent.name}
                    </h3>
                    <span className="text-xs font-mono text-[#00ED64]">
                      {selectedStudent.phone} • {selectedStudent.uni}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 rounded-xl bg-[#0A222F] text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Score R Breakdown */}
              <div className="bg-[#0A222F]/80 p-4 rounded-2xl border border-[#3D4F58]/40 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-slate-400 uppercase font-bold">
                    Indice de Préparation (R)
                  </span>
                  <span className="text-xl font-extrabold font-mono text-[#00ED64]">
                    {selectedStudent.rScore}%
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#3D4F58]/30 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Précision QCM (50%)</span>
                    <strong className="text-white">
                      {selectedStudent.accuracy}%
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">
                      Couverture Syllabus (35%)
                    </span>
                    <strong className="text-white">
                      {selectedStudent.coverage}%
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">
                      Efficacité Vitesse (15%)
                    </span>
                    <strong className="text-white">
                      {selectedStudent.speed}%
                    </strong>
                  </div>
                </div>
              </div>

              {/* Professor Action Notes */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold block">
                  Action Pédagogique Recommandée :
                </span>
                <p className="text-xs text-slate-300 bg-[#0A222F]/40 p-3.5 rounded-xl border border-[#3D4F58]/30 leading-relaxed">
                  {selectedStudent.rScore >= 70
                    ? "🎉 Étudiant prêt pour l'examen. Vous pouvez valider sa cote de TP avec mention excellente."
                    : selectedStudent.rScore >= 50
                      ? "⚠️ Progression moyenne. Recommandez à l'étudiant de refaire la série QCM du Chapitre 2."
                      : "🚨 Étudiant en grande difficulté. Une convocation en séance de rattrapage est conseillée avant l'épreuve."}
                </p>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="w-full bg-[#00ED64] hover:bg-[#00c753] text-[#001E2B] font-extrabold py-3.5 rounded-xl text-xs shadow-[0_4px_15px_rgba(0,237,100,0.25)] transition-all cursor-pointer"
              >
                Fermer la fiche étudiant
              </button>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
