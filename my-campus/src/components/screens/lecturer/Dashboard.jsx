
import { m } from "framer-motion";
import { 
  FiUsers, FiDollarSign, FiTrendingUp, FiBookOpen, 
  FiPlus, FiArrowUpRight, FiCheckCircle, FiClock, FiActivity 
} from "react-icons/fi";

const MOCK_COURSES = [
  {
    id: "c1",
    title: "Algorithmique & Structures de Données II",
    department: "Faculté d'Informatique",
    studentsCount: 142,
    priceFc: 3500,
    grossRevenueFc: 497000,
    lecturerShareFc: 347900, // 70% exact
    avgReadiness: 78,
    status: "Publié",
  },
  {
    id: "c2",
    title: "Base de Données Relationnelles & SQL",
    department: "Faculté d'Informatique",
    studentsCount: 89,
    priceFc: 4000,
    grossRevenueFc: 356000,
    lecturerShareFc: 249200, // 70% exact
    avgReadiness: 65,
    status: "Publié",
  },
  {
    id: "c3",
    title: "Architecture Réseaux & Protocoles TCP/IP",
    department: "Génie Informatique",
    studentsCount: 0,
    priceFc: 5000,
    grossRevenueFc: 0,
    lecturerShareFc: 0,
    avgReadiness: 0,
    status: "Brouillon",
  }
];

const RECENT_TRANSACTIONS = [
  { id: "TX-9901", student: "Jean-Paul Mbale", phone: "084 *** 4567", course: "Algorithmique II", amountFc: 3500, netFc: 2450, provider: "M-Pesa", time: "Il y a 4 min" },
  { id: "TX-9895", student: "Divine Kankolongo", phone: "099 *** 8123", course: "Base de Données", amountFc: 4000, netFc: 2800, provider: "Airtel Money", time: "Il y a 23 min" },
  { id: "TX-9882", student: "Christian Lukusa", phone: "089 *** 1102", course: "Algorithmique II", amountFc: 3500, netFc: 2450, provider: "Orange Money", time: "Il y a 1 heure" },
  { id: "TX-9870", student: "Sarah Kasongo", phone: "081 *** 9001", course: "Algorithmique II", amountFc: 3500, netFc: 2450, provider: "M-Pesa", time: "Il y a 2 heures" },
];

export default function LecturerDashboard({ onNavigate }) {
  // Calculs agrégés pour les KPI
  const totalStudents = MOCK_COURSES.reduce((acc, curr) => acc + curr.studentsCount, 0);
  const totalNetEarnings = MOCK_COURSES.reduce((acc, curr) => acc + curr.lecturerShareFc, 0);
  const activeCoursesCount = MOCK_COURSES.filter(c => c.status === "Publié").length;
  const avgClassReadiness = Math.round(MOCK_COURSES.filter(c => c.studentsCount > 0).reduce((acc, curr) => acc + curr.avgReadiness, 0) / (activeCoursesCount || 1));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto font-sans">
      
      {/* EN-TÊTE DU DASHBOARD & CTA RAPIDES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Aperçu Académique & Financier</h2>
          <p className="text-xs text-slate-400 mt-0.5">Suivez la diffusion de vos TP et vos revenus de distribution affiliée en temps réel.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("qcm")}
            className="bg-[#162C3D] hover:bg-[#1C364B] text-slate-200 border border-[#3D4F58]/60 font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <FiPlus className="w-4 h-4 text-[#00ED64]" /> Créer un QCM
          </button>
          <button
            onClick={() => onNavigate("syllabus")}
            className="bg-[#00ED64] hover:bg-[#00c753] text-[#001E2B] font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-[0_4px_15px_rgba(0,237,100,0.25)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <FiBookOpen className="w-4 h-4 fill-current" /> Publier un Syllabus
          </button>
        </div>
      </div>

      {/* GRILLE DE CARTES KPI (COMMAND CENTER) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI 1 : Revenus Net (70%) */}
        <m.div 
          whileHover={{ y: -3 }}
          className="bg-gradient-to-br from-[#162C3D] to-[#0D2633] border border-[#3D4F58]/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-[#00ED64]/10 rounded-full blur-2xl group-hover:bg-[#00ED64]/20 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
              Vos Revenus Nets (Part 70%)
            </span>
            <div className="p-2.5 rounded-2xl bg-[#00684A] text-[#00ED64] border border-[#00ED64]/30">
              <FiDollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-extrabold font-mono text-[#00ED64]">
              {totalNetEarnings.toLocaleString()} <span className="text-base text-white font-sans font-semibold">FC</span>
            </h3>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <span className="text-[#00ED64] font-bold">~${Math.round(totalNetEarnings / 2800)} USD</span> • Commission 30% déduite
            </p>
          </div>
        </m.div>

        {/* KPI 2 : Étudiants Actifs */}
        <m.div 
          whileHover={{ y: -3 }}
          className="bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-6 shadow-xl relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
              Étudiants Actifs Enregistrés
            </span>
            <div className="p-2.5 rounded-2xl bg-[#0A222F] text-slate-300 border border-[#3D4F58]/40">
              <FiUsers className="w-5 h-5 text-[#00ED64]" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-extrabold font-mono text-white">
              {totalStudents} <span className="text-sm font-sans font-normal text-slate-400">Inscrits</span>
            </h3>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <FiArrowUpRight className="text-[#00ED64] w-3.5 h-3.5" /> Répartis sur {activeCoursesCount} cours publiés
            </p>
          </div>
        </m.div>

        {/* KPI 3 : Score Indice R Moyen de la Classe */}
        <m.div 
          whileHover={{ y: -3 }}
          className="bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-6 shadow-xl relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
              Indice de Préparation (R) Moyen
            </span>
            <div className="p-2.5 rounded-2xl bg-[#0A222F] text-slate-300 border border-[#3D4F58]/40">
              <FiActivity className="w-5 h-5 text-[#00ED64]" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-extrabold font-mono text-[#00ED64]">
              {avgClassReadiness}% <span className="text-sm font-sans font-normal text-slate-400">Moy. Classe</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Calculé sur précision (50%), couverture (35%) et vitesse (15%)
            </p>
          </div>
        </m.div>

      </div>

      {/* SECTION DU MILIEU : TABLEAU DES COURS & FLUX DE TRANSACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* COLONNE GAUCHE (2 SPANS) : TABLEAU DES SYLLABUS & PERFORMANCE */}
        <div className="lg:col-span-2 bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#3D4F58]/40">
            <div>
              <h3 className="text-base font-bold text-white">Performance de vos Syllabus</h3>
              <p className="text-xs text-slate-400">Statistiques d'accès et d'entraînement par module</p>
            </div>
            <button 
              onClick={() => onNavigate("syllabus")}
              className="text-xs font-mono text-[#00ED64] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Gérer tout <FiArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#3D4F58]/40 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Titre du Syllabus</th>
                  <th className="pb-3 font-semibold text-center">Inscrits</th>
                  <th className="pb-3 font-semibold text-center">Revenu Net (FC)</th>
                  <th className="pb-3 font-semibold text-center">Score R</th>
                  <th className="pb-3 font-semibold text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3D4F58]/30 text-xs">
                {MOCK_COURSES.map((course) => (
                  <tr key={course.id} className="hover:bg-[#0D2633]/50 transition-colors">
                    <td className="py-4 pr-4">
                      <p className="font-bold text-white leading-snug">{course.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{course.department}</span>
                    </td>
                    <td className="py-4 px-2 text-center font-mono font-bold text-slate-200">
                      {course.studentsCount}
                    </td>
                    <td className="py-4 px-2 text-center font-mono font-bold text-[#00ED64]">
                      {course.lecturerShareFc.toLocaleString()}
                    </td>
                    <td className="py-4 px-2 text-center font-mono">
                      {course.studentsCount > 0 ? (
                        <span className="bg-[#0A222F] text-slate-200 px-2.5 py-1 rounded-md border border-[#3D4F58]/40 font-bold">
                          {course.avgReadiness}%
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 rounded-full font-bold ${
                        course.status === "Publié" 
                          ? "bg-[#00684A]/40 text-[#00ED64] border border-[#00ED64]/30" 
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}>
                        {course.status === "Publié" && <FiCheckCircle className="w-3 h-3 shrink-0" />}
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* COLONNE DROITE (1 SPAN) : FLUX DE TRANSACTIONS LIVE */}
        <div className="bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#3D4F58]/40">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Achats Mobile Money
              </h3>
              <p className="text-xs text-slate-400">Flux Webhooks (FlexPay / CinetPay)</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ED64] animate-ping" title="En écoute active" />
          </div>

          <div className="space-y-3">
            {RECENT_TRANSACTIONS.map((tx) => (
              <div 
                key={tx.id} 
                className="bg-[#0D2633]/80 border border-[#3D4F58]/40 rounded-2xl p-3.5 space-y-2 hover:border-[#00ED64]/30 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-white leading-none">{tx.student}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{tx.phone}</span>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-[#00ED64] bg-[#00684A]/30 px-2 py-0.5 rounded border border-[#00ED64]/20">
                    +{tx.netFc} FC
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#3D4F58]/30 text-[10px] text-slate-400 font-mono">
                  <span className="truncate max-w-[140px] text-slate-300">{tx.course}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <FiClock className="w-3 h-3 text-[#00ED64]" /> {tx.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => onNavigate("financials")}
            className="w-full bg-[#0A222F] hover:bg-[#1C364B] text-slate-300 hover:text-white border border-[#3D4F58]/60 font-semibold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            Voir le Grand Livre Financier <FiArrowUpRight className="w-4 h-4 text-[#00ED64]" />
          </button>
        </div>

      </div>

    </div>
  );
}