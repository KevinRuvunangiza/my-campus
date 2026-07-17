// src/components/screens/lecturer/Dashboard.jsx
import React, { useState } from "react";
import {
  FiBookOpen,
  FiUploadCloud,
  FiDollarSign,
  FiPlus,
  FiLock,
  FiArrowRight,
  FiTrash2,
} from "react-icons/fi";
import * as lecturerService from "../../../services/lecturerService";

export default function LecturerDashboard({
  courses = [],
  isVerified,
  totalSyllabiCount,
  financeMetrics,
  onCreateCourse,
  onTogglePublish,
  onNavigate,
}) {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Sciences Informatiques");
  const [priceUsd, setPriceUsd] = useState("1.25");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    const success = await onCreateCourse({ title, department, priceUsd });
    if (success) {
      setTitle("");
      setPriceUsd("1.25");
    }
    setSubmitting(false);
  };

  // 💥 NEW: Delete Course Handler
  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (
      window.confirm(
        `Voulez-vous vraiment supprimer la matière "${courseTitle}" ? Tous les syllabus et QCM associés seront supprimés.`,
      )
    ) {
      try {
        await lecturerService.deleteCourse(courseId);
        window.location.reload(); // Hard refresh to clear the DB state
      } catch (err) {
        alert("Erreur lors de la suppression: " + err.message);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div
          onClick={() => onNavigate("syllabus")}
          className="bg-[#162C3D]/80 border border-[#3D4F58]/60 hover:border-[#00ED64]/50 p-6 rounded-3xl transition-all cursor-pointer group shadow-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Syllabus PDF
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#00ED64]/10 text-[#00ED64] flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiUploadCloud className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {totalSyllabiCount}{" "}
            <span className="text-sm font-normal text-slate-400">/ 5 max</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>Gérer les fichiers protégés</span>{" "}
            <FiArrowRight className="w-3 h-3 text-[#00ED64]" />
          </p>
        </div>

        <div className="bg-[#162C3D]/80 border border-[#3D4F58]/60 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Matières actives
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FiBookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {courses.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {courses.filter((c) => c.is_published).length} publié(s) sur le
            Market
          </p>
        </div>

        <div
          onClick={() => onNavigate("financials")}
          className="bg-gradient-to-br from-[#162C3D] to-[#0A222F] border border-[#00ED64]/30 hover:border-[#00ED64] p-6 rounded-3xl transition-all cursor-pointer group shadow-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-[#00ED64] uppercase tracking-wider font-bold">
              Revenus (70% Net)
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#00ED64] text-[#001E2B] flex items-center justify-center group-hover:scale-110 transition-transform font-bold">
              <FiDollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#00ED64] font-mono">
            $ {(financeMetrics?.netLecturerShareUsd || 0).toFixed(2)}{" "}
          </div>
          <p className="text-[11px] text-slate-300 mt-2 flex items-center gap-1">
            <span>
              {financeMetrics?.totalSalesCount || 0} vente(s) • Voir retraits
              M-Pesa
            </span>{" "}
            <FiArrowRight className="w-3 h-3 text-[#00ED64]" />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="bg-[#162C3D]/80 border border-[#3D4F58]/60 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-[#3D4F58]/40 pb-4">
            <div className="w-8 h-8 rounded-lg bg-[#00ED64]/20 text-[#00ED64] flex items-center justify-center font-bold">
              <FiPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Créer une matière
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Enregistrement mode brouillon
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Titre du cours
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Algorithmique & Structures"
                className="w-full px-4 py-2.5 bg-[#0A222F] border border-[#3D4F58] rounded-xl text-sm text-white focus:outline-none focus:border-[#00ED64] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Département académique
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0A222F] border border-[#3D4F58] rounded-xl text-sm text-white focus:outline-none focus:border-[#00ED64] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Prix d'accès étudiant (USD $)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.25"
                value={priceUsd}
                onChange={(e) => setPriceUsd(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0A222F] border border-[#3D4F58] rounded-xl text-sm text-white focus:outline-none focus:border-[#00ED64] font-mono transition-colors"
              />
              <span className="text-[10px] text-slate-500 font-mono block mt-1">
                💡 Vous encaissez 70% direct (${
                (Number(priceUsd || 0) * 0.7).toFixed(2)}) via Mobile Money.
              </span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-[#00ED64] hover:bg-[#00c753] disabled:opacity-50 text-[#001E2B] font-extrabold py-3 rounded-xl shadow-[0_4px_15px_rgba(0,237,100,0.2)] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-[#001E2B] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FiPlus className="w-4 h-4" />
                  <span>Enregistrer le cours</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#3D4F58]/40 pb-3">
            <h3 className="font-extrabold text-white text-lg">
              Catalogue de mes matières ({courses.length})
            </h3>
            <span className="text-xs font-mono text-slate-400">
              USCITECH • Semestre Actif
            </span>
          </div>

          {courses.length === 0 ? (
            <div className="bg-[#162C3D]/40 border border-[#3D4F58]/40 p-12 rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0A222F] border border-[#3D4F58] flex items-center justify-center mx-auto text-slate-500">
                <FiBookOpen className="w-6 h-6" />
              </div>
              <p className="text-slate-300 font-bold text-sm">
                Aucun cours dans votre catalogue
              </p>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Utilisez le formulaire ci-contre pour initialiser votre première
                matière.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-[#162C3D]/80 border border-[#3D4F58]/60 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#00ED64] bg-[#00684A]/30 px-2.5 py-0.5 rounded-lg border border-[#00ED64]/20">
                        $ {Number(course.price_usd).toFixed(2)}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${course.is_published ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}
                      >
                        {course.is_published ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>En ligne sur le Market</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>Mode Brouillon</span>
                          </>
                        )}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-base truncate">
                      {course.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                      <span>{course.department}</span>
                      <span>•</span>
                      <span>📄 {course.syllabi?.length || 0} syllabus PDF</span>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#3D4F58]/40">
                    <button
                      onClick={() => onTogglePublish(course)}
                      disabled={!isVerified && !course.is_published}
                      title={
                        !isVerified && !course.is_published
                          ? "Validation académique requise"
                          : ""
                      }
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 border ${course.is_published ? "bg-rose-950/40 text-rose-300 border-rose-500/40 hover:bg-rose-900/60" : "bg-[#00ED64] text-[#001E2B] border-transparent hover:bg-[#00c753] disabled:opacity-40"}`}
                    >
                      {!isVerified && !course.is_published && (
                        <FiLock className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {course.is_published
                          ? "Retirer du Market"
                          : "Publier sur le Market"}
                      </span>
                    </button>
                    {/* 💥 NEW: DELETE COURSE BUTTON */}
                    <button
                      onClick={() =>
                        handleDeleteCourse(course.id, course.title)
                      }
                      className="p-2 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-500/40 hover:bg-rose-900/60 transition-colors cursor-pointer"
                      title="Supprimer la matière définitivement"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
