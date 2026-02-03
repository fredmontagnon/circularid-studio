"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Lightbulb,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import type { MetaScoring } from "@/lib/schema";

interface GapAnalysisProps {
  scoring: MetaScoring;
}

function getAdviceIcon(advice: string) {
  if (advice.toLowerCase().includes("missing")) return AlertCircle;
  if (advice.toLowerCase().includes("improve") || advice.toLowerCase().includes("increase"))
    return TrendingUp;
  return Lightbulb;
}

function getAdvicePriority(advice: string): "high" | "medium" | "low" {
  const lower = advice.toLowerCase();
  if (
    lower.includes("traceability") ||
    lower.includes("svhc") ||
    lower.includes("hazardous") ||
    lower.includes("country")
  ) {
    return "high";
  }
  if (
    lower.includes("recycl") ||
    lower.includes("composition") ||
    lower.includes("material")
  ) {
    return "medium";
  }
  return "low";
}

const priorityColors = {
  high: {
    border: "border-red-200",
    bg: "bg-red-50",
    hover: "hover:border-red-300 hover:bg-red-100",
    icon: "text-red-500",
    badge: "bg-red-100 text-red-700",
  },
  medium: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    hover: "hover:border-amber-300 hover:bg-amber-100",
    icon: "text-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  low: {
    border: "border-sky-200",
    bg: "bg-sky-50",
    hover: "hover:border-sky-300 hover:bg-sky-100",
    icon: "text-sky-500",
    badge: "bg-sky-100 text-sky-700",
  },
};

export function GapAnalysis({ scoring }: GapAnalysisProps) {
  const sortedAdvice = [...scoring.gap_analysis_advice].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[getAdvicePriority(a)] - order[getAdvicePriority(b)];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Lightbulb size={16} className="text-amber-500" />
          <span className="text-slate-700">Gap Analysis & Recommendations</span>
          <span className="ml-auto text-xs text-slate-400 font-normal">
            {scoring.gap_analysis_advice.length} action
            {scoring.gap_analysis_advice.length !== 1 ? "s" : ""} needed
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedAdvice.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="text-emerald-500 mb-2">
              <TrendingUp size={32} className="mx-auto" />
            </div>
            <p className="text-sm text-emerald-600">
              All compliance criteria met!
            </p>
            <p className="text-xs text-slate-400 mt-1">
              No gaps detected in your product data.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {sortedAdvice.map((advice, idx) => {
              const priority = getAdvicePriority(advice);
              const colors = priorityColors[priority];
              const Icon = getAdviceIcon(advice);

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.3 }}
                  whileHover={{ x: 4 }}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-default ${colors.border} ${colors.bg} ${colors.hover}`}
                >
                  <Icon
                    size={14}
                    className={`mt-0.5 flex-shrink-0 ${colors.icon}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {advice}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${colors.badge} flex-shrink-0`}
                  >
                    {priority}
                  </span>
                  <ArrowRight
                    size={12}
                    className="text-slate-300 flex-shrink-0 mt-0.5"
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Score impact hint */}
        {sortedAdvice.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2"
          >
            <TrendingUp size={12} className="text-sky-400" />
            <span className="text-[10px] text-slate-400">
              Resolving all gaps could increase your scores to 100%. High
              priority items have the greatest impact.
            </span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
