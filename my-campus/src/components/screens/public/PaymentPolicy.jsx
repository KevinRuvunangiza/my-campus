// src/components/screens/public/PaymentPolicy.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiFileText, FiShieldOff, FiAlertCircle, FiPhoneCall, FiCheckCircle } from "react-icons/fi";

export default function PaymentPolicy() {
  return (
    <div className="min-h-screen bg-[#0A222F] text-slate-300 py-12 px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#00ED64] hover:underline text-sm font-bold"
        >
          <FiArrowLeft /> Retour à l'accueil
        </Link>

        <div className="bg-[#162C3D] p-8 rounded-3xl border border-[#3D4F58]/50 shadow-xl space-y-8">
          {/* ── HEADER ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-4 border-b border-[#3D4F58]/50 pb-6">
            <div className="w-12 h-12 bg-[#1C364B] text-[#00ED64] rounded-2xl flex items-center justify-center border border-[#00ED64]/30 shrink-0">
              <FiFileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                Politique de Paiement & Remboursements
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                My Campus (USCITECH) — Dernière mise à jour : Juillet 2026
              </p>
            </div>
          </div>

          {/* ── SECTION 1 : MODALITÉS DE PAIEMENT ─────────────────── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <FiPhoneCall className="w-4 h-4 text-[#00ED64] shrink-0" />
              <h2 className="text-lg font-bold text-white">
                1. Modalités de Paiement
              </h2>
            </div>
            <p className="text-sm leading-relaxed">
              Les transactions sur la plateforme <strong>My Campus</strong> sont
              exclusivement traitées via les opérateurs de Mobile Money agréés
              en République Démocratique du Congo, à savoir{" "}
              <strong>M-Pesa</strong> et <strong>Orange Money</strong>, par le
              biais de notre partenaire de paiement certifié{" "}
              <strong>Malipo</strong>.
            </p>
            <p className="text-sm leading-relaxed">
              Le montant en Francs Congolais (FC) affiché au moment de la
              transaction est calculé en appliquant le <strong>taux de change
              USD/CDF en temps réel</strong> fourni par notre API forex
              (open.er-api.com). Ce taux est récupéré dynamiquement et peut
              fluctuer légèrement entre la consultation et la validation du
              paiement. En validant votre code PIN USSD, vous acceptez
              expressément le taux et le montant total facturé.
            </p>
            <p className="text-sm leading-relaxed">
              Aucune carte bancaire internationale ni virement ne sont acceptés
              sur cette plateforme à ce jour.
            </p>
          </section>

          {/* ── SECTION 2 : NON-REMBOURSEMENT ─────────────────────── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <FiShieldOff className="w-4 h-4 text-rose-400 shrink-0" />
              <h2 className="text-lg font-bold text-white">
                2. Politique de Non-Remboursement (Stricte)
              </h2>
            </div>

            {/* Encadré d'alerte prominent */}
            <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-5 flex items-start gap-4">
              <FiAlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-rose-200 uppercase tracking-wide">
                  Aucun remboursement ne sera accordé — sans exception
                </h3>
                <p className="text-xs text-rose-200/80 leading-relaxed">
                  Dès lors qu'un syllabus, un bundle de Travaux Pratiques (TP)
                  ou tout autre contenu numérique protégé est <strong>débloqué
                  et décrypté sur l'appareil de l'étudiant</strong> via le
                  lecteur DRM Canvas de la plateforme, la prestation est
                  considérée comme <strong>intégralement et définitivement
                  rendue</strong>. Aucune demande de remboursement, de rétrofacturation
                  (chargeback), ou de contestation de transaction ne peut être
                  acceptée après cette étape.
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed">
              Cette politique est justifiée par la nature immatérielle et
              immédiatement consommable du contenu numérique fourni. Une fois
              le fichier déchiffré et rendu accessible sur votre appareil, il
              est techniquement impossible de « retourner » ou d'invalider
              l'accès de manière équitable pour les deux parties.
            </p>
            <p className="text-sm leading-relaxed">
              En procédant au paiement et en entrant votre code PIN Mobile
              Money, vous reconnaissez avoir lu et accepté sans réserve la
              présente politique de non-remboursement.
            </p>
          </section>

          {/* ── SECTION 3 : EXCEPTION — CONTENU NON LIVRÉ ─────────── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <FiCheckCircle className="w-4 h-4 text-[#00ED64] shrink-0" />
              <h2 className="text-lg font-bold text-white">
                3. Exception : Contenu Non Livré (Défaillance Technique)
              </h2>
            </div>
            <p className="text-sm leading-relaxed">
              La seule circonstance dans laquelle une réclamation peut être
              examinée est celle d'une <strong>défaillance technique avérée
              côté plateforme</strong>, c'est-à-dire un cas où votre Mobile
              Money a bien été débité, mais où la transaction affiche
              définitivement le statut <strong>« Échec »</strong> dans notre
              système de paiement Malipo et où le contenu n'a pas été rendu
              accessible sur votre compte.
            </p>
            <p className="text-sm leading-relaxed">
              Dans ce cas précis uniquement, contactez notre support en
              fournissant : votre identifiant de compte, le numéro de
              téléphone utilisé, et la date approximative de la transaction.
              Nous traiterons votre demande dans un délai de{" "}
              <strong>72 heures ouvrables</strong>.
            </p>
            <div className="bg-[#0A222F] border border-[#3D4F58]/40 rounded-xl p-4 font-mono text-xs text-slate-400">
              ⚠️ Toute tentative de remboursement basée sur un contenu déjà
              consulté, téléchargé, ou accessible sera automatiquement rejetée.
            </div>
          </section>

          {/* ── SECTION 4 : LITIGES & CONTACT ──────────────────────── */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">
              4. Litiges & Contact Support
            </h2>
            <p className="text-sm leading-relaxed">
              Pour toute question relative à un paiement ou pour signaler une
              défaillance technique conforme aux critères de la section 3,
              veuillez contacter notre équipe de support à l'adresse suivante :{" "}
              <a
                href="mailto:support@mycampus.uscitechcongo.com"
                className="text-[#00ED64] font-bold hover:underline"
              >
                support@mycampus.uscitechcongo.com
              </a>
            </p>
            <p className="text-sm leading-relaxed">
              My Campus se réserve le droit de modifier la présente politique à
              tout moment. Les utilisateurs seront informés de toute
              modification significative via une notification dans l'application.
              L'utilisation continue de la plateforme après toute modification
              constitue une acceptation de la politique révisée.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
