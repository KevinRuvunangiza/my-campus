// src/components/screens/public/PrivacyPolicy.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiShield } from "react-icons/fi";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0A222F] text-slate-300 py-12 px-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#00ED64] hover:underline text-sm font-bold"
        >
          <FiArrowLeft /> Retour à l'accueil
        </Link>

        <div className="bg-[#162C3D] p-8 rounded-3xl border border-[#3D4F58]/50 shadow-xl space-y-6">
          <div className="flex items-center gap-4 border-b border-[#3D4F58]/50 pb-6">
            <div className="w-12 h-12 bg-[#00684A] text-[#00ED64] rounded-2xl flex items-center justify-center">
              <FiShield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">
                Politique de Confidentialité
              </h1>
              <p className="text-sm text-slate-400">
                Dernière mise à jour : Juillet 2026
              </p>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">
              1. Collecte des Données
            </h2>
            <p className="text-sm leading-relaxed">
              Pour assurer le bon fonctionnement de <strong>My Campus</strong>{" "}
              (USCITECH), nous collectons vos nom, prénom, adresse e-mail, et
              votre numéro de téléphone (Mobile Money). Ces données sont
              indispensables pour l'authentification et le traitement sécurisé
              de vos paiements en ligne.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">
              2. Protection Anti-Piratage (DRM)
            </h2>
            <p className="text-sm leading-relaxed">
              Votre identité (Nom complet et Numéro de téléphone) est utilisée
              dynamiquement pour générer un filigrane numérique sur les
              documents PDF protégés que vous débloquez. Ce processus permet de
              protéger la propriété intellectuelle des professeurs en RDC et de
              dissuader la diffusion illicite des supports de cours.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">
              3. Suppression des Données
            </h2>
            <p className="text-sm leading-relaxed">
              Conformément à la réglementation sur la protection des données,
              vous disposez d'un droit d'accès, de rectification et de
              suppression. Vous pouvez supprimer définitivement votre compte et
              l'intégralité de vos données associées à tout moment depuis
              l'onglet "Profil" de votre application.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">
              4. Sécurité de l'Infrastructure
            </h2>
            <p className="text-sm leading-relaxed">
              Nos bases de données sont hébergées sur une infrastructure cloud
              sécurisée (Supabase). Aucun mot de passe n'est stocké en clair.
              Les transactions financières sont déléguées à notre partenaire de
              paiement agréé (Malipo / FlexPay), garantissant que vos codes PIN
              USSD ne transitent jamais par nos serveurs.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
