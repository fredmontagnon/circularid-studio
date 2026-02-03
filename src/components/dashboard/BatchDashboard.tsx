"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "./ScoreRing";
import { AGECView } from "./AGECView";
import { ISOView } from "./ISOView";
import { GapAnalysis } from "./GapAnalysis";
import { ProductListSidebar } from "./ProductListSidebar";
import {
  ArrowLeft,
  Download,
  Package,
  Globe,
  Scale,
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
        className="flex items-center justify-between px-6 py-4 border-b border-white/10"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-2">
            <ArrowLeft size={14} />
            New Analysis
          </Button>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-cyan-400" />
            <span className="text-sm font-medium text-white/80">
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
          className="w-80 flex-shrink-0 border-r border-white/10 bg-black/20"
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
          className="flex-1 overflow-y-auto px-6 py-6"
        >
          {/* Product Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white/90 flex items-center gap-2">
                <Package size={20} className="text-cyan-400" />
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

          {/* Score Rings */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-12">
              <ScoreRing
                score={selectedProduct.data.meta_scoring.data_completeness_score}
                label="Data Completeness"
                subtitle="How much data was extracted"
                size={160}
                delay={0}
              />
              <div className="h-24 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
              <ScoreRing
                score={
                  selectedProduct.data.meta_scoring.circularity_performance_score
                }
                label="Circularity Score"
                subtitle="Product circular performance"
                size={160}
                delay={200}
              />
            </div>
          </div>

          {/* Twin View Tabs */}
          <div className="mb-6">
            <Tabs defaultValue="agec" className="w-full">
              <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
                <TabsTrigger value="agec" className="gap-2">
                  <Scale size={14} />
                  AGEC Mode
                </TabsTrigger>
                <TabsTrigger value="iso" className="gap-2">
                  <Globe size={14} />
                  ISO Mode
                </TabsTrigger>
              </TabsList>

              <TabsContent value="agec">
                <AGECView data={selectedProduct.data.agec_compliance} />
              </TabsContent>

              <TabsContent value="iso">
                <ISOView data={selectedProduct.data.iso_59040_pcds} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Gap Analysis */}
          <div className="mb-6">
            <GapAnalysis scoring={selectedProduct.data.meta_scoring} />
          </div>

          {/* Raw Input Preview */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
                Original Input
              </span>
            </div>
            <pre className="text-xs text-white/25 font-mono whitespace-pre-wrap max-h-24 overflow-auto">
              {selectedProduct.rawInput}
            </pre>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
