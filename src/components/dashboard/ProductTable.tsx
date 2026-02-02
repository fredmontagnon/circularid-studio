"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import type { ComplianceData } from "@/lib/schema";

interface ProductTableProps {
  products: Array<{ data: ComplianceData; rawInput: string; timestamp: Date }>;
}

function BoolCell({ value }: { value: boolean | null | undefined }) {
  if (value === null || value === undefined)
    return <HelpCircle size={13} className="text-white/20 mx-auto" />;
  if (value)
    return <CheckCircle2 size={13} className="text-green-400 mx-auto" />;
  return <XCircle size={13} className="text-red-400 mx-auto" />;
}

function ScoreBadge({ score }: { score: number }) {
  const variant =
    score >= 80 ? "success" : score >= 50 ? "warning" : "danger";
  return (
    <Badge variant={variant} className="text-[10px] tabular-nums font-mono">
      {score}%
    </Badge>
  );
}

function CountryCell({ code }: { code: string | null | undefined }) {
  if (!code)
    return (
      <span className="text-red-400/60 text-[10px] font-mono">---</span>
    );
  return (
    <span className="text-cyan-300 text-[10px] font-mono font-semibold">
      {code}
    </span>
  );
}

export function ProductTable({ products }: ProductTableProps) {
  if (products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Table size={16} className="text-cyan-400" />
            <span className="text-white/80">
              All Analyzed Products ({products.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-white/10">
                <th
                  colSpan={3}
                  className="px-2 py-2 text-left text-white/30 font-mono uppercase tracking-wider bg-cyan-500/5"
                >
                  Product
                </th>
                <th
                  colSpan={6}
                  className="px-2 py-2 text-center text-white/30 font-mono uppercase tracking-wider bg-purple-500/5"
                >
                  AGEC Compliance
                </th>
                <th
                  colSpan={4}
                  className="px-2 py-2 text-center text-white/30 font-mono uppercase tracking-wider bg-green-500/5"
                >
                  ISO 59040 PCDS
                </th>
                <th
                  colSpan={2}
                  className="px-2 py-2 text-center text-white/30 font-mono uppercase tracking-wider bg-orange-500/5"
                >
                  Scores
                </th>
              </tr>
              <tr className="border-b border-white/5 text-white/40 font-normal">
                {/* Product */}
                <th className="px-2 py-1.5 text-left font-normal">Name</th>
                <th className="px-2 py-1.5 text-left font-normal">SKU</th>
                <th className="px-2 py-1.5 text-left font-normal">GTIN</th>
                {/* AGEC */}
                <th className="px-2 py-1.5 text-center font-normal">
                  Weaving
                </th>
                <th className="px-2 py-1.5 text-center font-normal">
                  Dyeing
                </th>
                <th className="px-2 py-1.5 text-center font-normal">Mfg</th>
                <th className="px-2 py-1.5 text-center font-normal">
                  Recyclable
                </th>
                <th className="px-2 py-1.5 text-center font-normal">
                  <span title="Microplastic Warning">
                    <AlertTriangle size={11} className="mx-auto" />
                  </span>
                </th>
                <th className="px-2 py-1.5 text-center font-normal">SVHC</th>
                {/* ISO */}
                <th className="px-2 py-1.5 text-center font-normal">
                  <span title="Post-consumer recycled >25%">
                    &sect;2503
                  </span>
                </th>
                <th className="px-2 py-1.5 text-center font-normal">
                  <span title="REACH Compliant">
                    &sect;2301
                  </span>
                </th>
                <th className="px-2 py-1.5 text-center font-normal">
                  <span title="Repairable">
                    &sect;3000
                  </span>
                </th>
                <th className="px-2 py-1.5 text-center font-normal">
                  <span title="Closed-loop design">
                    &sect;5032
                  </span>
                </th>
                {/* Scores */}
                <th className="px-2 py-1.5 text-center font-normal">
                  Complete
                </th>
                <th className="px-2 py-1.5 text-center font-normal">
                  Circular
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => {
                const d = product.data;
                return (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Product */}
                    <td className="px-2 py-2 text-white/80 font-medium max-w-[140px] truncate">
                      {d.product_identity.name}
                    </td>
                    <td className="px-2 py-2 text-white/40 font-mono">
                      {d.product_identity.sku || "---"}
                    </td>
                    <td className="px-2 py-2 text-white/40 font-mono">
                      {d.product_identity.gtin || "---"}
                    </td>
                    {/* AGEC Traceability */}
                    <td className="px-2 py-2 text-center">
                      <CountryCell
                        code={
                          d.agec_compliance.traceability
                            .weaving_knitting_country
                        }
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <CountryCell
                        code={
                          d.agec_compliance.traceability.dyeing_printing_country
                        }
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <CountryCell
                        code={
                          d.agec_compliance.traceability.manufacturing_country
                        }
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <BoolCell
                        value={
                          d.agec_compliance.recyclability.is_majority_recyclable
                        }
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <BoolCell
                        value={
                          d.agec_compliance.material_analysis
                            .microplastic_warning_required
                        }
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <BoolCell
                        value={
                          d.agec_compliance.hazardous_substances.contains_svhc
                        }
                      />
                    </td>
                    {/* ISO */}
                    <td className="px-2 py-2 text-center">
                      <BoolCell
                        value={
                          d.iso_59040_pcds.section_2_inputs
                            .statement_2503_post_consumer
                        }
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <BoolCell
                        value={
                          d.iso_59040_pcds.section_2_inputs
                            .statement_2301_reach_compliant
                        }
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <BoolCell
                        value={
                          d.iso_59040_pcds.section_3_better_use
                            .statement_3000_repairable
                        }
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <BoolCell
                        value={
                          d.iso_59040_pcds.section_5_end_of_life
                            .statement_5032_closed_loop
                        }
                      />
                    </td>
                    {/* Scores */}
                    <td className="px-2 py-2 text-center">
                      <ScoreBadge
                        score={d.meta_scoring.data_completeness_score}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <ScoreBadge
                        score={d.meta_scoring.circularity_performance_score}
                      />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
