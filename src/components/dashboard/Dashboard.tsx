"use client";

import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "./ScoreRing";
import { AGECView } from "./AGECView";
import { ISOView } from "./ISOView";
import { GapAnalysis } from "./GapAnalysis";
import {
  ArrowLeft,
  Download,
  Package,
  Globe,
  Scale,
} from "lucide-react";
import type { ComplianceData } from "@/lib/schema";

interface DashboardProps {
  data: ComplianceData;
  rawInput: string;
  onReset: () => void;
}

export function Dashboard({ data, rawInput, onReset }: DashboardProps) {
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `circularid-${data.product_identity.name
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
      className="w-full max-w-6xl mx-auto px-4"
    >
      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-2">
            <ArrowLeft size={14} />
            New Analysis
          </Button>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
              <Package size={18} className="text-cyan-400" />
              {data.product_identity.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              {data.product_identity.sku && (
                <Badge variant="secondary" className="text-[10px]">
                  SKU: {data.product_identity.sku}
                </Badge>
              )}
              {data.product_identity.gtin && (
                <Badge variant="secondary" className="text-[10px]">
                  GTIN: {data.product_identity.gtin}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportJSON} className="gap-2">
          <Download size={14} />
          Export JSON
        </Button>
      </motion.div>

      {/* Score Rings Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-8 mb-8"
      >
        <div className="flex items-center justify-center gap-16">
          <ScoreRing
            score={data.meta_scoring.data_completeness_score}
            label="Data Completeness"
            subtitle="How much data was extracted"
            size={200}
            delay={200}
          />
          <div className="h-32 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <ScoreRing
            score={data.meta_scoring.circularity_performance_score}
            label="Circularity Score"
            subtitle="Product circular performance"
            size={200}
            delay={600}
          />
        </div>
      </motion.div>

      {/* Twin View Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
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
            <AGECView data={data.agec_compliance} />
          </TabsContent>

          <TabsContent value="iso">
            <ISOView data={data.iso_59040_pcds} />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Gap Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <GapAnalysis scoring={data.meta_scoring} />
      </motion.div>

      {/* Raw Input Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="glass rounded-xl p-4 mb-12"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
            Original Input
          </span>
        </div>
        <pre className="text-xs text-white/25 font-mono whitespace-pre-wrap max-h-24 overflow-auto">
          {rawInput}
        </pre>
      </motion.div>
    </motion.div>
  );
}
