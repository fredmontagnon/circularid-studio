"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ArrowUpCircle,
  Wrench,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { ISO59040PCDS } from "@/lib/schema";

interface ISOViewProps {
  data: ISO59040PCDS;
}

function StatementRow({
  code,
  label,
  description,
  value,
  delay,
}: {
  code: string;
  label: string;
  description: string;
  value: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`p-4 rounded-lg border transition-all ${
        value
          ? "border-green-500/20 bg-green-500/5 hover:border-green-500/30"
          : "border-red-500/20 bg-red-500/5 hover:border-red-500/30"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={value ? "success" : "danger"} className="text-[10px] font-mono">
              {code}
            </Badge>
            <span className="text-sm font-medium text-white/80">{label}</span>
          </div>
          <p className="text-xs text-white/40 mt-1">{description}</p>
        </div>
        <div className="ml-4">
          {value ? (
            <CheckCircle2 size={20} className="text-green-400" />
          ) : (
            <XCircle size={20} className="text-red-400" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function ISOView({ data }: ISOViewProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Section 2: Inputs */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Package size={16} className="text-cyan-400" />
              <span className="text-white/80">
                Section 2 — Circular Inputs
              </span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                ISO 59040 PCDS
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatementRow
              code="§2503"
              label="Post-Consumer Recycled Content"
              description="Product contains >25% post-consumer recycled material"
              value={data.section_2_inputs.statement_2503_post_consumer}
              delay={0.2}
            />
            <StatementRow
              code="§2301"
              label="REACH Compliant"
              description="No Substances of Very High Concern above 0.1% threshold"
              value={data.section_2_inputs.statement_2301_reach_compliant}
              delay={0.3}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 3: Better Use */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wrench size={16} className="text-purple-400" />
              <span className="text-white/80">Section 3 — Better Use</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatementRow
              code="§3000"
              label="Repairable by Non-Expert"
              description="Product is designed so a regular consumer can repair it"
              value={data.section_3_better_use.statement_3000_repairable}
              delay={0.4}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 5: End of Life */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <RotateCcw size={16} className="text-green-400" />
              <span className="text-white/80">Section 5 — End of Life</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatementRow
              code="§5032"
              label="Closed-Loop Design"
              description="Designed for fiber-to-fiber recycling (mono-material or easily separable)"
              value={data.section_5_end_of_life.statement_5032_closed_loop}
              delay={0.5}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Bar */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-4 p-4 glass rounded-lg"
      >
        <ArrowUpCircle size={16} className="text-cyan-400" />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40">Statements Met:</span>
            <span className="text-sm font-mono text-white/80">
              {[
                data.section_2_inputs.statement_2503_post_consumer,
                data.section_2_inputs.statement_2301_reach_compliant,
                data.section_3_better_use.statement_3000_repairable,
                data.section_5_end_of_life.statement_5032_closed_loop,
              ].filter(Boolean).length}{" "}
              / 4
            </span>
          </div>
        </div>
        <Badge
          variant={
            [
              data.section_2_inputs.statement_2503_post_consumer,
              data.section_2_inputs.statement_2301_reach_compliant,
              data.section_3_better_use.statement_3000_repairable,
              data.section_5_end_of_life.statement_5032_closed_loop,
            ].filter(Boolean).length >= 3
              ? "success"
              : "warning"
          }
        >
          {[
            data.section_2_inputs.statement_2503_post_consumer,
            data.section_2_inputs.statement_2301_reach_compliant,
            data.section_3_better_use.statement_3000_repairable,
            data.section_5_end_of_life.statement_5032_closed_loop,
          ].filter(Boolean).length >= 3
            ? "Good Standing"
            : "Needs Improvement"}
        </Badge>
      </motion.div>
    </motion.div>
  );
}
