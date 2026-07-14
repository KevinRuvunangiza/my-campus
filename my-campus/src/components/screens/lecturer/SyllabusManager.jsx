import{ useState, useRef, useEffect } from "react";
import { m } from "framer-motion";
import { 
  FiUploadCloud, FiFileText, FiShield, FiCheckCircle, 
  FiEye, FiDollarSign, FiTag, FiLayers, FiAlertCircle 
} from "react-icons/fi";

export default function SyllabusManager() {
  const [title, setTitle] = useState("Algorithmique & Structures de Données II");
  const [department, setDepartment] = useState("Faculté d'Informatique");
  const [priceFc, setPriceFc] = useState(3500);
  const [isPublished, setIsPublished] = useState(true);
  const [fileName, setFileName] = useState("Syllabus_Algo_L2_2026.pdf");
  const [fileSize, setFileSize] = useState("14.2 MB");
  const [demoStudent, setDemoStudent] = useState({ name: "JEAN-PAUL MBALE", phone: "084 123 4567" });
  
  const canvasRef = useRef(null);

  // Moteur de rendu du Simulateur DRM Canvas en direct
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    const width = 450;
    const height = 600;
    canvas.width = width;
    canvas.height = height;

    // 1. Fond de page type papier
    ctx.fillStyle = "#FDFBF7";
    ctx.fillRect(0, 0, width, height);

    // 2. Faux contenu du syllabus
    ctx.fillStyle = "#1A2E3B";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(title.substring(0, 35) + "...", 30, 50);

    ctx.fillStyle = "#4A5D6B";
    ctx.font = "12px monospace";
    ctx.fillText(`${department.toUpperCase()} • DOCUMENT PROTEGE`, 30, 75);

    // Lignes de texte fictives
    ctx.fillStyle = "#2C3E50";
    for (let i = 0; i < 12; i++) {
      const lineWidth = i % 3 === 0 ? width - 120 : width - 60;
      ctx.fillRect(30, 110 + i * 35, lineWidth, 10);
      ctx.fillStyle = "#E2E8F0";
      ctx.fillRect(30, 125 + i * 35, width - 80, 3);
      ctx.fillStyle = "#2C3E50";
    }

    // 3. LE FILIGRANE ANTI-PIRATAGE (15% opacité, rotation -30°)
    ctx.save();
    ctx.fillStyle = "rgba(0, 30, 43, 0.15)";
    ctx.font = "bold 15px monospace";
    ctx.rotate(-Math.PI / 6);

    for (let x = -width; x < width * 2; x += 220) {
      for (let y = -height; y < height * 2; y += 130) {
        ctx.fillText(`ACHETE PAR: ${demoStudent.name}`, x, y);
        ctx.fillText(`TEL: ${demoStudent.phone} • NO DIFFUSION`, x, y + 18);
      }
    }
    ctx.restore();

    ctx.fillStyle = "#718096";
    ctx.font = "11px sans-serif";
    ctx.fillText("Page 1 sur 14 • Protection DRM Active via Supabase", 30, height - 20);

  }, [title, department, demoStudent]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* EN-TÊTE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FiLayers className="text-[#00ED64]" /> Gestion des Syllabus & TP
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Uploadez vos supports et vérifiez l'application du filigrane anti-piratage en temps réel.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">Statut de diffusion:</span>
          <button
            onClick={() => setIsPublished(!isPublished)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
              isPublished 
                ? "bg-[#00684A] text-[#00ED64] border border-[#00ED64]/30" 
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            <FiCheckCircle className="w-3.5 h-3.5" />
            {isPublished ? "Publié sur le Marché" : "Brouillon (Masqué)"}
          </button>
        </div>
      </div>

      {/* GRILLE 2 COLONNES : FORMULAIRE À GAUCHE, SIMULATEUR À DROITE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLONNE GAUCHE (7 SPANS) : ZONE D'UPLOAD & MÉTADONNÉES */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Zone de Drop PDF */}
          <div className="bg-[#162C3D] border-2 border-dashed border-[#3D4F58] hover:border-[#00ED64]/60 rounded-3xl p-8 text-center transition-all group cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-[#0A222F] text-[#00ED64] flex items-center justify-center mx-auto mb-4 border border-[#3D4F58]/50 group-hover:scale-110 transition-transform">
              <FiUploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-white">Glissez-déposez votre livret TP ou Syllabus (PDF)</h3>
            <p className="text-xs text-slate-400 mt-1">Taille maximale recommandée : 50 Mo • Rendu Canvas en streaming</p>
            
            {fileName && (
              <div className="mt-4 inline-flex items-center gap-2 bg-[#0A222F] px-4 py-2 rounded-xl border border-[#00ED64]/30 text-xs text-slate-200 font-mono">
                <FiFileText className="text-[#00ED64] w-4 h-4" />
                <span>{fileName}</span>
                <span className="text-slate-500">({fileSize})</span>
              </div>
            )}
          </div>

          {/* Formulaire de configuration */}
          <div className="bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white border-b border-[#3D4F58]/40 pb-3">Informations du Module</h3>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium block">Titre du cours / Syllabus</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0A222F] border border-[#3D4F58]/60 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00ED64]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium block">Département / Faculté</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-[#0A222F] border border-[#3D4F58]/60 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00ED64]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium block">Prix d'accès semestre (FC)</label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00ED64] w-4 h-4" />
                  <input
                    type="number"
                    value={priceFc}
                    onChange={(e) => setPriceFc(Number(e.target.value))}
                    className="w-full bg-[#0A222F] border border-[#3D4F58]/60 rounded-xl pl-10 pr-4 py-3 text-xs font-mono text-[#00ED64] font-bold focus:outline-none focus:border-[#00ED64]"
                  />
                </div>
              </div>
            </div>

            {/* Aperçu financier 70/30 */}
            <div className="bg-[#0A222F]/60 p-4 rounded-2xl border border-[#3D4F58]/40 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Votre revenu net par étudiant (70%) :</span>
              <span className="text-sm font-extrabold text-[#00ED64]">
                {(priceFc * 0.70).toLocaleString()} FC
              </span>
            </div>

            <button className="w-full bg-[#00ED64] hover:bg-[#00c753] text-[#001E2B] font-extrabold py-3.5 rounded-xl text-xs shadow-[0_4px_15px_rgba(0,237,100,0.2)] transition-all cursor-pointer">
              Enregistrer & Mettre à jour le catalogue
            </button>
          </div>
        </div>

        {/* COLONNE DROITE (5 SPANS) : SIMULATEUR DRM EN DIRECT */}
        <div className="lg:col-span-5 bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-6 space-y-4 shadow-xl sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-[#3D4F58]/40">
            <div className="flex items-center gap-2">
              <FiEye className="text-[#00ED64] w-4 h-4" />
              <h3 className="text-sm font-bold text-white">Simulateur Anti-Piratage (DRM)</h3>
            </div>
            <span className="text-[10px] font-mono text-[#00ED64] bg-[#0A222F] px-2.5 py-1 rounded border border-[#00ED64]/30 font-bold">
              15% Opacité
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Voici exactement comment vos étudiants verront ce document sur leur téléphone. Le nom et le numéro Mobile Money de chaque acheteur sont gravés dynamiquement sur le flux HTML5.
          </p>

          {/* Canvas Preview Box */}
          <div className="bg-[#0A222F] p-3 rounded-2xl border border-[#3D4F58]/40 flex justify-center overflow-hidden shadow-inner">
            <canvas ref={canvasRef} className="max-w-full h-auto rounded border border-slate-300 shadow-md block" />
          </div>

          {/* Testeur de nom personnalisé */}
          <div className="space-y-1 pt-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Tester avec un autre profil étudiant :</span>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={demoStudent.name} 
                onChange={(e) => setDemoStudent({ ...demoStudent, name: e.target.value.toUpperCase() })}
                className="flex-1 bg-[#0A222F] border border-[#3D4F58]/60 rounded-lg px-3 py-1.5 text-[11px] font-mono text-white focus:outline-none focus:border-[#00ED64]"
                placeholder="NOM ETUDIANT"
              />
              <input 
                type="text" 
                value={demoStudent.phone} 
                onChange={(e) => setDemoStudent({ ...demoStudent, phone: e.target.value })}
                className="w-32 bg-[#0A222F] border border-[#3D4F58]/60 rounded-lg px-3 py-1.5 text-[11px] font-mono text-white focus:outline-none focus:border-[#00ED64]"
                placeholder="TEL"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}