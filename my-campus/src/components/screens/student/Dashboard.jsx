// src/components/screens/student/StudentDashboard.jsx
import React, { useState, useEffect } from "react";
import { FiBookOpen, FiActivity, FiArrowRight, FiFileText, FiAward } from "react-icons/fi";
import TopNav from "../../layout/TopNav";
import BottomNav from "../../layout/BottomNav";
import * as studentService from "../../../services/studentService";

export default function StudentDashboard({ user, activeTab, setActiveTab, onOpenSyllabus, onOpenQuiz }) {
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getStudentDashboard()
      .then(data => {
        setPurchasedCourses(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération de la bibliothèque:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0A222F] text-white flex flex-col justify-between pb-24 md:pb-6 font-sans">
      <TopNav name={user?.full_name} university={user?.university} />

      <main className="flex-1 max-w-md w-full mx-auto px-5 py-6 space-y-6">
        <div>
          <span className="text-[10px] font-mono text-[#00ED64] uppercase tracking-wider block">Mon Espace Académique</span>
          <h1 className="text-xl font-extrabold text-white">Ma Bibliothèque ({purchasedCourses.length})</h1>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#162C3D] border-t-[#00ED64] rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-mono">Chargement de vos syllabus sécurisés...</p>
          </div>
        ) : purchasedCourses.length === 0 ? (
          <div className="bg-[#162C3D]/40 border border-[#3D4F58]/40 p-12 rounded-3xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0A222F] border border-[#3D4F58]/50 flex items-center justify-center mx-auto text-[#00ED64]">
              <FiBookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-slate-200 font-bold text-sm">Votre bibliothèque est vide</h3>
              <p className="text-slate-500 text-xs max-w-xs mx-auto mt-1">Vous n'avez pas encore débloqué de cours. Visitez le Market pour vous inscrire à un cours.</p>
            </div>
            <button
              onClick={() => setActiveTab("explorer")}
              className="px-6 py-3 bg-[#00ED64] hover:bg-[#00c753] text-[#001E2B] font-extrabold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              Découvrir le Market
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {purchasedCourses.map((course) => (
              <div
                key={course.id}
                className="bg-[#162C3D]/80 border border-[#3D4F58]/50 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-400 uppercase bg-[#0A222F] px-2 py-0.5 rounded border border-[#3D4F58]/30">
                      {course.department}
                    </span>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{course.title}</h3>
                    <p className="text-[11px] text-slate-400">{course.professor}</p>
                  </div>

                  {/* Indice R Score */}
                  <div className="bg-[#0A222F] border border-[#3D4F58]/30 rounded-2xl p-2.5 text-center shrink-0">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Indice R</span>
                    <span className="text-base font-mono font-extrabold text-[#00ED64]">
                      {course.readinessScore}%
                    </span>
                  </div>
                </div>

                {/* Readiness Progress Indicator */}
                <div className="space-y-1.5 bg-[#0A222F]/40 p-3 rounded-2xl border border-[#3D4F58]/20">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Niveau de préparation</span>
                    <span className="text-slate-200">{course.readinessScore}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#162C3D] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#00ED64] rounded-full transition-all duration-500"
                      style={{ width: `${course.readinessScore}%` }}
                    />
                  </div>
                </div>

                {/* Sub-Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => onOpenSyllabus(course)}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#0A222F] hover:bg-[#1C364B] border border-[#3D4F58]/40 text-xs font-bold transition-all cursor-pointer"
                  >
                    <FiFileText className="text-[#00ED64] w-4 h-4" />
                    <span>Lire le syllabus</span>
                  </button>

                  <button
                    onClick={() => onOpenQuiz(course)}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#00684A] hover:bg-[#00ED64] hover:text-[#001E2B] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    <FiActivity className="w-4 h-4" />
                    <span>QCM Arena</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}