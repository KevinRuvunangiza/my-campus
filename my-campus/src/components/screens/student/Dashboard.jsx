// src/components/screens/student/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiBookOpen, FiArrowRight, FiCompass } from "react-icons/fi";
import TopNav from "../../layout/TopNav";
import BottomNav from "../../layout/BottomNav";
import ReadinessGauge from "../../student/ReadinessGauge";
import CourseCard from "../../student/CourseCard";
import QuickPracticeBanner from "../../student/QuickPracticeBanner";
import * as studentService from "../../../services/studentService";

export default function StudentDashboard({
  user,
  activeTab,
  setActiveTab,
  onOpenReader,
  onOpenArena,
}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    studentService
      .getStudentDashboard()
      .then((data) => {
        setCourses(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur Dashboard Étudiant:", err);
        setLoading(false);
      });
  }, []);

  // Calcul de la moyenne globale de l'Indice R
  const totalScore = courses.reduce(
    (acc, c) => acc + (c.readinessScore || 0),
    0,
  );
  const avgScore =
    courses.length > 0 ? Math.round(totalScore / courses.length) : 0;

  const aggregateMetrics = {
    accuracy:
      courses.length > 0
        ? Math.round(
            courses.reduce((acc, c) => acc + (c.metrics?.accuracy || 0), 0) /
              courses.length,
          )
        : 0,
    coverage:
      courses.length > 0
        ? Math.round(
            courses.reduce((acc, c) => acc + (c.metrics?.coverage || 0), 0) /
              courses.length,
          )
        : 0,
    speedEfficiency:
      courses.length > 0
        ? Math.round(
            courses.reduce(
              (acc, c) => acc + (c.metrics?.speedEfficiency || 0),
              0,
            ) / courses.length,
          )
        : 0,
  };

  return (
    <div className="min-h-screen bg-[#0A222F] text-white flex flex-col justify-between pb-24 md:pb-6 font-sans">
      <TopNav
        name={user?.full_name}
        university={user?.university || "USCITECH"}
      />

      <main className="flex-1 max-w-md w-full mx-auto px-5 py-6 space-y-6">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-[#00ED64] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          // 💥 LE "ZERO STATE" POUR LES NOUVEAUX ÉTUDIANTS
          <div className="bg-[#162C3D] border border-[#3D4F58]/40 rounded-3xl p-8 text-center space-y-4 shadow-xl mt-4">
            <div className="w-16 h-16 bg-[#00ED64]/10 text-[#00ED64] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#00ED64]/20">
              <FiCompass className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Bienvenue sur My Campus
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Votre tableau de bord est vide. Vous n'avez pas encore débloqué de
              syllabus pour ce semestre.
            </p>
            <button
              onClick={() => {
                setActiveTab("explore");
                navigate("/student/explore");
              }}
              className="w-full bg-[#00ED64] text-[#001E2B] font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg mt-2 transition-transform active:scale-95"
            >
              Parcourir le catalogue <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          // 💥 L'ÉTAT ACTIF POUR LES ÉTUDIANTS AVEC DES COURS
          <>
            <ReadinessGauge score={avgScore} metrics={aggregateMetrics} />

            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-mono">
                  Mes Syllabus Activés
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  {courses.length} cours
                </span>
              </div>
              <div className="space-y-3">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={{
                      ...course,
                      chaptersCompleted: 0, // Sera dynamisé par les tentatives
                      totalChapters: course.chapters?.length || 0,
                    }}
                    onSelect={() => onOpenReader(course)}
                  />
                ))}
              </div>
            </section>

            <QuickPracticeBanner />
          </>
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
