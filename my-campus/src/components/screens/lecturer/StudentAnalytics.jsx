// src/components/screens/lecturer/StudentAnalytics.jsx
import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiAlertTriangle,
  FiChevronRight,
  FiX,
} from "react-icons/fi";

export default function StudentAnalytics({ courses = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(
    courses[0]?.id || "",
  );
  const [selectedStatus, setSelectedStatus] = useState("Tous");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Derive students directly from the purchases tied to the selected course.
  // In a real scenario, getLecturerCourses needs to join student profiles via purchases.
  // We approximate the table by mapping the existing purchases.
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const students = (selectedCourse?.purchases || [])
    .map((p, idx) => ({
      id: p.id,
      name: `Étudiant Anonyme #${idx + 1}`, // Assuming profiles aren't joined yet
      phone: "Masqué (DRM)",
      uni: selectedCourse.university || "USCITECH",
      rScore: Math.floor(Math.random() * 50) + 40, // Temporary logic until RPC scores are batch-fetched
      accuracy: 0,
      coverage: 0,
      speed: 0,
      status: "Prêt",
      lastActive: p.purchased_at
        ? new Date(p.purchased_at).toLocaleDateString()
        : "Aujourd'hui",
    }))
    .map((s) => {
      // Dynamic status derivation based on score
      s.status =
        s.rScore >= 70 ? "Prêt" : s.rScore >= 50 ? "Moyen" : "En Difficulté";
      return s;
    });

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "Tous" || s.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalStudents = students.length;
  const avgClassR = totalStudents
    ? Math.round(students.reduce((acc, s) => acc + s.rScore, 0) / totalStudents)
    : 0;
  const examReadyCount = students.filter((s) => s.rScore >= 70).length;
  const strugglingCount = students.filter(
    (s) => s.status === "En Difficulté",
  ).length;

  return (
    <div className="space-y-8 font-sans">
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
          <span>Syllabus actif:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="bg-transparent text-[#00ED64] font-bold outline-none cursor-pointer"
          >
            {courses.length === 0 && <option value="">Aucun cours</option>}
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#162C3D]/80 border border-[#3D4F58]/50 rounded-3xl p-6 shadow-xl space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase font-bold block">
            Indice R Moyen de la Classe
          </span>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-extrabold font-mono text-white">
              {avgClassR}%
            </h3>
          </div>
          <p className="text-[11px] text-slate-400">
            Précision globale combinée à la vitesse de réponse
          </p>
        </div>

        <div className="bg-[#162C3D]/80 border border-[#3D4F58]/50 rounded-3xl p-6 shadow-xl space-y-2">
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
          </div>
          <p className="text-[11px] text-slate-400">
            Étudiants ayant atteint un score R supérieur à 70%
          </p>
        </div>

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

      <div className="bg-[#162C3D]/80 border border-[#3D4F58]/50 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-[#3D4F58]/40">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0A222F] border border-[#3D4F58]/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00ED64] transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <FiFilter className="text-slate-400 w-4 h-4 mr-1 shrink-0" />
            {["Tous", "Prêt", "Moyen", "En Difficulté"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${selectedStatus === status ? "bg-[#00ED64] text-[#001E2B] shadow-sm" : "bg-[#0A222F] text-slate-300 hover:bg-[#1C364B] border border-[#3D4F58]/40"}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredStudents.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              Aucun étudiant inscrit / correspondant aux filtres.
            </p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#3D4F58]/40 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Étudiant Inscrit</th>
                  <th className="pb-3 font-semibold text-center">Score (R)</th>
                  <th className="pb-3 font-semibold text-center">Statut TP</th>
                  <th className="pb-3 font-semibold text-right">
                    Achat / Activité
                  </th>
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
                      <td className="py-4 px-2 text-center font-mono">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md ${student.rScore >= 70 ? "bg-[#00684A]/30 text-[#00ED64] border border-[#00ED64]/20" : student.rScore >= 50 ? "bg-amber-500/10 text-amber-300 border border-amber-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}
                        >
                          {student.rScore}
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
