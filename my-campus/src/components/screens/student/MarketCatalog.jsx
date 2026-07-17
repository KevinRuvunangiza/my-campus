// src/components/screens/student/MarketCatalog.jsx
import React, { useState, useEffect } from "react";
import {
  FiBookOpen,
  FiSearch,
  FiAward,
  FiArrowRight,
  FiLock,
  FiUnlock,
  FiRefreshCw,
} from "react-icons/fi";
import TopNav from "../../layout/TopNav";
import BottomNav from "../../layout/BottomNav";
import PaymentModal from "./PaymentModal";
import * as studentService from "../../../services/studentService";

export default function MarketCatalog({ user, activeTab, setActiveTab }) {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("Tous");
  const [loading, setLoading] = useState(true);
  const [exchangeRate, setExchangeRate] = useState(2850);
  const [checkoutCourse, setCheckoutCourse] = useState(null);

  // Fetch courses and live exchange rate
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [catalogData, forexRes] = await Promise.all([
          studentService.getMarketCatalog(),
          fetch("https://open.er-api.com/v6/latest/USD")
            .then((res) => res.json())
            .catch(() => ({ rates: { CDF: 2850 } })),
        ]);

        if (isMounted) {
          setCourses(catalogData || []);
          setExchangeRate(forexRes?.rates?.CDF || 2850);
        }
      } catch (err) {
        console.error("Erreur lors du chargement du catalogue:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePaymentSuccess = (courseId) => {
    // Update local state to show the course as unlocked instantly
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, isUnlocked: true } : c)),
    );
    setCheckoutCourse(null);
  };

  // Filter unique departments for the tab system
  const departments = ["Tous", ...new Set(courses.map((c) => c.department))];

  // Filter courses by search and department
  const filteredCourses = courses.filter((course) => {
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
        {/* Search and Header */}
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-mono text-[#00ED64] uppercase tracking-wider block">
              Syllabus Originaux & Officiels
            </span>
            <h1 className="text-xl font-extrabold text-white">
              Le Market USCITECH
            </h1>
          </div>

          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une matière, un prof..."
              className="w-full bg-[#162C3D] border border-[#3D4F58]/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#00ED64] transition-colors"
            />
          </div>
        </div>

        {/* Department Quick Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                selectedDept === dept
                  ? "bg-[#00ED64] text-[#001E2B] border-transparent shadow-md"
                  : "bg-[#162C3D]/50 text-slate-300 border-[#3D4F58]/30 hover:border-slate-500"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-[#162C3D] border-t-[#00ED64] rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-mono">
                Synchronisation du catalogue en direct...
              </p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-[#162C3D]/30 border border-[#3D4F58]/30 rounded-3xl p-10 text-center space-y-3">
              <FiBookOpen className="w-10 h-10 text-slate-500 mx-auto animate-pulse" />
              <h3 className="text-sm font-bold text-slate-300">
                Aucun cours trouvé
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Essayez d'ajuster vos filtres ou de modifier votre recherche.
              </p>
            </div>
          ) : (
            filteredCourses.map((course) => {
              const estimatedCdf = Math.ceil(course.price_usd * exchangeRate);
              return (
                <div
                  key={course.id}
                  className="bg-[#162C3D]/80 border border-[#3D4F58]/50 rounded-3xl p-5 space-y-4 shadow-xl hover:border-[#3D4F58] transition-all relative overflow-hidden group"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 max-w-[70%]">
                      <span className="text-[9px] font-mono text-slate-400 uppercase bg-[#0A222F] px-2 py-0.5 rounded border border-[#3D4F58]/30">
                        {course.department}
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-[#00ED64] transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <FiAward className="text-[#00ED64] shrink-0" />{" "}
                        {course.professor}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-mono font-extrabold text-[#00ED64] block">
                        $ {Number(course.price_usd).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold block mt-0.5">
                        ~ {estimatedCdf.toLocaleString()} FC
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#3D4F58]/30 text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>📄 {course.syllabiCount} Syllabus</span>
                      <span>•</span>
                      <span>⚔️ {course.chaptersCount} Modules</span>
                    </div>

                    {course.isUnlocked ? (
                      <button
                        onClick={() => setActiveTab("library")}
                        className="text-[#00ED64] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <FiUnlock className="w-3.5 h-3.5" />{" "}
                        <span>Étudier</span> <FiArrowRight />
                      </button>
                    ) : (
                      <button
                        onClick={() => setCheckoutCourse(course)}
                        className="bg-[#00684A] hover:bg-[#00ED64] hover:text-[#001E2B] text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <FiLock className="w-3.5 h-3.5" />{" "}
                        <span>Débloquer</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Slide-out Checkout Modal */}
      {checkoutCourse && (
        <PaymentModal
          course={checkoutCourse}
          user={user}
          onClose={() => setCheckoutCourse(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
