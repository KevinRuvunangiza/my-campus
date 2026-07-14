
import { m } from "framer-motion";
import { 
  FiShield, FiTrendingUp, FiCheckCircle, FiUser, 
  FiAward, FiSmartphone, FiZap, FiExternalLink 
} from "react-icons/fi";

export default function LandingPage({ onNavigateToAuth }) {
  // Animation variants for staggered hero loading
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-[#06141D] text-white font-sans selection:bg-[#00ED64] selection:text-[#001E2B] overflow-x-hidden relative">
      
      {/* AMBIENT BACKGROUND GLOWS (Performance optimized with CSS) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#00ED64]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-[#00684A]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* NAVBAR */}
      <nav className="border-b border-[#3D4F58]/30 bg-[#06141D]/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* PRODUCT BRANDING + COMPANY REDIRECT */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white flex items-center justify-center text-[#06141D] font-extrabold text-xl tracking-tighter rounded-xl shadow-[0_0_15px_rgba(0,237,100,0.1)]">
              MC
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white leading-none">
                My Campus
              </span>
              <a
                href="https://monolith-studio.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-slate-400 hover:text-[#00ED64] transition-colors inline-flex items-center gap-1 mt-0.5"
              >
                <span>by Monolith.</span>
                <FiExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* AUTH CTAs */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button 
              onClick={() => onNavigateToAuth("login", "student")}
              className="text-sm font-bold text-slate-300 hover:text-[#00ED64] transition-colors cursor-pointer"
            >
              Connexion
            </button>
            <button 
              onClick={() => onNavigateToAuth("signup", "student")}
              className="bg-[#00ED64] hover:bg-[#00c753] text-[#001E2B] font-extrabold px-5 py-2.5 rounded-xl text-sm transition-all shadow-[0_4px_15px_rgba(0,237,100,0.2)] hover:shadow-[0_6px_20px_rgba(0,237,100,0.3)] hover:-translate-y-0.5 cursor-pointer"
            >
              S'inscrire
            </button>
          </div>

        </div>
      </nav>

      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <section className="pt-24 pb-20 px-6 lg:pt-32 lg:pb-32 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <m.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 text-center lg:text-left"
          >
            <m.div variants={itemVariants} className="inline-flex items-center gap-2 bg-[#0A222F]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#00ED64]/30 shadow-inner mx-auto lg:mx-0">
              <span className="w-2 h-2 rounded-full bg-[#00ED64] animate-ping" />
              <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-[#00ED64]">
                Lancement Exclusif • USCITECH
              </span>
            </m.div>

            <m.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-white leading-[1.1]">
              L'éducation RDC, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ED64] to-emerald-200">
                sans le piratage.
              </span>
            </m.h1>

            <m.p variants={itemVariants} className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              La plateforme <strong className="text-white">My Campus</strong> (développée par{" "}
              <a 
                href="https://monolith-studio.netlify.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#00ED64] font-semibold underline decoration-[#00ED64]/40 hover:decoration-[#00ED64] transition-all"
              >
                Monolith.
              </a>
              ) digitalise les syllabus et les TP. Paiements Mobile Money instantanés, filigrane DRM inviolable, et algorithme de préparation aux examens.
            </m.p>

            <m.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button 
                onClick={() => onNavigateToAuth("signup", "student")}
                className="w-full sm:w-auto bg-[#00ED64] text-[#001E2B] font-extrabold px-8 py-4 rounded-2xl shadow-[0_8px_30px_rgba(0,237,100,0.3)] hover:shadow-[0_12px_40px_rgba(0,237,100,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiUser className="w-5 h-5" /> Je suis Étudiant
              </button>
              
              <button 
                onClick={() => onNavigateToAuth("signup", "lecturer")}
                className="w-full sm:w-auto bg-[#162C3D]/80 backdrop-blur-md text-white border border-[#3D4F58]/60 font-extrabold px-8 py-4 rounded-2xl shadow-lg hover:border-[#00ED64]/50 hover:bg-[#1C364B] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiAward className="w-5 h-5 text-[#00ED64]" /> Je suis Professeur
              </button>
            </m.div>
          </m.div>

          {/* HERO VISUAL (Floating 3D-like Mockups) */}
          <m.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4, type: "spring" }}
            className="relative h-[400px] sm:h-[500px] w-full hidden md:block"
          >
            {/* Mockup: Canvas DRM PDF */}
            <m.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-0 right-10 w-[320px] h-[420px] bg-[#FDFBF7] rounded-xl shadow-2xl border border-white/20 overflow-hidden z-20 origin-bottom-right transform rotate-3"
            >
              <div className="p-6">
                <div className="w-full h-4 bg-slate-200 rounded mb-4" />
                <div className="w-3/4 h-4 bg-slate-200 rounded mb-8" />
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-full h-2 bg-slate-100 rounded" />
                  ))}
                </div>
                {/* Simulated Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 -rotate-45">
                  <div className="text-center font-mono font-bold text-slate-900 text-xl tracking-widest whitespace-nowrap">
                    ACHETÉ PAR ÉTUDIANT<br/>084 123 4567
                  </div>
                </div>
              </div>
            </m.div>

            {/* Mockup: Analytics Dashboard (Behind) */}
            <m.div 
              animate={{ y: [10, -10, 10] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
              className="absolute bottom-0 left-0 w-[300px] h-[280px] bg-[#162C3D]/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#3D4F58]/60 p-5 z-10 transform -rotate-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#00ED64]/20 flex items-center justify-center">
                  <FiTrendingUp className="text-[#00ED64]" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-mono">INDICE DE PRÉPARATION</div>
                  <div className="text-xl font-bold text-white">82%</div>
                </div>
              </div>
              <div className="w-full h-32 bg-[#0A222F] rounded-xl border border-[#3D4F58]/30 flex items-end px-4 gap-2 pb-4">
                <div className="w-1/4 h-[40%] bg-[#00684A] rounded-t-sm" />
                <div className="w-1/4 h-[70%] bg-[#00684A] rounded-t-sm" />
                <div className="w-1/4 h-[50%] bg-[#00684A] rounded-t-sm" />
                <div className="w-1/4 h-[90%] bg-[#00ED64] rounded-t-sm shadow-[0_0_10px_rgba(0,237,100,0.5)]" />
              </div>
            </m.div>
          </m.div>
        </section>

        {/* LOCAL DRC TEAM BANNER */}
        <section className="border-y border-[#3D4F58]/30 bg-[#0A222F]/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#162C3D] border border-[#00ED64]/30 rounded-xl flex items-center justify-center text-[#00ED64] shadow-inner">
                <FiZap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold tracking-tight">Déploiement Local en RDC</h3>
                <p className="text-xs text-slate-400">Marketing & Partenariats Universitaires</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm font-mono text-slate-300">
              <span className="flex items-center gap-2 bg-[#162C3D]/50 px-4 py-2 rounded-lg border border-[#3D4F58]/30">
                <FiUser className="text-[#00ED64]" /> Dan Ebondo
              </span>
              <span className="flex items-center gap-2 bg-[#162C3D]/50 px-4 py-2 rounded-lg border border-[#3D4F58]/30">
                <FiUser className="text-[#00ED64]" /> Emmanuel Kabongo
              </span>
            </div>
          </div>
        </section>

        {/* B2B / B2C VALUE PROPOSITION SPLIT */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Une plateforme, <span className="text-[#00ED64]">deux visions.</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
              My Campus relie les professeurs qui veulent sécuriser leurs revenus aux étudiants qui veulent réussir leurs examens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* PROFESSOR CARD */}
            <div className="bg-gradient-to-br from-[#162C3D] to-[#0A222F] border border-[#3D4F58]/50 hover:border-[#00ED64]/50 rounded-3xl p-8 sm:p-10 space-y-8 shadow-2xl transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-[#00684A]/30 border border-[#00ED64]/30 flex items-center justify-center text-[#00ED64] shadow-[0_0_20px_rgba(0,237,100,0.1)] group-hover:scale-110 transition-transform">
                <FiShield className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-white mb-2">Pour les Professeurs</h3>
                <p className="text-slate-400 text-sm">Monétisez et protégez vos syllabus sans effort.</p>
              </div>
              <ul className="space-y-5 text-sm sm:text-base text-slate-300">
                <li className="flex items-start gap-4">
                  <FiCheckCircle className="text-[#00ED64] w-6 h-6 shrink-0 mt-0.5" />
                  <span><strong>Protection DRM Canvas :</strong> Votre PDF n'est jamais téléchargé. Le nom et le numéro de l'étudiant sont incrustés en filigrane pour empêcher les partages WhatsApp.</span>
                </li>
                <li className="flex items-start gap-4">
                  <FiCheckCircle className="text-[#00ED64] w-6 h-6 shrink-0 mt-0.5" />
                  <span><strong>Revenus Automatisés (70/30) :</strong> Encaissez 70% de chaque vente directement sur votre compte M-Pesa, Airtel Money ou Orange Money.</span>
                </li>
                <li className="flex items-start gap-4">
                  <FiCheckCircle className="text-[#00ED64] w-6 h-6 shrink-0 mt-0.5" />
                  <span><strong>Suivi Pédagogique :</strong> Identifiez les chapitres incompris avant l'examen grâce aux statistiques générées par les QCM de vos étudiants.</span>
                </li>
              </ul>
            </div>

            {/* STUDENT CARD */}
            <div className="bg-gradient-to-br from-[#162C3D] to-[#0A222F] border border-[#3D4F58]/50 hover:border-[#00ED64]/50 rounded-3xl p-8 sm:p-10 space-y-8 shadow-2xl transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-[#0A222F] border border-[#3D4F58]/50 flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
                <FiSmartphone className="w-8 h-8 text-slate-300" />
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-white mb-2">Pour les Étudiants</h3>
                <p className="text-slate-400 text-sm">Étudiez plus intelligemment, où que vous soyez.</p>
              </div>
              <ul className="space-y-5 text-sm sm:text-base text-slate-300">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 shrink-0 mt-0.5 flex items-center justify-center rounded-full bg-[#1C364B] border border-[#3D4F58]">
                    <FiCheckCircle className="text-slate-300 w-4 h-4" />
                  </div>
                  <span><strong>Paiement Mobile 1-Clic :</strong> Achetez vos accès instantanément sans carte bancaire via le réseau FlexPay.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 shrink-0 mt-0.5 flex items-center justify-center rounded-full bg-[#1C364B] border border-[#3D4F58]">
                    <FiCheckCircle className="text-slate-300 w-4 h-4" />
                  </div>
                  <span><strong>Indice de Préparation (R) :</strong> Évaluez vos chances de réussite grâce à des arènes QCM chronométrées avec correction instantanée.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 shrink-0 mt-0.5 flex items-center justify-center rounded-full bg-[#1C364B] border border-[#3D4F58]">
                    <FiCheckCircle className="text-slate-300 w-4 h-4" />
                  </div>
                  <span><strong>Optimisé 3G (Kinshasa) :</strong> Une application PWA ultra-légère conçue pour économiser vos forfaits Internet.</span>
                </li>
              </ul>
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#040C12] pt-16 pb-12 border-t border-[#3D4F58]/20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white flex items-center justify-center text-[#06141D] font-extrabold text-xs tracking-tighter rounded">
                MC
              </div>
              <span className="font-extrabold tracking-tight text-white text-base">My Campus</span>
            </div>
            <a
              href="https://monolith-studio.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-[#00ED64] transition-colors inline-flex items-center gap-1 font-mono"
            >
              <span>Un produit développé par Monolith.</span>
              <FiExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="text-xs text-slate-500 font-mono text-center md:text-right space-y-1">
            <p>© 2026 Monolith Studio. Tous droits réservés.</p>
            <p>Infrastructure propulsée par React & Supabase.</p>
          </div>

        </div>
      </footer>

    </div>
  );
}