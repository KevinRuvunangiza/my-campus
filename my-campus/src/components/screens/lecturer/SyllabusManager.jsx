// src/components/screens/lecturer/SyllabusManager.jsx
import { useState } from "react";
import {
  FiFileText,
  FiUploadCloud,
  FiCheckCircle,
  FiAlertTriangle,
  FiTrash2,
  FiInfo,
} from "react-icons/fi";
import * as lecturerService from "../../../services/lecturerService";

export default function SyllabusManager({ courses = [], onRefresh }) {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [syllabusTitle, setSyllabusTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: null, text: "" });

  // Calculate total uploaded syllabi across all courses (Limit to 5)
  const totalSyllabiUploaded = courses.reduce(
    (acc, c) => acc + (c.syllabi?.length || 0),
    0,
  );
  const maxSyllabiLimit = 5;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      setStatusMsg({
        type: "error",
        text: "Format invalide. Seuls les fichiers PDF sécurisés sont acceptés.",
      });
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setStatusMsg({ type: null, text: "" });
    if (file && !syllabusTitle) {
      // Pre-populate syllabus title with file name without extension
      setSyllabusTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: null, text: "" });

    if (!selectedCourseId) {
      setStatusMsg({
        type: "error",
        text: "Veuillez associer ce syllabus à une matière.",
      });
      return;
    }

    if (!selectedFile) {
      setStatusMsg({ type: "error", text: "Veuillez charger un fichier PDF." });
      return;
    }

    if (totalSyllabiUploaded >= maxSyllabiLimit) {
      setStatusMsg({
        type: "error",
        text: `Limite atteinte: Vous ne pouvez héberger que ${maxSyllabiLimit} syllabus simultanément sur votre serveur de stockage gratuit.`,
      });
      return;
    }

    setSubmitting(true);
    try {
      await lecturerService.uploadSyllabusFile(
        selectedFile,
        selectedCourseId,
        syllabusTitle,
      );
      setStatusMsg({
        type: "success",
        text: "Syllabus téléversé avec succès ! Notre DRM l'a crypté et y a injecté la protection par filigrane d'identité.",
      });

      // Clear inputs
      setSyllabusTitle("");
      setSelectedFile(null);
      setSelectedCourseId("");

      // Refresh parent state to fetch updated lists from Supabase
      if (onRefresh) await onRefresh();
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: "Une erreur est survenue lors du chargement: " + err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (syllabusId, storagePath) => {
    if (
      window.confirm(
        "Voulez-vous supprimer ce syllabus ? Les étudiants ayant acheté la matière n'y auront plus accès.",
      )
    ) {
      try {
        await lecturerService.deleteSyllabus(syllabusId, storagePath);
        setStatusMsg({
          type: "success",
          text: "Fichier supprimé avec succès de nos bases et de l'hébergement.",
        });
        if (onRefresh) await onRefresh();
      } catch (err) {
        setStatusMsg({
          type: "error",
          text: "Erreur lors de la suppression : " + err.message,
        });
      }
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <FiFileText className="text-[#00ED64]" /> Gestion des Syllabus DRM
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Uploadez vos fichiers de cours PDF. L'algorithme Monolith crypte
          chaque page pour bloquer le piratage.
        </p>
      </div>

      {statusMsg.text && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 font-bold ${
            statusMsg.type === "success"
              ? "bg-emerald-950/80 text-emerald-200 border border-[#00ED64]/40"
              : "bg-rose-950/80 text-rose-200 border border-rose-500/40"
          }`}
        >
          {statusMsg.type === "success" ? (
            <FiCheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <FiAlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* PDF Secure Upload Form */}
        <div className="lg:col-span-5 bg-[#162C3D]/80 border border-[#3D4F58]/50 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#3D4F58]/40">
            <h3 className="font-extrabold text-white text-sm">
              Charger un syllabus
            </h3>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              Heberge: {totalSyllabiUploaded} / {maxSyllabiLimit}
            </span>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Matière associée
              </label>
              <select
                required
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0A222F] border border-[#3D4F58] rounded-xl text-xs text-white outline-none cursor-pointer"
              >
                <option value="" disabled>
                  Sélectionner le cours concerné...
                </option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Titre d'affichage du document
              </label>
              <input
                type="text"
                required
                value={syllabusTitle}
                onChange={(e) => setSyllabusTitle(e.target.value)}
                placeholder="Ex: Syllabus Complet - Partie 1"
                className="w-full px-4 py-2.5 bg-[#0A222F] border border-[#3D4F58] rounded-xl text-xs text-white focus:outline-none focus:border-[#00ED64]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Fichier PDF (Max 10 Mo)
              </label>
              <label className="border-2 border-dashed border-[#3D4F58] hover:border-[#00ED64]/40 bg-[#0A222F]/40 p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
                <FiUploadCloud className="w-8 h-8 text-[#3D4F58] group-hover:text-[#00ED64] transition-colors mb-2" />
                <span className="text-xs font-bold text-slate-300">
                  {selectedFile
                    ? selectedFile.name
                    : "Sélectionner ou déposer un document"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-1">
                  Accepté uniquement : PDF
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="bg-[#0A222F] border border-[#3D4F58]/30 rounded-xl p-3 flex gap-2.5 text-[10px] text-slate-400">
              <FiInfo className="text-[#00ED64] shrink-0 w-4 h-4" />
              <p className="leading-relaxed">
                Notre technologie de tatouage numérique incruste le nom et le
                numéro de téléphone de l'étudiant directement à l'affichage pour
                dissuader les fuites.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#00ED64] hover:bg-[#00c753] disabled:opacity-50 text-[#001E2B] font-extrabold py-3.5 rounded-xl shadow-lg transition-colors cursor-pointer text-xs"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-[#001E2B] border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                "Sécuriser & Publier"
              )}
            </button>
          </form>
        </div>

        {/* Existing Syllabi Grid */}
        <div className="lg:col-span-7 bg-[#162C3D]/80 border border-[#3D4F58]/60 p-6 rounded-3xl shadow-xl space-y-4">
          <h3 className="font-extrabold text-white text-sm pb-3 border-b border-[#3D4F58]/40">
            Syllabus actuellement en ligne
          </h3>

          {courses.every((c) => !c.syllabi || c.syllabi.length === 0) ? (
            <div className="py-20 text-center text-slate-500 text-xs">
              Aucun document syllabus PDF n'est hébergé pour le moment.
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) =>
                course.syllabi?.map((syllabus) => (
                  <div
                    key={syllabus.id}
                    className="bg-[#0A222F]/60 border border-[#3D4F58]/30 p-4 rounded-2xl flex justify-between items-center text-xs"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-emerald-400 bg-[#00684A]/30 px-2 py-0.5 rounded border border-[#00ED64]/20">
                        {course.title}
                      </span>
                      <h4 className="font-bold text-white mt-1 max-w-[250px] truncate">
                        {syllabus.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Date:{" "}
                        {new Date(syllabus.created_at).toLocaleDateString()} •
                        Taille: {syllabus.file_size_mb} Mo
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleDelete(syllabus.id, syllabus.storage_file_path)
                      }
                      className="p-2.5 rounded-xl bg-rose-950/40 text-rose-400 border border-rose-500/30 hover:bg-rose-900/60 hover:text-rose-200 transition-all cursor-pointer"
                      title="Supprimer le document"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
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
