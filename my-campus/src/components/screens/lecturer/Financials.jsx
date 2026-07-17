// src/components/screens/lecturer/Financials.jsx
import { useState, useEffect } from "react";
import {
  FiDollarSign,
  FiPhoneCall,
  FiTrendingUp,
  FiCreditCard,
  FiCheckCircle,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";
import * as lecturerService from "../../../services/lecturerService";

export default function LecturerFinancials({ user }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exchangeRate, setExchangeRate] = useState(2850);
  const [loadingRate, setLoadingRate] = useState(true);

  // Cashout Form State
  const [cashoutAmount, setCashoutAmount] = useState("");
  const [cashoutPhone, setCashoutPhone] = useState(user?.phone_number || "");
  const [cashoutProvider, setCashoutProvider] = useState("MPESA");
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: null, text: "" });

  useEffect(() => {
    let isMounted = true;

    async function loadFinancialData() {
      try {
        const [dashboardMetrics, forexRes] = await Promise.all([
          lecturerService.getFinancialDashboard(user.id),
          fetch("https://open.er-api.com/v6/latest/USD")
            .then((res) => res.json())
            .catch(() => ({ rates: { CDF: 2850 } })),
        ]);

        if (isMounted) {
          setMetrics(dashboardMetrics);
          setExchangeRate(forexRes?.rates?.CDF || 2850);
          setLoadingRate(false);
        }
      } catch (err) {
        console.error("Échec du chargement des rapports financiers:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadFinancialData();
    return () => {
      isMounted = false;
    };
  }, [user.id]);

  const handleCashoutSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: null, text: "" });

    const amt = parseFloat(cashoutAmount);
    if (isNaN(amt) || amt <= 0) {
      setStatusMsg({
        type: "error",
        text: "Veuillez entrer un montant valide supérieur à 0.",
      });
      return;
    }

    if (amt > (metrics?.netLecturerShareUsd || 0)) {
      setStatusMsg({
        type: "error",
        text: "Solde insuffisant pour demander ce montant.",
      });
      return;
    }

    if (!cashoutPhone || cashoutPhone.length < 9) {
      setStatusMsg({ type: "error", text: "Numéro Mobile Money invalide." });
      return;
    }

    setPayoutSubmitting(true);
    try {
      await lecturerService.requestMobileMoneyCashout({
        lecturerId: user.id,
        amountUsd: amt,
        provider: cashoutProvider,
        destinationPhone: cashoutPhone,
      });

      setStatusMsg({
        type: "success",
        text: `Demande soumise ! Notre équipe validera et versera le montant de ${Math.ceil(amt * exchangeRate).toLocaleString()} FC sur votre compte sous 24 heures.`,
      });

      // Deduct locally to update the user's interface instantly
      setMetrics((prev) => ({
        ...prev,
        netLecturerShareUsd: prev.netLecturerShareUsd - amt,
      }));
      setCashoutAmount("");
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: "Une erreur est survenue lors du cashout : " + err.message,
      });
    } finally {
      setPayoutSubmitting(false);
    }
  };

  // Compile all transaction items across courses
  const transactions = [];
  metrics?.courses?.forEach((course) => {
    course.purchases?.forEach((p) => {
      transactions.push({
        id: p.id,
        courseTitle: course.title,
        status: p.status,
        purchased_at: p.purchased_at,
        amountUsd: p.amount_usd,
        shareUsd: p.lecturer_share_usd,
      });
    });
  });
  // Sort transaction history descending by date
  transactions.sort(
    (a, b) => new Date(b.purchased_at) - new Date(a.purchased_at),
  );

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <FiTrendingUp className="text-[#00ED64]" /> Portefeuille Financier
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Gérez vos gains, taux de change, et retraits Mobile Money en toute
          transparence.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#162C3D] border-t-[#00ED64] rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono">
            Génération des rapports comptables...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Account Balances */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-[#162C3D]/80 border border-[#3D4F58]/60 p-6 rounded-3xl shadow-xl space-y-4">
              <span className="text-[10px] font-mono text-[#00ED64] uppercase font-bold block">
                Solde Disponible
              </span>
              <div className="space-y-1">
                <span className="text-3xl font-extrabold text-white font-mono">
                  $ {(metrics?.netLecturerShareUsd || 0).toFixed(2)}
                </span>
                {loadingRate ? (
                  <span className="text-xs text-slate-500 flex items-center gap-1 animate-pulse">
                    <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> Calcul
                    du cours de change...
                  </span>
                ) : (
                  <span className="text-sm font-mono text-slate-300 block font-bold">
                    ~{" "}
                    {Math.ceil(
                      (metrics?.netLecturerShareUsd || 0) * exchangeRate,
                    ).toLocaleString()}{" "}
                    FC
                  </span>
                )}
              </div>

              {!loadingRate && (
                <div className="text-[10px] font-mono text-emerald-400/80 bg-[#0A222F]/60 p-2.5 rounded-xl border border-[#3D4F58]/30">
                  💱 Forex en direct : 1$ ={" "}
                  {Math.round(exchangeRate).toLocaleString()} FC
                </div>
              )}
            </div>

            {/* Cashout Request Form */}
            <div className="bg-[#162C3D]/80 border border-[#3D4F58]/60 p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#3D4F58]/40 pb-4">
                <div className="w-8 h-8 rounded-lg bg-[#00ED64]/10 text-[#00ED64] flex items-center justify-center font-bold">
                  <FiCreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm">
                    Demander un transfert
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Paiement Mobile Money instantané
                  </p>
                </div>
              </div>

              {statusMsg.text && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-start gap-2 font-semibold ${
                    statusMsg.type === "success"
                      ? "bg-emerald-950/80 text-emerald-200 border border-[#00ED64]/30"
                      : "bg-rose-950/80 text-rose-200 border border-rose-500/30"
                  }`}
                >
                  {statusMsg.type === "success" ? (
                    <FiCheckCircle className="w-4 h-4 shrink-0 text-[#00ED64]" />
                  ) : (
                    <FiAlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleCashoutSubmit} className="space-y-4 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCashoutProvider("MPESA")}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      cashoutProvider === "MPESA"
                        ? "bg-[#1C364B] border-[#00ED64] text-white"
                        : "bg-[#0A222F]/60 border-[#3D4F58]/30 text-slate-400"
                    }`}
                  >
                    M-Pesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setCashoutProvider("ORANGE")}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      cashoutProvider === "ORANGE"
                        ? "bg-[#1C364B] border-[#00ED64] text-white"
                        : "bg-[#0A222F]/60 border-[#3D4F58]/30 text-slate-400"
                    }`}
                  >
                    Orange Money
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Montant à retirer (USD $)
                  </label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.10"
                      value={cashoutAmount}
                      onChange={(e) => setCashoutAmount(e.target.value)}
                      placeholder="Ex: 50.00"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#0A222F] border border-[#3D4F58] rounded-xl text-sm font-mono text-white focus:outline-none focus:border-[#00ED64]"
                    />
                  </div>
                  {cashoutAmount && !isNaN(parseFloat(cashoutAmount)) && (
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">
                      Calcul de réception: ~{" "}
                      {Math.ceil(
                        parseFloat(cashoutAmount) * exchangeRate,
                      ).toLocaleString()}{" "}
                      FC
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Numéro Mobile Money cible
                  </label>
                  <div className="relative">
                    <FiPhoneCall className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="tel"
                      required
                      value={cashoutPhone}
                      onChange={(e) => setCashoutPhone(e.target.value)}
                      placeholder="Ex: 0841234567"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#0A222F] border border-[#3D4F58] rounded-xl text-sm font-mono text-white focus:outline-none focus:border-[#00ED64]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={payoutSubmitting}
                  className="w-full bg-[#00ED64] hover:bg-[#00c753] disabled:opacity-50 text-[#001E2B] font-extrabold py-3.5 rounded-xl shadow-lg transition-colors cursor-pointer text-xs"
                >
                  {payoutSubmitting ? (
                    <div className="w-5 h-5 border-2 border-[#001E2B] border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    "Lancer le retrait"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Detailed Transaction History */}
          <div className="lg:col-span-8 bg-[#162C3D]/80 border border-[#3D4F58]/60 p-6 rounded-3xl shadow-xl space-y-4">
            <h3 className="font-extrabold text-white text-sm pb-3 border-b border-[#3D4F58]/40">
              Historique des ventes
            </h3>

            {transactions.length === 0 ? (
              <div className="py-20 text-center text-slate-500 text-xs">
                Aucune transaction enregistrée pour vos cours pour le moment.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-[#0A222F]/60 border border-[#3D4F58]/30 p-4 rounded-2xl flex justify-between items-center text-xs"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-white max-w-[250px] truncate">
                        {tx.courseTitle}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {new Date(tx.purchased_at).toLocaleDateString()} •{" "}
                        {new Date(tx.purchased_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="text-right font-mono">
                      <span className="font-bold text-[#00ED64] block">
                        +$ {tx.shareUsd.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        vendu $ {tx.amountUsd.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
