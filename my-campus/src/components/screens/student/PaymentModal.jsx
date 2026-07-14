import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiPhoneCall,
  FiLock,
} from "react-icons/fi";

const PROVIDERS = [
  {
    id: "m_pesa",
    name: "M-Pesa",
    color: "from-emerald-600 to-green-700",
    badge: "Vodacom",
  },
  {
    id: "airtel",
    name: "Airtel Money",
    color: "from-red-600 to-rose-700",
    badge: "Airtel",
  },
  {
    id: "orange",
    name: "Orange Money",
    color: "from-orange-500 to-amber-600",
    badge: "Orange",
  },
];

export default function PaymentModal({ course, onClose, onSuccess }) {
  const [selectedProvider, setSelectedProvider] = useState("m_pesa");
  const [phoneNumber, setPhoneNumber] = useState("084 123 4567");
  const [step, setStep] = useState("select"); // 'select', 'waiting', 'success'

  // Simulates the USSD webhook confirmation from FlexPay / CinetPay
  useEffect(() => {
    let timer;
    if (step === "waiting") {
      timer = setTimeout(() => {
        setStep("success");
        setTimeout(() => {
          onSuccess(course.id);
        }, 1800);
      }, 4000); // 4-second simulated USSD PIN entry
    }
    return () => clearTimeout(timer);
  }, [step, course, onSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <m.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-[#0D2633] border-t sm:border border-[#3D4F58]/60 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden"
      >
        {/* Soft background ambient light */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#00ED64]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-[#3D4F58]/40 mb-5">
          <div>
            <span className="text-[10px] font-mono text-[#00ED64] uppercase tracking-widest block">
              Paiement Sécurisé • FlexPay
            </span>
            <h2 className="text-base font-bold text-slate-100">
              Débloquer le Syllabus
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#162C3D] text-slate-400 hover:text-white transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === "select" && (
            <m.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Course summary banner */}
              <div className="bg-[#162C3D]/80 p-3.5 rounded-2xl border border-[#3D4F58]/30 flex justify-between items-center">
                <div className="pr-2">
                  <h3 className="text-xs font-bold text-white line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {course.professor}
                  </p>
                </div>
                <span className="text-sm font-mono font-extrabold text-[#00ED64] bg-[#0A222F] px-3 py-1.5 rounded-xl border border-[#00ED64]/20 shrink-0">
                  {course.priceFc.toLocaleString()} FC
                </span>
              </div>

              {/* Provider selector */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium block">
                  1. Choisir l'opérateur Mobile Money
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProvider(p.id)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedProvider === p.id
                          ? "bg-[#1C364B] border-[#00ED64] shadow-[0_0_15px_rgba(0,237,100,0.15)] scale-[1.02]"
                          : "bg-[#162C3D]/50 border-[#3D4F58]/30 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full bg-gradient-to-tr ${p.color}`}
                      />
                      <span className="text-xs font-bold text-slate-200">
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone number input */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium block">
                  2. Numéro de téléphone (USSD Push)
                </label>
                <div className="relative">
                  <FiPhoneCall className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-[#162C3D] border border-[#3D4F58]/50 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-mono text-white focus:outline-none focus:border-[#00ED64] focus:ring-1 focus:ring-[#00ED64] transition-all"
                    placeholder="084 000 0000"
                  />
                </div>
                <p className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1">
                  <FiLock className="text-[#00ED64] w-3 h-3 shrink-0" />
                  Une validation USSD apparaitra directement sur votre
                  téléphone.
                </p>
              </div>

              {/* Action CTA */}
              <button
                onClick={() => setStep("waiting")}
                className="w-full bg-[#00ED64] hover:bg-[#00c753] text-[#001E2B] font-extrabold py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,237,100,0.25)] hover:shadow-[0_6px_25px_rgba(0,237,100,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                Payer {course.priceFc.toLocaleString()} FC maintenant
              </button>
            </m.div>
          )}

          {step === "waiting" && (
            <m.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-10 flex flex-col items-center text-center space-y-4"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-[#162C3D] border-t-[#00ED64] animate-spin" />
                <FiPhoneCall className="w-6 h-6 text-[#00ED64] absolute animate-pulse" />
              </div>
              <div className="space-y-1.5 max-w-xs">
                <h3 className="text-base font-bold text-white">
                  Consultez votre téléphone !
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Une invite USSD a été envoyée au{" "}
                  <strong className="font-mono text-[#00ED64]">
                    {phoneNumber}
                  </strong>
                  . Entrez votre code PIN Mobile Money pour valider.
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-[#162C3D] px-3 py-1 rounded-full animate-pulse">
                En attente de confirmation FlexPay...
              </span>
            </m.div>
          )}

          {step === "success" && (
            <m.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 flex flex-col items-center text-center space-y-4"
            >
              <div className="w-16 h-16 bg-[#00684A] text-[#00ED64] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,237,100,0.4)]">
                <FiCheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  Paiement Réussi !
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Le syllabus et les TP de{" "}
                  <strong className="text-white">{course.professor}</strong>{" "}
                  sont maintenant débloqués pour tout le semestre.
                </p>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </div>
  );
}
