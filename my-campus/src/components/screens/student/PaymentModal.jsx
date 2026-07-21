// src/components/screens/student/PaymentModal.jsx
import React, { useState, useRef, useCallback } from "react";
import { m } from "framer-motion";
import {
  FiX,
  FiCheckCircle,
  FiPhoneCall,
  FiAlertTriangle,
  FiClock,
  FiArrowLeft,
} from "react-icons/fi";
import * as studentService from "../../../services/studentService";

const PROVIDERS = [
  { id: "MPESA", name: "M-Pesa", color: "from-emerald-600 to-green-700" },
  { id: "ORANGE", name: "Orange Money", color: "from-orange-500 to-amber-600" },
  { id: "AIRTEL", name: "Airtel Money", color: "from-red-500 to-rose-600" },
];

const PAYMENT_TIMEOUT_MS = 30_000;

function withTimeout(promise, ms, timeoutMessage) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

export default function PaymentModal({ courseId, priceUsd, onSuccess, onClose }) {
  const [step, setStep] = useState("select"); // "select" | "waiting" | "success"
  const [errorMsg, setErrorMsg] = useState(null);
  const [provider, setProvider] = useState("MPESA");
  // Default to the Malipo sandbox example phone from https://docs.malipo.dev/quickstart/
  // Any phone works in sandbox — test behaviors are controlled by the CDF *amount* (100=success, 200=fail, etc.)
  // Using the docs example "+243812345678" lets us test end-to-end immediately.
  const [phone, setPhone] = useState("+243812345678");

  const attemptIdRef = useRef(0);

  const handlePayment = useCallback(async () => {
    if (!phone || phone.length < 9) {
      setErrorMsg("Veuillez entrer un numéro de téléphone valide (ex: 0841234567)");
      return;
    }

    const attemptId = ++attemptIdRef.current;
    setErrorMsg(null);
    setStep("waiting");

    try {
      const result = await withTimeout(
        studentService.processPayment(courseId, priceUsd, provider, phone),
        PAYMENT_TIMEOUT_MS,
        "Délai d'attente dépassé (30s). Vérifiez votre connexion et réessayez."
      );

      if (attemptIdRef.current !== attemptId) return;

      setStep("success");
      setTimeout(() => onSuccess?.(result), 2500);
    } catch (err) {
      if (attemptIdRef.current !== attemptId) return;
      setErrorMsg(err.message || "La transaction a échoué ou a été annulée sur le téléphone.");
      setStep("select");
    }
  }, [courseId, priceUsd, provider, phone, onSuccess]);

  const handleCancelWaiting = () => {
    setStep("select");
    setErrorMsg("Transaction annulée. Vous pouvez sélectionner un opérateur et réessayer.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm font-sans">
      <m.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        className="w-full max-w-md bg-[#0D2633] border-t sm:border border-[#3D4F58]/60 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl text-white"
      >
        <div className="flex justify-between pb-4 border-b border-[#3D4F58]/40 mb-5">
          <div>
            <span className="text-[10px] font-mono text-[#00ED64] uppercase block">
              Paiement Malipo Sécurisé
            </span>
            <h2 className="text-base font-bold">Achat du Syllabus</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#162C3D] text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {step === "select" && (
          <div className="space-y-5">
            <div className="bg-[#162C3D]/80 p-4 rounded-2xl border border-[#3D4F58]/40 flex justify-between items-center shadow-inner">
              <div>
                <h3 className="text-xs font-bold text-white line-clamp-1">
                  Cours #{courseId}
                </h3>
                <span className="text-[10px] font-mono text-slate-400 block mt-1.5">
                  Paiement sécurisé via Malipo
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base font-mono font-extrabold text-[#00ED64] block">
                  $ {Number(priceUsd).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium block">
                1. Opérateur Mobile Money RDC
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer ${
                      provider === p.id
                        ? "bg-[#1C364B] border-[#00ED64] shadow-[0_0_15px_rgba(0,237,100,0.15)] scale-105"
                        : "bg-[#162C3D]/50 border-[#3D4F58]/30 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-gradient-to-tr ${p.color}`}
                    />
                    <span className="text-xs font-bold text-slate-200">
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium block">
                2. Numéro de facturation (USSD Push)
              </label>
              <div className="relative">
                <FiPhoneCall className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#162C3D] border border-[#3D4F58]/50 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-mono text-white focus:outline-none focus:border-[#00ED64] transition-colors"
                  placeholder="+243812345678 (numéro de test sandbox Malipo)"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/50 border border-rose-500/50 rounded-xl flex items-start gap-2 text-xs text-rose-200">
                <FiAlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={!phone}
              className="w-full bg-[#00ED64] hover:bg-[#00c753] disabled:opacity-50 text-[#001E2B] font-extrabold py-4 rounded-2xl shadow-lg mt-2 cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <span>Payer $ {Number(priceUsd).toFixed(2)}</span>
            </button>
          </div>
        )}

        {step === "waiting" && (
          <div className="py-8 flex flex-col items-center text-center space-y-5">
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-[#162C3D] border-t-[#00ED64] animate-spin" />
              <FiPhoneCall className="w-6 h-6 text-[#00ED64] absolute animate-pulse" />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h3 className="text-base font-bold text-white">
                Consultez votre téléphone !
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Entrez votre code PIN Mobile Money pour autoriser le paiement sur le numéro{" "}
                <strong className="font-mono text-[#00ED64]">{phone}</strong>.
              </p>
            </div>
            <button
              onClick={handleCancelWaiting}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-white border border-[#3D4F58]/50 hover:border-[#3D4F58] rounded-xl px-4 py-2.5 transition-all cursor-pointer"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Annuler et réessayer</span>
            </button>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
              <FiClock className="w-3 h-3" />
              <span>Expiration automatique dans 30 secondes</span>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="py-10 flex flex-col items-center text-center space-y-4">
            <FiCheckCircle className="w-16 h-16 text-[#00ED64]" />
            <h3 className="text-lg font-extrabold text-white">
              Paiement Malipo Réussi !
            </h3>
            <p className="text-xs text-slate-300">
              La transaction a été confirmée. Le syllabus est débloqué et ajouté à votre tableau de bord.
            </p>
          </div>
        )}
      </m.div>
    </div>
  );
}