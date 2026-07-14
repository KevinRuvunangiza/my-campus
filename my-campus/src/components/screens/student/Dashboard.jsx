import { useState, useEffect } from "react";
import TopNav from "../../layout/TopNav";
import BottomNav from "../../layout/BottomNav";
import ReadinessGauge from "../../student/ReadinessGauge";
import CourseCard from "../../student/CourseCard";
import QuickPracticeBanner from "../../student/QuickPracticeBanner";
import Spinner from "../../ui/Spinner";
import { STUDENT_DATA } from "../../../data/mockStudent";

// NOTICE: We now accept activeTab, setActiveTab, and onOpenReader directly as props!
export default function StudentDashboard({ activeTab, setActiveTab, onOpenReader }) {
  const [isLoading, setIsLoading] = useState(true);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStudent(STUDENT_DATA);
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <Spinner text="CHARGEMENT DU PORTAIL..." />;

  return (
    <div className="min-h-screen bg-[#0A222F] text-white flex flex-col justify-between pb-24 md:pb-6 font-sans">
      <TopNav name={student.name} university={student.university} />

      <main className="flex-1 max-w-md w-full mx-auto px-5 py-6 space-y-6">
        
        {/* READINESS GAUGE */}
        <ReadinessGauge 
          score={student.readinessScore} 
          metrics={student.metrics} 
        />

        {/* DAILY STREAK BANNER (Soft Glassmorphic Vibe) */}
        <div className="bg-gradient-to-r from-[#162C3D] to-[#0D2633] border border-[#3D4F58]/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#00ED64]/10 border border-[#00ED64]/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(0,237,100,0.15)]">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">Série de 4 Jours</h4>
                <span className="text-[10px] font-mono bg-[#00684A]/60 text-[#00ED64] px-2 py-0.5 rounded font-bold">Top 15%</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">Plus que 2 TP pour battre votre record hebdomadaire !</p>
            </div>
          </div>
        </div>

        {/* ACTIVE COURSES LIST */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-mono">
              Mes Syllabus Activés
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {student.activeCourses.length} cours
            </span>
          </div>

          <div className="space-y-3">
            {student.activeCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onSelect={() => onOpenReader(course)} 
              />
            ))}
          </div>
        </section>

        <QuickPracticeBanner />
      </main>

      {/* BOTTOM NAV NOW RECEIVES THE REAL PROPS FROM APP.JSX */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}