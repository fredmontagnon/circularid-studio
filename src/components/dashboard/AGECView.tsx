"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Recycle,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import type { AGECCompliance } from "@/lib/schema";

interface AGECViewProps {
  data: AGECCompliance;
}

function StatusIcon({ value }: { value: boolean | null }) {
  if (value === null)
    return <HelpCircle size={16} className="text-white/30" />;
  if (value) return <CheckCircle2 size={16} className="text-green-400" />;
  return <XCircle size={16} className="text-red-400" />;
}

function CountryBadge({
  code,
  label,
}: {
  code: string | null;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/50">{label}</span>
      {code ? (
        <Badge variant="default">{code}</Badge>
      ) : (
        <Badge variant="danger">MISSING</Badge>
      )}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function AGECView({ data }: AGECViewProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {/* Traceability Card */}
      <motion.div variants={itemVariants}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-cyan-400" />
              <span className="text-white/80">Traceability</span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                AGEC Art. 13
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CountryBadge
              code={data.traceability.weaving_knitting_country}
              label="Weaving / Knitting"
            />
            <CountryBadge
              code={data.traceability.dyeing_printing_country}
              label="Dyeing / Printing"
            />
            <CountryBadge
              code={data.traceability.manufacturing_country}
              label="Manufacturing"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Recyclability Card */}
      <motion.div variants={itemVariants}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Recycle size={16} className="text-green-400" />
              <span className="text-white/80">Recyclability</span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                5 French Criteria
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/50">Majority Recyclable</span>
              <StatusIcon value={data.recyclability.is_majority_recyclable} />
            </div>
            {data.recyclability.blockers.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-red-400/70 font-mono">
                  BLOCKERS DETECTED:
                </span>
                {data.recyclability.blockers.map((blocker, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-2 text-xs text-red-300/80 bg-red-500/5 rounded-md px-3 py-2 border border-red-500/10"
                  >
                    <AlertTriangle
                      size={12}
                      className="mt-0.5 flex-shrink-0"
                    />
                    {blocker}
                  </motion.div>
                ))}
              </div>
            )}
            {data.recyclability.blockers.length === 0 && (
              <div className="text-xs text-green-400/60 flex items-center gap-2">
                <CheckCircle2 size={12} />
                No recycling blockers detected
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Material Analysis Card */}
      <motion.div variants={itemVariants}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <FlaskConical size={16} className="text-purple-400" />
              <span className="text-white/80">Material Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Synthetic Fiber</span>
              <span className="text-sm font-mono text-white/80">
                {data.material_analysis.synthetic_fiber_percentage}%
              </span>
            </div>
            {/* Synthetic bar */}
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  data.material_analysis.synthetic_fiber_percentage > 50
                    ? "bg-orange-500"
                    : "bg-cyan-500"
                }`}
                initial={{ width: 0 }}
                animate={{
                  width: `${data.material_analysis.synthetic_fiber_percentage}%`,
                }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Recycled Content</span>
              <span className="text-sm font-mono text-white/80">
                {data.material_analysis.recycled_content_percentage}%
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-green-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${data.material_analysis.recycled_content_percentage}%`,
                }}
                transition={{ delay: 0.7, duration: 0.8 }}
              />
            </div>

            {data.material_analysis.microplastic_warning_required && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 rounded-md px-3 py-2 border border-orange-500/20"
              >
                <AlertTriangle size={12} />
                Microplastic warning label required (synthetic &gt; 50%)
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Hazardous Substances Card */}
      <motion.div variants={itemVariants}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle size={16} className="text-orange-400" />
              <span className="text-white/80">Hazardous Substances</span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                REACH / SVHC
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/50">Contains SVHC</span>
              <StatusIcon value={data.hazardous_substances.contains_svhc} />
            </div>
            {data.hazardous_substances.substance_names.length > 0 && (
              <div className="space-y-1.5">
                {data.hazardous_substances.substance_names.map((name, idx) => (
                  <Badge key={idx} variant="warning" className="mr-1.5">
                    {name}
                  </Badge>
                ))}
              </div>
            )}
            {!data.hazardous_substances.contains_svhc && (
              <div className="text-xs text-green-400/60 flex items-center gap-2">
                <CheckCircle2 size={12} />
                No SVHC detected above 0.1% threshold
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
