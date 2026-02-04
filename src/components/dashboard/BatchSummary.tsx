"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Target,
  Loader2,
  Globe,
  Scale,
  Recycle,
  Wrench,
} from "lucide-react";
import type { ComplianceData } from "@/lib/schema";

interface ProductEntry {
  data: ComplianceData;
  rawInput: string;
  productName: string;
}

interface BatchSummaryProps {
  products: ProductEntry[];
}

interface SummaryData {
  synthese: string;
  pointsForts: string[];
  pointsAmelioration: string[];
  planAction: string[];
}

interface Stats {
  totalProducts: number;
  avgScore: number;
  conformeCount: number;
  partielCount: number;
  aRevoirCount: number;
  missingTraceability: number;
  notRecyclable: number;
  hasSVHC: number;
  needsMicroplasticWarning: number;
  hasRecycledContent: number;
  hasHighRecycled: number;
  iso59040Completeness: number;
  hasPostConsumerRecycled: number;
  hasReachCompliant: number;
  hasRepairable: number;
  hasClosedLoop: number;
}

export function BatchSummary({ products }: BatchSummaryProps) {
  const { t, language } = useLanguage();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/generate-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            products: products.map((p) => ({
              data: p.data,
              productName: p.productName,
            })),
            language,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate summary");
        }

        const result = await response.json();
        setSummary(result.summary);
        setStats(result.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [products, language]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-sky-500 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">
            {language === "fr" ? "Génération du résumé en cours..." : "Generating summary..."}
          </p>
          <p className="text-slate-400 text-xs mt-1">
            {language === "fr" ? "Analyse par Claude AI" : "Analysis by Claude AI"}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6 text-center">
            <AlertTriangle size={32} className="text-red-500 mx-auto mb-2" />
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!summary || !stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Header Stats - AGEC */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-3">
          <Scale size={16} className="text-sky-500" />
          <span className="text-sm font-semibold text-slate-700">{t.agecCompliance}</span>
          <Badge variant="secondary" className="text-[10px]">{t.frenchLaw}</Badge>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-3xl font-bold text-slate-800">{stats.totalProducts}</div>
              <div className="text-xs text-slate-500 mt-1">{t.productsAnalyzed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-3xl font-bold text-sky-600">{stats.avgScore}%</div>
              <div className="text-xs text-slate-500 mt-1">{t.avgAgecScore}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-3xl font-bold text-emerald-600">{stats.conformeCount}</div>
              <div className="text-xs text-slate-500 mt-1">{t.compliant}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-3xl font-bold text-red-600">{stats.aRevoirCount}</div>
              <div className="text-xs text-slate-500 mt-1">{t.toReview}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Header Stats - ISO 59040 */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={16} className="text-emerald-500" />
          <span className="text-sm font-semibold text-slate-700">{t.iso59040Pcds}</span>
          <Badge variant="secondary" className="text-[10px]">{t.internationalStandard}</Badge>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-3xl font-bold text-emerald-600">{stats.iso59040Completeness}%</div>
              <div className="text-xs text-slate-500 mt-1">{t.pcdsCompleteness}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-3xl font-bold text-slate-700">{stats.hasPostConsumerRecycled}</div>
              <div className="text-xs text-slate-500 mt-1">{t.recycledOver25}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-3xl font-bold text-slate-700">{stats.hasRepairable}</div>
              <div className="text-xs text-slate-500 mt-1">{t.repairable}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-3xl font-bold text-slate-700">{stats.hasClosedLoop}</div>
              <div className="text-xs text-slate-500 mt-1">{t.closedLoop}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Score Distribution Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-700">{t.scoreDistribution}</span>
          </div>
          <div className="flex h-8 rounded-lg overflow-hidden">
            {stats.conformeCount > 0 && (
              <div
                className="bg-emerald-500 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${(stats.conformeCount / stats.totalProducts) * 100}%` }}
              >
                {Math.round((stats.conformeCount / stats.totalProducts) * 100)}%
              </div>
            )}
            {stats.partielCount > 0 && (
              <div
                className="bg-amber-500 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${(stats.partielCount / stats.totalProducts) * 100}%` }}
              >
                {Math.round((stats.partielCount / stats.totalProducts) * 100)}%
              </div>
            )}
            {stats.aRevoirCount > 0 && (
              <div
                className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${(stats.aRevoirCount / stats.totalProducts) * 100}%` }}
              >
                {Math.round((stats.aRevoirCount / stats.totalProducts) * 100)}%
              </div>
            )}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-emerald-500"></span> {language === "fr" ? "Conforme" : "Compliant"}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-amber-500"></span> {t.partial}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-red-500"></span> {language === "fr" ? "À revoir" : "To Review"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* AI Generated Summary */}
      <Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles size={16} className="text-sky-500" />
            <span className="text-slate-700">{t.globalSynthesis}</span>
            <Badge variant="secondary" className="ml-auto text-[10px]">
              {t.generatedByAi}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 text-sm leading-relaxed">{summary.synthese}</p>
        </CardContent>
      </Card>

      {/* Points Forts & Amélioration */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="text-slate-700">{t.strengths}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {summary.pointsForts.map((point, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-2 text-sm text-slate-600"
                >
                  <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle size={16} className="text-amber-500" />
              <span className="text-slate-700">{t.areasForImprovement}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {summary.pointsAmelioration.map((point, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-2 text-sm text-slate-600"
                >
                  <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Plan d'action */}
      <Card className="border-violet-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target size={16} className="text-violet-500" />
            <span className="text-slate-700">{t.priorityActionPlan}</span>
            <Badge className="ml-auto text-[10px] bg-violet-100 text-violet-700">
              {t.toReach100}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {summary.planAction.map((action, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="flex items-start gap-3"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="text-sm text-slate-600 pt-0.5">{action}</span>
              </motion.li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Quick Stats Grid - AGEC */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Scale size={14} className="text-sky-500" />
          <span className="text-xs font-medium text-slate-600">{t.detailsAgec}</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-slate-50">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{t.incompleteTraceability}</span>
                <span className="text-sm font-bold text-slate-700">
                  {stats.missingTraceability}/{stats.totalProducts}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{t.notRecyclable}</span>
                <span className="text-sm font-bold text-slate-700">
                  {stats.notRecyclable}/{stats.totalProducts}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{t.microplasticWarningShort}</span>
                <span className="text-sm font-bold text-slate-700">
                  {stats.needsMicroplasticWarning}/{stats.totalProducts}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats Grid - ISO 59040 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-emerald-500" />
          <span className="text-xs font-medium text-slate-600">{t.detailsIso}</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-slate-50">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <CheckCircle2 size={12} /> {t.reachCompliantShort}
                </span>
                <span className="text-sm font-bold text-slate-700">
                  {stats.hasReachCompliant}/{stats.totalProducts}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Wrench size={12} /> {t.repairable}
                </span>
                <span className="text-sm font-bold text-slate-700">
                  {stats.hasRepairable}/{stats.totalProducts}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Recycle size={12} /> {t.closedLoop}
                </span>
                <span className="text-sm font-bold text-slate-700">
                  {stats.hasClosedLoop}/{stats.totalProducts}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
