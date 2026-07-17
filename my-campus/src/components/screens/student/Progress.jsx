// src/components/screens/student/Progress.jsx
import React, { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  FiBarChart2,
  FiTarget,
  FiBookOpen,
  FiClock,
  FiPlay,
  FiAlertTriangle,
  FiCompass,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import TopNav from "../../layout/TopNav";
import BottomNav from "../../layout/BottomNav";
import * as studentService from "../../../services/studentService";

export default function Progress({
  user,
  activeTab,
  setActiveTab,
  onOpenArena,
}) {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    studentService.getStudentDashboard().then((data) => {
      setCourses(data || []);
      if (data && data.length > 0) {
        setSelectedCourseId(data[0].id);
      }
      setLoading(false);
    });
  }, []);

  const course = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="min-h-screen bg-[#0A222F] text-white flex flex-col justify-between pb-24 md:pb-6 font-sans">
      <TopNav
        name={user?.full_name}
        university={user?.university || "USCITECH"}
      />

      <main className="flex-1 max-w-md w-full mx-auto px-5 py-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <FiBarChart2 className="text-[#00ED64]" /> Mes Statistiques (R)
            </h1>
          </div>

          {/* HORIZONTAL SWITCHER */}
          {courses.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {courses.map((c) => {
                const isSelected = c.id === selectedCourseId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCourseId(c.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-medium shrink-0 transition-all cursor-pointer border flex flex-col text-left ${
                      isSelected
                        ? "bg-[#1C364B] border-[#00ED64] text-white shadow-md"
                        : "bg-[#162C3D]/60 border-[#3D4F58]/30 text-slate-400"
                    }`}
                  >
                    <span className="font-bold line-clamp-1 max-w-[140px]">
                      {c.department}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-[#00ED64] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-[#162C3D] border border-[#3D4F58]/40 rounded-3xl p-8 text-center space-y-4 shadow-xl">
            <FiBarChart2 className="w-12 h-12 text-[#3D4F58] mx-auto" />
            <h2 className="text-base font-bold text-white">
              Aucune donnée d'entraînement
            </h2>
            <p className="text-xs text-slate-400">
              Vos statistiques d'apprentissage apparaîtront ici dès que vous
              aurez débloqué et pratiqué sur un syllabus.
            </p>
            <button
              onClick={() => {
                setActiveTab("explore");
                navigate("/student/explore");
              }}
              className="mt-4 px-6 py-2.5 bg-[#00ED64] text-[#001E2B] font-bold rounded-xl"
            >
              Aller au catalogue
            </button>
          </div>
        ) : course ? (
          <AnimatePresence mode="wait">
            <m.div
              key={course.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* MASTER SCORE CARD */}
              <section className="bg-gradient-to-br from-[#162C3D] to-[#0D2633] border border-[#3D4F58]/50 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
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
                      {course.readinessScore || 0}%
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5 pt-4 border-t border-[#3D4F58]/40 relative z-10">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <FiTarget className="text-[#00ED64]" /> Précision (50%)
                    </span>
                    <span className="text-[#00ED64] font-bold">
                      {course.metrics?.accuracy || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <FiBookOpen className="text-[#00ED64]" /> Couverture (35%)
                    </span>
                    <span className="text-[#00ED64] font-bold">
                      {course.metrics?.coverage || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <FiClock className="text-[#00ED64]" /> Vitesse (15%)
                    </span>
                    <span className="text-[#00ED64] font-bold">
                      {course.metrics?.speedEfficiency || 0}%
                    </span>
                  </div>
                </div>
              </section>

              {/* LISTE DES CHAPITRES */}
              <section className="space-y-3">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 pl-1">
                  Chapitres Disponibles ({course.chapters?.length || 0})
                </h3>
                <div className="space-y-2.5">
                  {course.chapters?.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">
                      Aucun QCM créé par le professeur.
                    </p>
                  ) : (
                    course.chapters?.map((ch) => (
                      <div
                        key={ch.id}
                        className="bg-[#162C3D]/90 border border-[#3D4F58]/40 rounded-2xl p-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-white leading-snug">
                            {ch.title}
                          </h4>
                        </div>
                        <button
                          onClick={() => onOpenArena(course)}
                          className="p-3 rounded-xl bg-[#0A222F] hover:bg-[#00ED64] text-slate-300 hover:text-[#001E2B] border border-[#3D4F58]/50 hover:border-[#00ED64] transition-all cursor-pointer shadow-sm"
                        >
                          <FiPlay className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <button
                onClick={() => onOpenArena(course)}
                disabled={course.chapters?.length === 0}
                className="w-full bg-[#00ED64] hover:bg-[#00c753] disabled:opacity-40 text-[#001E2B] font-extrabold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
              >
                <FiPlay className="fill-current w-4 h-4" /> Lancer une arène QCM
              </button>
            </m.div>
          </AnimatePresence>
        ) : null}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
