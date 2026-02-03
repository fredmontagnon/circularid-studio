"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AGECView } from "./AGECView";
// ScoreRing removed - scores shown in sidebar only
import { ISOView } from "./ISOView";
import { GapAnalysis } from "./GapAnalysis";
import { ProductListSidebar } from "./ProductListSidebar";
import {
  ArrowLeft,
  Download,
  Package,
  Scale,
  Globe,
  BookOpen,
  FileSpreadsheet,
} from "lucide-react";
import type { ComplianceData } from "@/lib/schema";

interface ProductEntry {
  data: ComplianceData;
  rawInput: string;
  productName: string;
}

interface BatchDashboardProps {
  products: ProductEntry[];
  onReset: () => void;
}

export function BatchDashboard({ products, onReset }: BatchDashboardProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedProduct = products[selectedIndex];

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

  if (!selectedProduct) return null;

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
            New Analysis
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-sky-500" />
            <span className="text-sm font-medium text-slate-700">
              Batch Analysis
            </span>
            <Badge variant="default" className="text-[10px]">
              {products.length} products
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
            Export All
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

        {/* Right Panel: Selected Product Detail */}
        <motion.div
          key={selectedIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50"
        >
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
              Export
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
            <AGECView data={selectedProduct.data.agec_compliance} />
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
            <ISOView data={selectedProduct.data.iso_59040_pcds} />
          </div>

          {/* Gap Analysis / Recommendations */}
          <div className="mb-6">
            <GapAnalysis scoring={selectedProduct.data.meta_scoring} />
          </div>

          {/* Raw Input Preview */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Original Input
              </span>
            </div>
            <pre className="text-xs text-slate-500 font-mono whitespace-pre-wrap max-h-24 overflow-auto">
              {selectedProduct.rawInput}
            </pre>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
