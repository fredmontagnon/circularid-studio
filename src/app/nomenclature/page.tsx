"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Scale,
  Globe,
  BookOpen,
  FileText,
  ShieldCheck,
  Recycle,
  MapPin,
  FlaskConical,
  AlertTriangle,
  Wrench,
  RotateCcw,
  Package,
  ExternalLink,
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
};

function SectionCard({
  icon: Icon,
  iconColor,
  title,
  badge,
  children,
  delay = 0,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  badge?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div {...fadeIn} transition={{ delay }}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Icon size={16} className={iconColor} />
            <span className="text-slate-700">{title}</span>
            {badge && (
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {badge}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-600 leading-relaxed">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FieldRow({
  field,
  type,
  description,
}: {
  field: string;
  type: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 py-2 border-b border-slate-100 last:border-0">
      <div className="min-w-0 flex-1">
        <code className="text-[10px] font-mono text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
          {field}
        </code>
        <p className="mt-1 text-slate-500">{description}</p>
      </div>
      <Badge variant="secondary" className="text-[9px] h-fit flex-shrink-0">
        {type}
      </Badge>
    </div>
  );
}

export default function NomenclaturePage() {
  return (
    <main className="min-h-screen relative bg-slate-50">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div {...fadeIn} className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft size={14} />
                Retour
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            <BookOpen
              size={28}
              className="inline-block text-sky-500 mr-3 -mt-1"
            />
            <span className="bg-gradient-to-r from-sky-600 via-violet-600 to-sky-500 bg-clip-text text-transparent">
              Nomenclature des Standards
            </span>
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl">
            Guide de référence des deux cadres de conformité utilisés par Arianee
            PCDS Cleaner : la Loi AGEC française et la norme internationale ISO
            59040 pour les fiches de données de circularité produit.
          </p>
        </motion.div>

        {/* ============================================================ */}
        {/*  AGEC LAW SECTION                                            */}
        {/* ============================================================ */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Scale size={22} className="text-violet-500" />
            <h2 className="text-xl font-semibold text-slate-800">
              Loi AGEC (Anti-Gaspillage pour une Économie Circulaire)
            </h2>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6 text-xs text-slate-600 leading-relaxed">
            <p>
              Loi française n°2020-105 (10 février 2020) visant à éliminer les
              déchets et promouvoir une économie circulaire. Pour les produits
              textiles, elle impose une traçabilité obligatoire, une évaluation
              de la recyclabilité, une déclaration des matériaux et un
              étiquetage des substances dangereuses. Applicable depuis le 1er
              janvier 2023.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <SectionCard
            icon={MapPin}
            iconColor="text-sky-500"
            title="Traçabilité (Art. 13)"
            badge="AGEC"
            delay={0.15}
          >
            <p>
              Traçabilité géographique obligatoire pour 3 étapes clés de
              production. Chaque étape doit être identifiée par son code pays
              ISO 3166-1 alpha-2.
            </p>
            <FieldRow
              field="weaving_knitting_country"
              type="ISO 3166-1"
              description="Pays où le tissu a été tissé ou tricoté. Pour les chaussures : pays de piquage."
            />
            <FieldRow
              field="dyeing_printing_country"
              type="ISO 3166-1"
              description="Pays où le tissu a été teint, imprimé ou fini. Pour les chaussures : pays de finition."
            />
            <FieldRow
              field="manufacturing_country"
              type="ISO 3166-1"
              description="Pays où le vêtement final a été coupé, cousu et assemblé. Pour les chaussures : assemblage final."
            />
          </SectionCard>

          <SectionCard
            icon={Recycle}
            iconColor="text-emerald-500"
            title="Recyclabilité (5 Critères Français)"
            badge="AGEC"
            delay={0.2}
          >
            <p>
              Un produit est considéré recyclable uniquement si les 5 critères
              sont simultanément remplis :
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-500">
              <li>
                <strong className="text-slate-700">Collecte</strong> — Une
                infrastructure de collecte existe pour cette catégorie de
                produit (ex: bornes textile en France via Re_fashion).
              </li>
              <li>
                <strong className="text-slate-700">Tri</strong> — Une
                infrastructure de tri industriel est en place et opérationnelle.
              </li>
              <li>
                <strong className="text-slate-700">Pas de perturbateurs</strong>{" "}
                — Le produit ne contient pas d&apos;éléments bloquant le recyclage :
                élasthanne &gt;3%, accessoires métal/plastique inséparables,
                matériaux multicouches collés, enductions lourdes.
              </li>
              <li>
                <strong className="text-slate-700">Rendement &gt;50%</strong> —
                Le processus de recyclage doit récupérer plus de 50% du poids du
                produit en matière utilisable.
              </li>
              <li>
                <strong className="text-slate-700">Échelle industrielle</strong>{" "}
                — La filière de recyclage doit fonctionner à échelle
                industrielle, pas seulement pilote ou laboratoire.
              </li>
            </ol>
            <FieldRow
              field="is_majority_recyclable"
              type="Boolean"
              description="Vrai uniquement si les 5 critères ci-dessus sont satisfaits."
            />
            <FieldRow
              field="blockers"
              type="String[]"
              description="Liste des perturbateurs de recyclage détectés (ex: 'Élasthanne 5%', 'Fermetures métal non séparables')."
            />
          </SectionCard>

          <SectionCard
            icon={FlaskConical}
            iconColor="text-violet-500"
            title="Analyse des Matériaux"
            badge="AGEC"
            delay={0.25}
          >
            <p>
              Déclaration obligatoire de la composition en fibres, incluant le
              contenu synthétique et les obligations d&apos;avertissement
              microplastiques.
            </p>
            <FieldRow
              field="synthetic_fiber_percentage"
              type="Number"
              description="% total de fibres synthétiques (polyester, nylon, acrylique, polypropylène, élasthanne). Inclut toutes les fibres dérivées du pétrole."
            />
            <FieldRow
              field="microplastic_warning_required"
              type="Boolean"
              description="Si les fibres synthétiques dépassent 50%, le produit DOIT porter une étiquette d'avertissement sur le relargage de microplastiques selon l'article L541-9-3 AGEC."
            />
            <FieldRow
              field="recycled_content_percentage"
              type="Number"
              description="% du produit fabriqué à partir de matériaux recyclés (post-consommation ou post-industriel). 0 si aucun ou inconnu."
            />
          </SectionCard>

          <SectionCard
            icon={AlertTriangle}
            iconColor="text-amber-500"
            title="Substances Dangereuses (REACH / SVHC)"
            badge="AGEC + UE"
            delay={0.3}
          >
            <p>
              Référence croisée avec le règlement REACH de l&apos;UE (CE 1907/2006).
              Les produits contenant des Substances Très Préoccupantes (SVHC)
              au-dessus de 0,1% m/m doivent être déclarés.
            </p>
            <FieldRow
              field="contains_svhc"
              type="Boolean"
              description="Vrai si une SVHC est présente au-dessus du seuil de 0,1%. SVHC textiles courantes : nickel (fermetures, rivets), plomb, chrome VI, formaldéhyde, PFAS (traitements hydrofuges), phtalates, certains colorants azoïques, trioxyde d'antimoine."
            />
            <FieldRow
              field="substance_names"
              type="String[]"
              description="Liste des substances SVHC spécifiques détectées ou fortement suggérées par la description du produit."
            />
            <div className="mt-2 p-2 rounded bg-amber-50 border border-amber-200 text-amber-700">
              <strong>Liste Candidate ECHA</strong> : L&apos;Agence européenne des
              produits chimiques maintient la liste officielle des SVHC
              candidates, mise à jour semestriellement. Actuellement 240+
              substances.
            </div>
          </SectionCard>
        </div>

        {/* ============================================================ */}
        {/*  ISO 59040 SECTION                                           */}
        {/* ============================================================ */}
        <motion.div {...fadeIn} transition={{ delay: 0.35 }} className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe size={22} className="text-emerald-500" />
            <h2 className="text-xl font-semibold text-slate-800">
              ISO 59040 — Fiche de Données de Circularité Produit (PCDS)
            </h2>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6 text-xs text-slate-600 leading-relaxed">
            <p>
              ISO 59040:2024 définit un cadre standardisé pour communiquer les
              informations de circularité des produits tout au long de la chaîne
              de valeur. Elle utilise un système de « Déclarations » organisé en
              6 sections couvrant le cycle de vie complet du produit : Entrées,
              Meilleur Usage, Récupération de Valeur, Fin de Vie et Sorties.
            </p>
          </div>
        </motion.div>

        <div className="space-y-4 mb-12">
          <SectionCard
            icon={Package}
            iconColor="text-sky-500"
            title="Section 2 — Entrées Circulaires"
            badge="ISO 59040"
            delay={0.4}
          >
            <p>
              Évalue le caractère circulaire des matières premières utilisées
              dans le produit.
            </p>
            <FieldRow
              field="statement_2503_post_consumer"
              type="Boolean"
              description="Déclaration PCDS 2503 : Le produit contient >25% de contenu recyclé post-consommation. Post-consommation = matériau provenant de flux de déchets d'utilisateurs finaux (vêtements usagés, textiles collectés). Distinct du post-industriel (chutes d'usine)."
            />
            <FieldRow
              field="statement_2301_reach_compliant"
              type="Boolean"
              description="Déclaration PCDS 2301 : Le produit est entièrement conforme REACH sans SVHC détectée au-dessus du seuil de 0,1%. C'est la porte d'entrée sécurité chimique pour les entrées circulaires."
            />
          </SectionCard>

          <SectionCard
            icon={Wrench}
            iconColor="text-violet-500"
            title="Section 3 — Meilleur Usage (Longévité)"
            badge="ISO 59040"
            delay={0.45}
          >
            <p>
              Mesure si le produit est conçu pour un usage prolongé grâce à sa
              réparabilité.
            </p>
            <FieldRow
              field="statement_3000_repairable"
              type="Boolean"
              description="Déclaration PCDS 3000 : Le produit est conçu pour qu'un consommateur non-expert puisse le réparer. Évalué par : boutons/fermetures remplaçables, coutures accessibles, disponibilité de kits de réparation, construction modulaire, instructions de réparation incluses."
            />
          </SectionCard>

          <SectionCard
            icon={RotateCcw}
            iconColor="text-emerald-500"
            title="Section 5 — Fin de Vie"
            badge="ISO 59040"
            delay={0.5}
          >
            <p>
              Évalue si le produit est conçu pour réintégrer le cycle des
              matériaux en fin de vie.
            </p>
            <FieldRow
              field="statement_5032_closed_loop"
              type="Boolean"
              description="Déclaration PCDS 5032 : Le produit est conçu pour le recyclage fibre-à-fibre (boucle fermée). Requiert : composition mono-matière OU composants facilement séparables, pas de perturbateurs chimiques, compatible avec l'infrastructure de recyclage existante. Les produits multi-matériaux avec élasthanne, enductions ou couches collées échouent à ce critère."
            />
          </SectionCard>
        </div>

        {/* ============================================================ */}
        {/*  SCORING METHODOLOGY                                         */}
        {/* ============================================================ */}
        <motion.div {...fadeIn} transition={{ delay: 0.55 }} className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={22} className="text-amber-500" />
            <h2 className="text-xl font-semibold text-slate-800">
              Méthodologie de Scoring
            </h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <SectionCard
            icon={FileText}
            iconColor="text-sky-500"
            title="Score de Complétude des Données"
            badge="0-100"
            delay={0.6}
          >
            <p>
              Mesure la quantité de données extraites avec succès de l&apos;entrée
              non structurée.
            </p>
            <div className="bg-slate-50 rounded-md p-3 font-mono text-[10px] text-slate-600">
              <p className="text-slate-700 mb-1">Formule :</p>
              <p>score = (champs_remplis / champs_totaux) × 100</p>
              <p className="mt-2 text-slate-700">Champs suivis :</p>
              <p>
                name, gtin, sku, weaving_country, dyeing_country,
                manufacturing_country, synthetic_%, recycled_%, svhc_status
              </p>
            </div>
          </SectionCard>

          <SectionCard
            icon={Recycle}
            iconColor="text-emerald-500"
            title="Score de Conformité AGEC"
            badge="0-100"
            delay={0.65}
          >
            <p>
              Score pondéré reflétant la conformité réglementaire du produit.
            </p>
            <div className="bg-slate-50 rounded-md p-3 space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Traçabilité complète (3/3 pays)
                </span>
                <span className="text-emerald-600 font-mono">+30 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Recyclabilité conforme (5 critères)
                </span>
                <span className="text-emerald-600 font-mono">+25 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pas de substances SVHC</span>
                <span className="text-emerald-600 font-mono">+20 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Contenu recyclé présent (&gt;0%)
                </span>
                <span className="text-emerald-600 font-mono">+15 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Bonus si contenu recyclé &gt;25%
                </span>
                <span className="text-emerald-600 font-mono">+10 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Pas d&apos;avertissement microplastique
                </span>
                <span className="text-emerald-600 font-mono">+10 pts</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1.5">
                <span className="text-slate-700 font-semibold">Maximum</span>
                <span className="text-slate-700 font-mono font-semibold">
                  100 pts
                </span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* External References */}
        <motion.div
          {...fadeIn}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl border border-slate-200 p-6 mb-12"
        >
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <ExternalLink size={14} className="text-sky-500" />
            Références Officielles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-2 text-slate-500">
              <p className="text-slate-700 font-semibold">Loi AGEC</p>
              <p>
                Loi n°2020-105 du 10 février 2020 relative à la lutte contre le
                gaspillage et à l&apos;économie circulaire
              </p>
              <p>Décret n°2022-748 — Traçabilité textile</p>
              <p>
                Re_fashion (anciennement Eco-TLC) — Éco-organisme textile
                français
              </p>
            </div>
            <div className="space-y-2 text-slate-500">
              <p className="text-slate-700 font-semibold">ISO 59040</p>
              <p>
                ISO 59040:2024 — Économie circulaire — Fiche de données de
                circularité produit
              </p>
              <p>
                Règlement REACH (CE) n°1907/2006 — Liste Candidate SVHC ECHA
              </p>
              <p>ISO 3166-1 — Codes pays (alpha-2)</p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
