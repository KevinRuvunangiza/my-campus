// src/components/screens/lecturer/SyllabusManager.jsx
import React, { useState } from "react";
import {
  FiUploadCloud,
  FiTrash2,
  FiAlertTriangle,
  FiFileText,
  FiCheckCircle,
  FiHelpCircle,
  FiShield,
} from "react-icons/fi";

export default function SyllabusManager({
  courses = [],
  totalSyllabiCount = 0,
  isCapReached = false,
  onUploadSyllabus,
  onDeleteSyllabus,
}) {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleFileChange = (e) => {
    setLocalError(null);
    const selected = e.target.files[0];
    if (!selected) return;

    // 💥 10 MB FRONTEND GUARD: Prevents wasting Kinshasa 3G/4G bandwidth
    const MAX_BYTES = 10 * 1024 * 1024;
    if (selected.size > MAX_BYTES) {
      const sizeMb = (selected.size / (1024 * 1024)).toFixed(1);
      setLocalError(
        `Fichier trop volumineux (${sizeMb} Mo). La taille limite pour un syllabus est de 10 Mo.`,
      );
      e.target.value = null; // Clear input
      setFile(null);
      return;
    }

    if (selected.type !== "application/pdf") {
      setLocalError(
        "Format invalide. Seuls les fichiers au format PDF (.pdf) sont acceptés.",
      );
      e.target.value = null;
      setFile(null);
      return;
    }

    setFile(selected);
    if (!customTitle) {
      setCustomTitle(selected.name.replace(/\.pdf$/i, ""));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !selectedCourseId) {
      setLocalError("Veuillez sélectionner un cours et un fichier PDF valide.");
      return;
    }

    setUploading(true);
    setLocalError(null);

    const success = await onUploadSyllabus(file, selectedCourseId, customTitle);
    if (success) {
      setFile(null);
      setCustomTitle("");
      // Reset file input element
      const fileInput = document.getElementById("syllabus-file-input");
      if (fileInput) fileInput.value = null;
    }
    setUploading(false);
  };

  return (
    <div className="space-y-8">
      {/* ALLOCATION CAP BANNER */}
      <div
        className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl ${
          isCapReached
            ? "bg-rose-950/60 border-rose-500/60 text-rose-200"
            : "bg-[#162C3D]/80 border-[#3D4F58]/60 text-slate-200"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl font-bold font-mono ${
              isCapReached
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "bg-[#00ED64]/10 text-[#00ED64] border border-[#00ED64]/20"
            }`}
          >
            {totalSyllabiCount}/5
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base">
                Quota d'hébergement Syllabus
              </h3>
              {isCapReached && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500 font-bold text-white">
                  Plafond Atteint
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isCapReached
                ? "Vous avez atteint votre allocation standard de 5 syllabus. Supprimez un ancien document pour libérer de l'espace."
                : `Vous pouvez encore héberger ${5 - totalSyllabiCount} syllabus PDF protégés pour ce semestre académique.`}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto text-right font-mono text-xs bg-[#0A222F] px-4 py-2.5 rounded-xl border border-[#3D4F58]/40">
          <span>DRM Canvas : </span>
          <strong className="text-[#00ED64]">Actif sur 100%</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* PDF UPLOADER FORM */}
        <div className="bg-[#162C3D]/80 border border-[#3D4F58]/60 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-[#3D4F58]/40 pb-4">
            <div className="w-8 h-8 rounded-lg bg-[#00ED64]/20 text-[#00ED64] flex items-center justify-center font-bold">
              <FiUploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Uploader un Syllabus
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Chiffrement & Filigrane automatique
              </p>
            </div>
          </div>

          {localError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
              <FiAlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{localError}</span>
            </div>
          )}

          {isCapReached ? (
            <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs text-center space-y-2">
              <FiAlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
              <strong className="font-bold block text-white">
                Upload temporairement désactivé
              </strong>
              <p>
                Votre quota de 5 syllabus est plein. Veuillez supprimer un
                document existant dans la liste ci-contre pour activer l'envoi.
              </p>
            </div>
          ) : courses.length === 0 ? (
            <div className="p-5 rounded-2xl bg-[#0A222F] border border-[#3D4F58]/40 text-slate-400 text-xs text-center space-y-2">
              <FiHelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <strong className="font-bold block text-white">
                Aucun cours disponible
              </strong>
              <p>
                Vous devez d'abord créer une matière dans l'onglet "Mes Cours"
                avant de pouvoir lui joindre un fichier PDF.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Rattacher au cours :
                </label>
                <select
                  required
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0A222F] border border-[#3D4F58] rounded-xl text-sm text-white focus:outline-none focus:border-[#00ED64] transition-colors cursor-pointer"
                >
                  <option value="" disabled>
                    Sélectionnez une matière...
                  </option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Titre affiché du document :
                </label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Ex: Syllabus Chapitres 1 à 4"
                  className="w-full px-4 py-2.5 bg-[#0A222F] border border-[#3D4F58] rounded-xl text-sm text-white focus:outline-none focus:border-[#00ED64] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Fichier PDF (10 Mo Max) :
                </label>
                <input
                  id="syllabus-file-input"
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-[#00ED64] file:text-[#001E2B] hover:file:bg-[#00c753] file:cursor-pointer bg-[#0A222F] border border-[#3D4F58] rounded-xl cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 font-mono mt-1.5 flex items-center gap-1">
                  <FiShield className="text-[#00ED64]" />{" "}
                  <span>Incrustation DRM filigrane nominative à la volée.</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={uploading || !file || !selectedCourseId}
                className="w-full mt-2 bg-[#00ED64] hover:bg-[#00c753] disabled:opacity-50 text-[#001E2B] font-extrabold py-3 rounded-xl shadow-[0_4px_15px_rgba(0,237,100,0.2)] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#001E2B] border-t-transparent rounded-full animate-spin" />
                    <span>Chiffrement et envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <FiUploadCloud className="w-4 h-4" />
                    <span>Uploader dans le Bucket Privé</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* HOSTED SYLLABI LISTING */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#3D4F58]/40 pb-3">
            <h3 className="font-extrabold text-white text-lg">
              Documents actifs dans le cloud ({totalSyllabiCount})
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Supabase Storage • course-syllabi
            </span>
          </div>

          {totalSyllabiCount === 0 ? (
            <div className="bg-[#162C3D]/40 border border-[#3D4F58]/40 p-12 rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0A222F] border border-[#3D4F58] flex items-center justify-center mx-auto text-slate-500">
                <FiFileText className="w-6 h-6" />
              </div>
              <p className="text-slate-300 font-bold text-sm">
                Aucun syllabus hébergé
              </p>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Vos syllabus uploadés apparaîtront ici. Ils seront
                automatiquement synchronisés avec le lecteur offline PWA de vos
                étudiants inscrits.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) =>
                course.syllabi?.map((syl) => (
                  <div
                    key={syl.id}
                    className="bg-[#162C3D]/80 border border-[#3D4F58]/60 hover:border-[#3D4F58] p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-md"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-xl bg-[#00ED64]/10 border border-[#00ED64]/30 flex flex-col items-center justify-center text-[#00ED64] shrink-0 font-mono">
                        <FiFileText className="w-4 h-4" />
                        <span className="text-[9px] font-bold mt-0.5">PDF</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-white text-sm truncate">
                            {syl.title}
                          </h5>
                          <span className="text-[10px] font-mono bg-[#0A222F] px-2 py-0.5 rounded text-slate-300 border border-[#3D4F58]/50">
                            {syl.file_size_mb || "1.0"} Mo
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          Matière :{" "}
                          <strong className="text-slate-300">
                            {course.title}
                          </strong>
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#00ED64] mt-1">
                          <FiCheckCircle className="w-3 h-3 shrink-0" />
                          <span>
                            URL Signée 60s active • Protection Canvas DRM
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#3D4F58]/40">
                      <button
                        onClick={() =>
                          onDeleteSyllabus(syl.id, syl.storage_file_path)
                        }
                        className="w-full sm:w-auto px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 hover:border-rose-500/60 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                        title="Supprimer définitivement ce fichier"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                )),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
