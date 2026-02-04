"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "fr";

interface Translations {
  // Homepage
  appTitle: string;
  appSubtitle: string;
  pasteFromClipboard: string;
  uploadCsvTxt: string;
  analyze: string;
  analyzing: string;
  poweredBy: string;
  nomenclatureButton: string;
  dropzonePlaceholder: string;
  or: string;

  // Scanning animation
  scanningTitle: string;
  processingProducts: string;
  parsingInput: string;
  extractingMaterials: string;
  checkingAgec: string;
  validatingIso: string;
  computingScore: string;

  // Dashboard
  batchAnalysis: string;
  products: string;
  newAnalysis: string;
  nomenclature: string;
  exportAll: string;
  export: string;
  globalSummary: string;
  clickProductToView: string;
  sourceData: string;

  // AGEC View
  agecCompliance: string;
  frenchLaw: string;
  traceability: string;
  agecArt13: string;
  weavingKnitting: string;
  dyeingPrinting: string;
  manufacturing: string;
  recyclability: string;
  fiveCriteria: string;
  majorityRecyclable: string;
  blockersDetected: string;
  noBlockersDetected: string;
  materialAnalysis: string;
  syntheticFiber: string;
  recycledContent: string;
  microplasticWarning: string;
  hazardousSubstances: string;
  reachSvhc: string;
  containsSvhc: string;
  noSvhcDetected: string;
  missing: string;
  modify: string;
  save: string;
  cancel: string;

  // ISO View
  iso59040Pcds: string;
  internationalStandard: string;
  section2CircularInputs: string;
  section3BetterUse: string;
  section5EndOfLife: string;
  postConsumerRecycled: string;
  postConsumerRecycledDesc: string;
  reachCompliant: string;
  reachCompliantDesc: string;
  repairableByNonExpert: string;
  repairableByNonExpertDesc: string;
  closedLoopDesign: string;
  closedLoopDesignDesc: string;
  statementsMet: string;
  goodStanding: string;
  needsImprovement: string;

  // Gap Analysis
  gapAnalysis: string;
  recommendations: string;
  dataCompleteness: string;
  circularityScore: string;
  agecScore: string;

  // Batch Summary
  productsAnalyzed: string;
  avgAgecScore: string;
  compliant: string;
  toReview: string;
  scoreDistribution: string;
  partial: string;
  globalSynthesis: string;
  generatedByAi: string;
  strengths: string;
  areasForImprovement: string;
  priorityActionPlan: string;
  toReach100: string;
  incompleteTraceability: string;
  notRecyclable: string;
  microplasticWarningShort: string;
  pcdsCompleteness: string;
  recycledOver25: string;
  repairable: string;
  closedLoop: string;
  detailsAgec: string;
  detailsIso: string;
  eolDefined: string;
  repairAvailable: string;
  recycledContentOver0: string;
  reachCompliantShort: string;

  // Nomenclature page
  nomenclatureTitle: string;
  nomenclatureSubtitle: string;
  agecSection: string;
  isoSection: string;
  scoringSection: string;
  backToAnalysis: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Homepage
    appTitle: "PCDS & AGEC Analyser",
    appSubtitle: "Drop any textile data — supplier emails, PDF content, raw descriptions — and watch it transform into dual-compliance structured data.",
    pasteFromClipboard: "Paste from Clipboard",
    uploadCsvTxt: "Upload CSV / TXT",
    analyze: "Analyze",
    analyzing: "Analyzing...",
    poweredBy: "Powered by Claude AI — ISO 59040 + AGEC dual-compliance engine",
    nomenclatureButton: "Nomenclature and AGEC & PCDS scoring",
    dropzonePlaceholder: "Paste your textile product data here...\n\nExamples:\n• Supplier email content\n• PDF text extraction\n• Raw product descriptions\n• Material composition sheets",
    or: "OR",

    // Scanning animation
    scanningTitle: "PCDS & AGEC Analyser",
    processingProducts: "Processing {count} products...",
    parsingInput: "Parsing raw input...",
    extractingMaterials: "Extracting material composition...",
    checkingAgec: "Checking AGEC compliance...",
    validatingIso: "Validating ISO 59040 PCDS...",
    computingScore: "Computing circularity score...",

    // Dashboard
    batchAnalysis: "Batch Analysis",
    products: "products",
    newAnalysis: "New Analysis",
    nomenclature: "Nomenclature",
    exportAll: "Export All",
    export: "Export",
    globalSummary: "Global Summary",
    clickProductToView: "Click a product to view its compliance data",
    sourceData: "Source Data",

    // AGEC View
    agecCompliance: "AGEC Compliance",
    frenchLaw: "French Law",
    traceability: "Traceability",
    agecArt13: "AGEC Art. 13",
    weavingKnitting: "Weaving / Knitting",
    dyeingPrinting: "Dyeing / Printing",
    manufacturing: "Manufacturing",
    recyclability: "Recyclability",
    fiveCriteria: "5 criteria",
    majorityRecyclable: "Majority Recyclable",
    blockersDetected: "BLOCKERS DETECTED:",
    noBlockersDetected: "No recycling blockers detected",
    materialAnalysis: "Material Analysis",
    syntheticFiber: "Synthetic Fiber",
    recycledContent: "Recycled Content",
    microplasticWarning: "Microplastic warning label required (synthetic > 50%)",
    hazardousSubstances: "Hazardous Substances",
    reachSvhc: "REACH / SVHC",
    containsSvhc: "Contains SVHC",
    noSvhcDetected: "No SVHC detected above 0.1% threshold",
    missing: "MISSING",
    modify: "Edit",
    save: "Save",
    cancel: "Cancel",

    // ISO View
    iso59040Pcds: "ISO 59040 PCDS",
    internationalStandard: "International Standard",
    section2CircularInputs: "Section 2 — Circular Inputs",
    section3BetterUse: "Section 3 — Better Use",
    section5EndOfLife: "Section 5 — End of Life",
    postConsumerRecycled: "Post-Consumer Recycled Content",
    postConsumerRecycledDesc: "Product contains >25% post-consumer recycled material",
    reachCompliant: "REACH Compliant",
    reachCompliantDesc: "No Substances of Very High Concern above 0.1% threshold",
    repairableByNonExpert: "Repairable by Non-Expert",
    repairableByNonExpertDesc: "Product is designed so a regular consumer can repair it",
    closedLoopDesign: "Closed-Loop Design",
    closedLoopDesignDesc: "Designed for fiber-to-fiber recycling (mono-material or easily separable)",
    statementsMet: "Statements Met:",
    goodStanding: "Good Standing",
    needsImprovement: "Needs Improvement",

    // Gap Analysis
    gapAnalysis: "Gap Analysis",
    recommendations: "Recommendations",
    dataCompleteness: "Data Completeness",
    circularityScore: "Circularity Score",
    agecScore: "AGEC Score",

    // Batch Summary
    productsAnalyzed: "Products Analyzed",
    avgAgecScore: "Avg AGEC Score",
    compliant: "Compliant (≥80%)",
    toReview: "To Review (<50%)",
    scoreDistribution: "Score Distribution",
    partial: "Partial",
    globalSynthesis: "Global Synthesis",
    generatedByAi: "Generated by Claude AI",
    strengths: "Strengths",
    areasForImprovement: "Areas for Improvement",
    priorityActionPlan: "Priority Action Plan",
    toReach100: "To reach 100%",
    incompleteTraceability: "Incomplete Traceability",
    notRecyclable: "Not Recyclable",
    microplasticWarningShort: "Microplastic Warning",
    pcdsCompleteness: "PCDS Completeness",
    recycledOver25: "§2503 Recycled >25%",
    repairable: "§3000 Repairable",
    closedLoop: "§5032 Closed Loop",
    detailsAgec: "AGEC Details",
    detailsIso: "ISO 59040 PCDS Details",
    eolDefined: "§5032 End of Life Defined",
    repairAvailable: "§3000 Repair Available",
    recycledContentOver0: "Recycled Content >0%",
    reachCompliantShort: "§2301 REACH Compliant",

    // Nomenclature page
    nomenclatureTitle: "AGEC & ISO 59040 Nomenclature",
    nomenclatureSubtitle: "Reference guide for textile compliance standards",
    agecSection: "AGEC Compliance (French Law)",
    isoSection: "ISO 59040 PCDS (International)",
    scoringSection: "Scoring Methodology",
    backToAnalysis: "Back to Analysis",
  },
  fr: {
    // Homepage
    appTitle: "PCDS & AGEC Analyser",
    appSubtitle: "Déposez vos données textiles — emails fournisseurs, contenu PDF, descriptions brutes — et transformez-les en données structurées conformes.",
    pasteFromClipboard: "Coller depuis le presse-papiers",
    uploadCsvTxt: "Charger CSV / TXT",
    analyze: "Analyser",
    analyzing: "Analyse en cours...",
    poweredBy: "Propulsé par Claude AI — Moteur de conformité ISO 59040 + AGEC",
    nomenclatureButton: "Nomenclature et score AGEC et PCDS",
    dropzonePlaceholder: "Collez vos données produit textile ici...\n\nExemples:\n• Contenu d'email fournisseur\n• Extraction de texte PDF\n• Descriptions produit brutes\n• Fiches de composition matière",
    or: "OU",

    // Scanning animation
    scanningTitle: "PCDS & AGEC Analyser",
    processingProducts: "Traitement de {count} produits...",
    parsingInput: "Analyse des données brutes...",
    extractingMaterials: "Extraction de la composition...",
    checkingAgec: "Vérification conformité AGEC...",
    validatingIso: "Validation ISO 59040 PCDS...",
    computingScore: "Calcul du score de circularité...",

    // Dashboard
    batchAnalysis: "Analyse par lot",
    products: "produits",
    newAnalysis: "Nouvelle analyse",
    nomenclature: "Nomenclature",
    exportAll: "Exporter tout",
    export: "Exporter",
    globalSummary: "Résumé global",
    clickProductToView: "Cliquez sur un produit pour voir sa fiche",
    sourceData: "Données source",

    // AGEC View
    agecCompliance: "Conformité AGEC",
    frenchLaw: "Loi française",
    traceability: "Traçabilité",
    agecArt13: "AGEC Art. 13",
    weavingKnitting: "Tissage / Tricotage",
    dyeingPrinting: "Teinture / Impression",
    manufacturing: "Confection",
    recyclability: "Recyclabilité",
    fiveCriteria: "5 critères",
    majorityRecyclable: "Majoritairement recyclable",
    blockersDetected: "BLOQUANTS DÉTECTÉS:",
    noBlockersDetected: "Aucun bloquant de recyclage détecté",
    materialAnalysis: "Analyse matières",
    syntheticFiber: "Fibres synthétiques",
    recycledContent: "Contenu recyclé",
    microplasticWarning: "Étiquette microplastique requise (synthétique > 50%)",
    hazardousSubstances: "Substances dangereuses",
    reachSvhc: "REACH / SVHC",
    containsSvhc: "Contient SVHC",
    noSvhcDetected: "Aucun SVHC détecté au-dessus du seuil de 0.1%",
    missing: "MANQUANT",
    modify: "Modifier",
    save: "Enregistrer",
    cancel: "Annuler",

    // ISO View
    iso59040Pcds: "ISO 59040 PCDS",
    internationalStandard: "Standard international",
    section2CircularInputs: "Section 2 — Entrées circulaires",
    section3BetterUse: "Section 3 — Meilleur usage",
    section5EndOfLife: "Section 5 — Fin de vie",
    postConsumerRecycled: "Contenu recyclé post-consommation",
    postConsumerRecycledDesc: "Le produit contient >25% de matière recyclée post-consommation",
    reachCompliant: "Conformité REACH",
    reachCompliantDesc: "Aucune substance extrêmement préoccupante au-dessus du seuil de 0.1%",
    repairableByNonExpert: "Réparable par non-expert",
    repairableByNonExpertDesc: "Le produit est conçu pour être réparé par un consommateur standard",
    closedLoopDesign: "Design boucle fermée",
    closedLoopDesignDesc: "Conçu pour le recyclage fibre-à-fibre (mono-matière ou facilement séparable)",
    statementsMet: "Déclarations validées:",
    goodStanding: "Bon niveau",
    needsImprovement: "À améliorer",

    // Gap Analysis
    gapAnalysis: "Analyse des écarts",
    recommendations: "Recommandations",
    dataCompleteness: "Complétude des données",
    circularityScore: "Score de circularité",
    agecScore: "Score AGEC",

    // Batch Summary
    productsAnalyzed: "Produits analysés",
    avgAgecScore: "Score AGEC moyen",
    compliant: "Conformes (≥80%)",
    toReview: "À revoir (<50%)",
    scoreDistribution: "Répartition des scores",
    partial: "Partiel",
    globalSynthesis: "Synthèse globale",
    generatedByAi: "Généré par Claude AI",
    strengths: "Points forts",
    areasForImprovement: "Points d'amélioration",
    priorityActionPlan: "Plan d'action prioritaire",
    toReach100: "Pour atteindre 100%",
    incompleteTraceability: "Traçabilité incomplète",
    notRecyclable: "Non recyclables",
    microplasticWarningShort: "Avert. microplastique",
    pcdsCompleteness: "Complétude PCDS",
    recycledOver25: "§2503 Recyclé >25%",
    repairable: "§3000 Réparable",
    closedLoop: "§5032 Boucle fermée",
    detailsAgec: "Détails AGEC",
    detailsIso: "Détails ISO 59040 PCDS",
    eolDefined: "Fin de vie définie",
    repairAvailable: "Réparation disponible",
    recycledContentOver0: "Contenu recyclé >0%",
    reachCompliantShort: "§2301 REACH conforme",

    // Nomenclature page
    nomenclatureTitle: "Nomenclature AGEC & ISO 59040",
    nomenclatureSubtitle: "Guide de référence pour les normes de conformité textile",
    agecSection: "Conformité AGEC (Loi française)",
    isoSection: "ISO 59040 PCDS (International)",
    scoringSection: "Méthodologie de scoring",
    backToAnalysis: "Retour à l'analyse",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
