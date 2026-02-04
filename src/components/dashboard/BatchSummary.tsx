"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Target,
  Loader2,
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
}

export function BatchSummary({ products }: BatchSummaryProps) {
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
  }, [products]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-sky-500 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Génération du résumé en cours...</p>
          <p className="text-slate-400 text-xs mt-1">Analyse par Claude AI</p>
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
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <div className="text-3xl font-bold text-slate-800">{stats.totalProducts}</div>
            <div className="text-xs text-slate-500 mt-1">Produits analysés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <div className="text-3xl font-bold text-sky-600">{stats.avgScore}%</div>
            <div className="text-xs text-slate-500 mt-1">Score moyen AGEC</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <div className="text-3xl font-bold text-emerald-600">{stats.conformeCount}</div>
            <div className="text-xs text-slate-500 mt-1">Conformes (≥80%)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <div className="text-3xl font-bold text-red-600">{stats.aRevoirCount}</div>
            <div className="text-xs text-slate-500 mt-1">À revoir (&lt;50%)</div>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Répartition des scores</span>
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
              <span className="w-2 h-2 rounded bg-emerald-500"></span> Conforme
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-amber-500"></span> Partiel
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-red-500"></span> À revoir
            </span>
          </div>
        </CardContent>
      </Card>

      {/* AI Generated Summary */}
      <Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles size={16} className="text-sky-500" />
            <span className="text-slate-700">Synthèse globale</span>
            <Badge variant="secondary" className="ml-auto text-[10px]">
              Généré par Claude AI
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
              <span className="text-slate-700">Points forts</span>
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
              <span className="text-slate-700">Points d&apos;amélioration</span>
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
            <span className="text-slate-700">Plan d&apos;action prioritaire</span>
            <Badge className="ml-auto text-[10px] bg-violet-100 text-violet-700">
              Pour atteindre 100%
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

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Traçabilité incomplète</span>
              <span className="text-sm font-bold text-slate-700">
                {stats.missingTraceability}/{stats.totalProducts}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Non recyclables</span>
              <span className="text-sm font-bold text-slate-700">
                {stats.notRecyclable}/{stats.totalProducts}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Avert. microplastique</span>
              <span className="text-sm font-bold text-slate-700">
                {stats.needsMicroplasticWarning}/{stats.totalProducts}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
