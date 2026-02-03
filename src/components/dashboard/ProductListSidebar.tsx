"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import type { ComplianceData } from "@/lib/schema";

interface ProductEntry {
  data: ComplianceData;
  rawInput: string;
  productName: string;
}

interface ProductListSidebarProps {
  products: ProductEntry[];
  selectedIndex: number;
  onSelectProduct: (index: number) => void;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-50";
  if (score >= 50) return "bg-amber-50";
  return "bg-red-50";
}

export function ProductListSidebar({
  products,
  selectedIndex,
  onSelectProduct,
}: ProductListSidebarProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Package size={16} className="text-sky-500" />
          Products ({products.length})
        </h2>
        <p className="text-[10px] text-slate-400 mt-1">
          Click a product to view its compliance data
        </p>
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto">
        {products.map((product, idx) => {
          const isSelected = idx === selectedIndex;
          const score = product.data.meta_scoring.circularity_performance_score;
          const hasWarnings =
            product.data.agec_compliance.hazardous_substances.contains_svhc ||
            product.data.agec_compliance.material_analysis
              .microplastic_warning_required;

          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => onSelectProduct(idx)}
              className={`w-full text-left p-3 border-b border-slate-100 transition-all group ${
                isSelected
                  ? "bg-sky-50 border-l-2 border-l-sky-500"
                  : "hover:bg-slate-50 border-l-2 border-l-transparent"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Score indicator */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getScoreBg(
                    score
                  )}`}
                >
                  <span
                    className={`text-sm font-mono font-bold ${getScoreColor(
                      score
                    )}`}
                  >
                    {score}
                  </span>
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium truncate ${
                        isSelected ? "text-sky-700" : "text-slate-700"
                      }`}
                    >
                      {product.data.product_identity.name}
                    </span>
                    {hasWarnings && (
                      <AlertTriangle
                        size={12}
                        className="text-amber-500 flex-shrink-0"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {product.data.product_identity.sku && (
                      <Badge variant="secondary" className="text-[9px] px-1.5">
                        {product.data.product_identity.sku}
                      </Badge>
                    )}
                    {product.data.agec_compliance.recyclability
                      .is_majority_recyclable && (
                      <span title="Recyclable">
                        <CheckCircle2 size={10} className="text-emerald-500" />
                      </span>
                    )}
                  </div>

                  {/* Mini stats */}
                  <div className="flex items-center gap-3 mt-1.5 text-[9px] text-slate-400">
                    <span>
                      AGEC:{" "}
                      {product.data.meta_scoring.circularity_performance_score}%
                    </span>
                    <span>
                      Actions:{" "}
                      {product.data.meta_scoring.gap_analysis_advice.length}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight
                  size={14}
                  className={`flex-shrink-0 mt-3 transition-transform ${
                    isSelected
                      ? "text-sky-500 translate-x-0.5"
                      : "text-slate-300 group-hover:text-slate-400"
                  }`}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-emerald-600">
              {
                products.filter(
                  (p) =>
                    p.data.meta_scoring.circularity_performance_score >= 80
                ).length
              }
            </div>
            <div className="text-[9px] text-slate-400 uppercase">Conforme</div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-600">
              {
                products.filter(
                  (p) =>
                    p.data.meta_scoring.circularity_performance_score >= 50 &&
                    p.data.meta_scoring.circularity_performance_score < 80
                ).length
              }
            </div>
            <div className="text-[9px] text-slate-400 uppercase">Partiel</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">
              {
                products.filter(
                  (p) =>
                    p.data.meta_scoring.circularity_performance_score < 50
                ).length
              }
            </div>
            <div className="text-[9px] text-slate-400 uppercase">À revoir</div>
          </div>
        </div>
      </div>
    </div>
  );
}
