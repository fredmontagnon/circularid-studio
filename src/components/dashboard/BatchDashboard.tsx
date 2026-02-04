"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AGECView } from "./AGECView";
import { ISOView } from "./ISOView";
import { GapAnalysis } from "./GapAnalysis";
import { ProductListSidebar } from "./ProductListSidebar";
import { BatchSummary } from "./BatchSummary";
import {
  ArrowLeft,
  Download,
  Package,
  Scale,
  Globe,
  BookOpen,
  FileSpreadsheet,
} from "lucide-react";
import type { ComplianceData, AGECCompliance, ISO59040PCDS } from "@/lib/schema";

interface ProductEntry {
  data: ComplianceData;
  rawInput: string;
  productName: string;
}

interface BatchDashboardProps {
  products: ProductEntry[];
  onReset: () => void;
}

// Helper to recalculate scores after edits
function recalculateScores(data: ComplianceData): ComplianceData {
  const agec = data.agec_compliance;
  const iso = data.iso_59040_pcds;

  // Calculate data completeness (count non-null fields)
  let filledFields = 0;
  let totalFields = 0;

  // Traceability (3 fields)
  totalFields += 3;
  if (agec.traceability.weaving_knitting_country) filledFields++;
  if (agec.traceability.dyeing_printing_country) filledFields++;
  if (agec.traceability.manufacturing_country) filledFields++;

  // Material analysis (3 fields)
  totalFields += 3;
  filledFields += 3; // These are always filled (numbers)

  // Recyclability (2 fields: boolean + blockers array)
  totalFields += 2;
  filledFields += 2;

  // Hazardous substances (2 fields)
  totalFields += 2;
  filledFields += 2;

  // ISO 59040 (4 statements)
  totalFields += 4;
  filledFields += 4;

  const data_completeness_score = Math.round((filledFields / totalFields) * 100);

  // Calculate circularity performance score (AGEC based)
  let circularity_performance_score = 0;

  // Traceability: +10pts per country known (max 30)
  if (agec.traceability.weaving_knitting_country) circularity_performance_score += 10;
  if (agec.traceability.dyeing_printing_country) circularity_performance_score += 10;
  if (agec.traceability.manufacturing_country) circularity_performance_score += 10;

  // Recyclability: +25pts if recyclable
  if (agec.recyclability.is_majority_recyclable) circularity_performance_score += 25;

  // No SVHC: +20pts
  if (!agec.hazardous_substances.contains_svhc) circularity_performance_score += 20;

  // Recycled content: +10pts if >0%, +5pts bonus if >25%
  if (agec.material_analysis.recycled_content_percentage > 0) {
    circularity_performance_score += 10;
    if (agec.material_analysis.recycled_content_percentage > 25) {
      circularity_performance_score += 5;
    }
  }

  // No microplastic warning needed: +10pts
  if (!agec.material_analysis.microplastic_warning_required) {
    circularity_performance_score += 10;
  }

  // Generate gap analysis advice
  const gap_analysis_advice: string[] = [];

  if (!agec.traceability.weaving_knitting_country) {
    gap_analysis_advice.push("Traçabilité manquante: Documenter le pays de tissage/tricotage");
  }
  if (!agec.traceability.dyeing_printing_country) {
    gap_analysis_advice.push("Traçabilité manquante: Documenter le pays de teinture/impression");
  }
  if (!agec.traceability.manufacturing_country) {
    gap_analysis_advice.push("Traçabilité manquante: Documenter le pays de confection");
  }
  if (!agec.recyclability.is_majority_recyclable) {
    gap_analysis_advice.push("Recyclabilité: Revoir la conception pour permettre le recyclage fibre-à-fibre");
  }
  if (agec.hazardous_substances.contains_svhc) {
    gap_analysis_advice.push("SVHC détecté: Éliminer les substances préoccupantes de la formulation");
  }
  if (agec.material_analysis.microplastic_warning_required) {
    gap_analysis_advice.push("Microplastique: Réduire le % de fibres synthétiques sous 50%");
  }
  if (agec.material_analysis.recycled_content_percentage === 0) {
    gap_analysis_advice.push("Contenu recyclé: Intégrer des matières recyclées dans la composition");
  }

  return {
    ...data,
    meta_scoring: {
      data_completeness_score,
      circularity_performance_score,
      gap_analysis_advice,
    },
  };
}

export function BatchDashboard({ products: initialProducts, onReset }: BatchDashboardProps) {
  // Manage products state to allow editing
  const [products, setProducts] = useState<ProductEntry[]>(initialProducts);

  // null = show summary, number = show product detail
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedProduct = selectedIndex !== null ? products[selectedIndex] : null;

  // Handler for AGEC updates
  const handleAGECUpdate = (newAgecData: AGECCompliance) => {
    if (selectedIndex === null) return;

    const updatedProducts = [...products];
    const currentProduct = updatedProducts[selectedIndex];

    // Update AGEC data with recalculated microplastic warning
    const updatedData: ComplianceData = {
      ...currentProduct.data,
      agec_compliance: {
        ...newAgecData,
        material_analysis: {
          ...newAgecData.material_analysis,
          microplastic_warning_required:
            newAgecData.material_analysis.synthetic_fiber_percentage > 50,
        },
      },
    };

    // Also update ISO 59040 REACH compliance to match SVHC status
    updatedData.iso_59040_pcds = {
      ...updatedData.iso_59040_pcds,
      section_2_inputs: {
        ...updatedData.iso_59040_pcds.section_2_inputs,
        statement_2301_reach_compliant: !newAgecData.hazardous_substances.contains_svhc,
        statement_2503_post_consumer:
          newAgecData.material_analysis.recycled_content_percentage > 25,
      },
    };

    // Recalculate scores
    const recalculatedData = recalculateScores(updatedData);

    updatedProducts[selectedIndex] = {
      ...currentProduct,
      data: recalculatedData,
    };

    setProducts(updatedProducts);
  };

  // Handler for ISO 59040 updates
  const handleISOUpdate = (newIsoData: ISO59040PCDS) => {
    if (selectedIndex === null) return;

    const updatedProducts = [...products];
    const currentProduct = updatedProducts[selectedIndex];

    // Update ISO data
    const updatedData: ComplianceData = {
      ...currentProduct.data,
      iso_59040_pcds: newIsoData,
    };

    // Sync AGEC SVHC with REACH compliance
    if (newIsoData.section_2_inputs.statement_2301_reach_compliant !==
        !currentProduct.data.agec_compliance.hazardous_substances.contains_svhc) {
      updatedData.agec_compliance = {
        ...updatedData.agec_compliance,
        hazardous_substances: {
          ...updatedData.agec_compliance.hazardous_substances,
          contains_svhc: !newIsoData.section_2_inputs.statement_2301_reach_compliant,
        },
      };
    }

    // Recalculate scores
    const recalculatedData = recalculateScores(updatedData);

    updatedProducts[selectedIndex] = {
      ...currentProduct,
      data: recalculatedData,
    };

    setProducts(updatedProducts);
  };

  const handleExportAllJSON = () => {
    const exportData = products.map((p) => ({
      product_name: p.data.product_identity.name,
      compliance_data: p.data,
      raw_input: p.rawInput,
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arianee-pcds-batch-${products.length}-products.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSelectedJSON = () => {
    if (!selectedProduct) return;
    const blob = new Blob([JSON.stringify(selectedProduct.data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arianee-pcds-${selectedProduct.data.product_identity.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-compliance.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-[calc(100vh-4rem)]"
    >
      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-2">
            <ArrowLeft size={14} />
            Nouvelle analyse
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-sky-500" />
            <span className="text-sm font-medium text-slate-700">
              Analyse par lot
            </span>
            <Badge variant="default" className="text-[10px]">
              {products.length} produits
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/nomenclature">
            <Button variant="outline" size="sm" className="gap-2">
              <BookOpen size={14} />
              Nomenclature
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAllJSON}
            className="gap-2"
          >
            <Download size={14} />
            Exporter tout
          </Button>
        </div>
      </motion.div>

      {/* Split View Container */}
      <div className="flex h-[calc(100%-4rem)]">
        {/* Left Panel: Product List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-80 flex-shrink-0 border-r border-slate-200 bg-white"
        >
          <ProductListSidebar
            products={products}
            selectedIndex={selectedIndex}
            onSelectProduct={setSelectedIndex}
          />
        </motion.div>

        {/* Right Panel: Summary or Product Detail */}
        <motion.div
          key={selectedIndex ?? "summary"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto bg-slate-50"
        >
          {selectedIndex === null ? (
            // Summary View
            <BatchSummary products={products} />
          ) : selectedProduct ? (
            // Product Detail View
            <div className="px-6 py-6">
              {/* Product Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <Package size={20} className="text-sky-500" />
                    {selectedProduct.data.product_identity.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedProduct.data.product_identity.sku && (
                      <Badge variant="secondary" className="text-[10px]">
                        SKU: {selectedProduct.data.product_identity.sku}
                      </Badge>
                    )}
                    {selectedProduct.data.product_identity.gtin && (
                      <Badge variant="secondary" className="text-[10px]">
                        GTIN: {selectedProduct.data.product_identity.gtin}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportSelectedJSON}
                  className="gap-2"
                >
                  <Download size={14} />
                  Exporter
                </Button>
              </div>

              {/* AGEC Compliance Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Scale size={18} className="text-sky-500" />
                  <h3 className="text-lg font-semibold text-slate-700">
                    Conformité AGEC
                  </h3>
                  <Badge variant="secondary" className="text-[10px]">
                    Loi française
                  </Badge>
                </div>
                <AGECView
                  data={selectedProduct.data.agec_compliance}
                  onUpdate={handleAGECUpdate}
                  editable={true}
                />
              </div>

              {/* ISO 59040 PCDS Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Globe size={18} className="text-emerald-500" />
                  <h3 className="text-lg font-semibold text-slate-700">
                    ISO 59040 PCDS
                  </h3>
                  <Badge variant="secondary" className="text-[10px]">
                    Standard international
                  </Badge>
                </div>
                <ISOView
                  data={selectedProduct.data.iso_59040_pcds}
                  onUpdate={handleISOUpdate}
                  editable={true}
                />
              </div>

              {/* Gap Analysis / Recommendations */}
              <div className="mb-6">
                <GapAnalysis scoring={selectedProduct.data.meta_scoring} />
              </div>

              {/* Raw Input Preview */}
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Données source
                  </span>
                </div>
                <pre className="text-xs text-slate-500 font-mono whitespace-pre-wrap max-h-24 overflow-auto">
                  {selectedProduct.rawInput}
                </pre>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </motion.div>
  );
}
