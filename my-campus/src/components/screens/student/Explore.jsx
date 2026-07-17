// src/components/screens/student/Explore.jsx
import React, { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { FiSearch, FiFilter, FiBookOpen, FiShield } from "react-icons/fi";
import TopNav from "../../layout/TopNav";
import BottomNav from "../../layout/BottomNav";
import * as studentService from "../../../services/studentService";

export default function Explore({
  user,
  activeTab,
  setActiveTab,
  onSelectCourse,
}) {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("Tous");

  useEffect(() => {
    studentService.getMarketCatalog().then((data) => {
      setCatalog(data);
      setLoading(false);
    });
  }, []);

  const departments = ["Tous", ...new Set(catalog.map((c) => c.department))];

  const filteredCourses = catalog.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.professor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept =
      selectedDept === "Tous" || course.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="min-h-screen bg-[#0A222F] text-white flex flex-col justify-between pb-24 md:pb-6 font-sans">
      <TopNav name={user?.full_name} university={user?.university} />

      <main className="flex-1 max-w-md w-full mx-auto px-5 py-6 space-y-6">
        <div className="space-y-3">
          <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center justify-between">
            <span>Catalogue des Syllabus</span>
            <span className="text-xs font-mono font-normal text-[#00ED64] bg-[#001E2B] px-2.5 py-1 rounded-full border border-[#00ED64]/20">
              {filteredCourses.length} disponibles
            </span>
          </h1>
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Chercher un cours, un professeur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#162C3D] border border-[#3D4F58]/40 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#00ED64]/50 focus:ring-2 focus:ring-[#00ED64]/10 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <FiFilter className="text-slate-400 w-4 h-4 shrink-0 mr-1" />
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-4 py-2 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${
                selectedDept === dept
                  ? "bg-[#00ED64] text-[#001E2B] font-bold shadow-[0_4px_15px_rgba(0,237,100,0.2)]"
                  : "bg-[#162C3D] text-slate-300 hover:bg-[#1C364B] border border-[#3D4F58]/30"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#00ED64] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <AnimatePresence mode="popLayout">
              {filteredCourses.map((course) => (
                <m.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -2 }}
                  onClick={() => onSelectCourse(course)}
                  className="bg-[#162C3D] hover:bg-[#1A3347] border border-[#3D4F58]/40 rounded-2xl p-5 transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.15)] relative overflow-hidden group"
                >
                  <div className="absolute -right-10 -top-10 w-28 h-28 bg-[#00ED64]/5 rounded-full blur-2xl group-hover:bg-[#00ED64]/10 transition-all" />
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#00ED64] block mb-1">
                        {course.university} • {course.department}
                      </span>
                      <h3 className="text-sm font-bold text-white leading-snug group-hover:text-[#00ED64] transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        {course.professor}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-300 bg-[#0A222F] px-2 py-1 rounded-md border border-[#3D4F58]/50 shrink-0">
                      <FiShield className="w-3 h-3 text-[#00ED64]" /> DRM
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3.5 border-t border-[#3D4F58]/30 mt-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <FiBookOpen className="text-[#00ED64] w-3.5 h-3.5" />
                      <span>{course.chaptersCount} Chapitres</span>
                    </div>
                    {course.isUnlocked ? (
                      <span className="bg-[#00684A]/40 text-[#00ED64] border border-[#00ED64]/30 text-xs font-bold px-3.5 py-1.5 rounded-full">
                        Débloqué
                      </span>
                    ) : (
                      <span className="bg-[#00ED64] text-[#001E2B] font-extrabold text-xs px-4 py-1.5 rounded-full shadow-sm group-hover:scale-105 transition-transform">
                        {course.price_fc.toLocaleString()} FC
                      </span>
                    )}
                  </div>
                </m.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
