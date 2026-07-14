import { useState } from "react";
import { m } from "framer-motion";
import { 
  FiDollarSign, FiArrowDownRight, FiCheckCircle, 
  FiClock, FiPhoneCall, FiSend, FiShield, FiAlertCircle 
} from "react-icons/fi";

const PAYOUT_HISTORY = [
  { id: "PAY-102", date: "01 Juil 2026", amountFc: 350000, provider: "M-Pesa", phone: "084 *** 4567", status: "Payé" },
  { id: "PAY-098", date: "15 Juin 2026", amountFc: 420000, provider: "Orange Money", phone: "089 *** 1102", status: "Payé" },
  { id: "PAY-085", date: "01 Juin 2026", amountFc: 280000, provider: "Airtel Money", phone: "099 *** 8123", status: "Payé" },
];

export default function Financials() {
  const [selectedProvider, setSelectedProvider] = useState("m_pesa");
  const [withdrawPhone, setWithdrawPhone] = useState("084 123 4567");
  const [withdrawAmount, setWithdrawAmount] = useState(250000);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const totalGrossFc = 853000;
  const platformFeeFc = totalGrossFc * 0.30;
  const netWithdrawableFc = totalGrossFc * 0.70;

  const handlePayoutRequest = (e) => {
    e.preventDefault();
    setIsRequesting(true);
    setTimeout(() => {
      setIsRequesting(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* EN-TÊTE */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <FiDollarSign className="text-[#00ED64]" /> Grand Livre Financier & Retraits
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">La commission 70% distributeur / 30% plateforme est calculée et verrouillée automatiquement par Supabase à chaque achat.</p>
      </div>

      {/* 3 CARTES DE SYNTHÈSE (70/30 SPLIT) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-6 shadow-xl space-y-2">
          <span className="text-xs font-mono text-slate-400 uppercase font-bold block">Revenu Brut Global</span>
          <h3 className="text-2xl font-bold font-mono text-white">{totalGrossFc.toLocaleString()} FC</h3>
          <p className="text-[11px] text-slate-400">Total payé par les étudiants via FlexPay</p>
        </div>

        <div className="bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-6 shadow-xl space-y-2">
          <span className="text-xs font-mono text-rose-400 uppercase font-bold block">Commission Plateforme (30%)</span>
          <h3 className="text-2xl font-bold font-mono text-rose-400">-{platformFeeFc.toLocaleString()} FC</h3>
          <p className="text-[11px] text-slate-400">Frais serveurs CDN, base de données et maintenance</p>
        </div>

        <div className="bg-gradient-to-br from-[#162C3D] to-[#0D2633] border border-[#00ED64]/50 rounded-3xl p-6 shadow-xl space-y-2 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#00ED64]/10 rounded-full blur-2xl" />
          <span className="text-xs font-mono text-[#00ED64] uppercase font-extrabold block">Solde Net Retirable (70%)</span>
          <h3 className="text-3xl font-extrabold font-mono text-[#00ED64]">{netWithdrawableFc.toLocaleString()} FC</h3>
          <p className="text-[11px] text-emerald-200/80">Disponible immédiatement en Mobile Money</p>
        </div>

      </div>

      {/* GRILLE DU BAS : PASSERELLE DE RETRAIT À GAUCHE (5 SPANS), HISTORIQUE À DROITE (7 SPANS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PASSERELLE DE RETRAIT MOBILE MONEY */}
        <div className="lg:col-span-5 bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex justify-between items-center pb-3 border-b border-[#3D4F58]/40">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FiSend className="text-[#00ED64]" /> Demander un Retrait Instantané
            </h3>
            <span className="text-[10px] font-mono text-[#00ED64] bg-[#0A222F] px-2 py-0.5 rounded border border-[#00ED64]/30 font-bold">
              Sans frais
            </span>
          </div>

          <form onSubmit={handlePayoutRequest} className="space-y-4">
            
            {/* Opérateurs */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium block">1. Choisir l'opérateur de réception</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "m_pesa", name: "M-Pesa", color: "bg-emerald-600" },
                  { id: "airtel", name: "Airtel", color: "bg-red-600" },
                  { id: "orange", name: "Orange", color: "bg-orange-500" }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProvider(p.id)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      selectedProvider === p.id 
                        ? "bg-[#1C364B] border-[#00ED64] shadow-[0_0_15px_rgba(0,237,100,0.15)] font-bold text-white" 
                        : "bg-[#0A222F]/60 border-[#3D4F58]/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full inline-block mr-1.5 ${p.color}`} />
                    <span className="text-xs">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Numéro de téléphone */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium block">2. Numéro de téléphone bénéficiaire</label>
              <div className="relative">
                <FiPhoneCall className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="tel"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  className="w-full bg-[#0A222F] border border-[#3D4F58]/60 rounded-xl pl-10 pr-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-[#00ED64]"
                  required
                />
              </div>
            </div>

            {/* Montant */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium block">3. Montant à retirer (FC)</label>
              <input
                type="number"
                max={netWithdrawableFc}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="w-full bg-[#0A222F] border border-[#3D4F58]/60 rounded-xl px-4 py-3 text-sm font-mono font-bold text-[#00ED64] focus:outline-none focus:border-[#00ED64]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isRequesting}
              className="w-full bg-[#00ED64] hover:bg-[#00c753] disabled:opacity-50 text-[#001E2B] font-extrabold py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,237,100,0.25)] transition-all flex items-center justify-center gap-2 text-xs cursor-pointer mt-2"
            >
              {isRequesting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#001E2B] border-t-transparent rounded-full animate-spin" />
                  <span>Transfert vers l'agrégateur en cours...</span>
                </>
              ) : (
                <>
                  <FiSend className="w-4 h-4" />
                  <span>Transférer {withdrawAmount.toLocaleString()} FC maintenant</span>
                </>
              )}
            </button>
          </form>

          {showSuccess && (
            <m.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-[#00684A]/40 border border-[#00ED64]/50 rounded-xl p-3 text-xs text-emerald-200 flex items-center gap-2">
              <FiCheckCircle className="text-[#00ED64] w-4 h-4 shrink-0" />
              <span>Demande envoyée ! Le transfert Mobile Money s'effectuera d'ici 5 à 10 minutes.</span>
            </m.div>
          )}
        </div>

        {/* TABLEAU DE L'HISTORIQUE DES RETRAITS */}
        <div className="lg:col-span-7 bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center pb-3 border-b border-[#3D4F58]/40">
            <h3 className="text-sm font-bold text-white">Historique des Virements Effectués</h3>
            <span className="text-xs font-mono text-slate-400">{PAYOUT_HISTORY.length} opérations</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#3D4F58]/40 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Réf / Date</th>
                  <th className="pb-3 font-semibold">Opérateur</th>
                  <th className="pb-3 font-semibold text-right">Montant Viré</th>
                  <th className="pb-3 font-semibold text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3D4F58]/30 text-xs">
                {PAYOUT_HISTORY.map((payout) => (
                  <tr key={payout.id} className="hover:bg-[#0D2633]/50 transition-colors font-mono">
                    <td className="py-3.5 pr-4">
                      <span className="font-bold text-white block">{payout.id}</span>
                      <span className="text-[10px] text-slate-400">{payout.date}</span>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="text-slate-200 font-sans font-semibold block">{payout.provider}</span>
                      <span className="text-[10px] text-slate-400">{payout.phone}</span>
                    </td>
                    <td className="py-3.5 px-2 text-right font-bold text-[#00ED64]">
                      {payout.amountFc.toLocaleString()} FC
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] bg-[#00684A]/40 text-[#00ED64] border border-[#00ED64]/30 px-2.5 py-1 rounded-full font-bold">
                        <FiCheckCircle className="w-3 h-3" /> {payout.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}