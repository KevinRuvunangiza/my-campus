// src/components/screens/student/PaymentModal.jsx
import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { FiX, FiCheckCircle, FiPhoneCall } from "react-icons/fi";
import * as studentService from "../../../services/studentService";

export default function PaymentModal({ course, user, onClose, onSuccess }) {
  const [selectedProvider, setSelectedProvider] = useState("m_pesa");
  const [phoneNumber, setPhoneNumber] = useState(
    user?.phone_number || "0840000000",
  );
  const [step, setStep] = useState("select");

  const handlePayment = async () => {
    setStep("waiting");
    // Simulation USSD (Délai d'attente de la saisie PIN sur le téléphone)
    setTimeout(async () => {
      try {
        await studentService.processPayment(
          course.id,
          course.price_fc,
          selectedProvider,
          phoneNumber,
        );
        setStep("success");
        setTimeout(() => onSuccess(course.id), 2000);
      } catch (err) {
        alert("Erreur de paiement : " + err.message);
        setStep("select");
      }
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <m.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        className="w-full max-w-md bg-[#0D2633] border-t sm:border border-[#3D4F58]/60 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl text-white"
      >
        <div className="flex justify-between pb-4 border-b border-[#3D4F58]/40 mb-5">
          <div>
            <span className="text-[10px] font-mono text-[#00ED64] uppercase block">
              Paiement Sécurisé
            </span>
            <h2 className="text-base font-bold">Débloquer le Syllabus</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#162C3D] text-slate-400"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {step === "select" && (
          <div className="space-y-5">
            <div className="bg-[#162C3D]/80 p-3.5 rounded-2xl border border-[#3D4F58]/30 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-white">{course.title}</h3>
                <p className="text-[11px] text-slate-400">{course.professor}</p>
              </div>
              <span className="text-sm font-mono font-extrabold text-[#00ED64]">
                {course.price_fc.toLocaleString()} FC
              </span>
            </div>
            <button
              onClick={handlePayment}
              className="w-full bg-[#00ED64] text-[#001E2B] font-extrabold py-4 rounded-2xl shadow-lg mt-2"
            >
              Payer via Mobile Money
            </button>
          </div>
        )}

        {step === "waiting" && (
          <div className="py-10 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-[#162C3D] border-t-[#00ED64] animate-spin mb-2" />
            <h3 className="text-base font-bold text-white">
              Consultez votre téléphone !
            </h3>
            <p className="text-xs text-slate-300">
              Une invite USSD a été envoyée au <strong>{phoneNumber}</strong>
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="py-10 flex flex-col items-center text-center space-y-4">
            <FiCheckCircle className="w-16 h-16 text-[#00ED64]" />
            <h3 className="text-lg font-extrabold text-white">
              Paiement Réussi !
            </h3>
          </div>
        )}
      </m.div>
    </div>
  );
}
