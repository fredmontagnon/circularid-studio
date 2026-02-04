"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Package,
  ArrowUpCircle,
  Wrench,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Pencil,
  Save,
  X,
} from "lucide-react";
import type { ISO59040PCDS } from "@/lib/schema";

interface ISOViewProps {
  data: ISO59040PCDS;
  onUpdate?: (newData: ISO59040PCDS) => void;
  editable?: boolean;
}

function EditableStatementRow({
  code,
  label,
  description,
  value,
  delay,
  isEditing,
  onChange,
}: {
  code: string;
  label: string;
  description: string;
  value: boolean;
  delay: number;
  isEditing: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`p-4 rounded-lg border transition-all ${
        value
          ? "border-emerald-200 bg-emerald-50 hover:border-emerald-300"
          : "border-red-200 bg-red-50 hover:border-red-300"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={value ? "success" : "danger"} className="text-[10px] font-mono">
              {code}
            </Badge>
            <span className="text-sm font-medium text-slate-700">{label}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
        <div className="ml-4">
          {isEditing ? (
            <Switch checked={value} onCheckedChange={onChange} />
          ) : value ? (
            <CheckCircle2 size={20} className="text-emerald-500" />
          ) : (
            <XCircle size={20} className="text-red-500" />
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

export function ISOView({ data, onUpdate, editable = true }: ISOViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ISO59040PCDS>(data);

  const handleSave = () => {
    onUpdate?.(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(data);
    setIsEditing(false);
  };

  const currentData = isEditing ? editedData : data;

  const statementsCount = [
    currentData.section_2_inputs.statement_2503_post_consumer,
    currentData.section_2_inputs.statement_2301_reach_compliant,
    currentData.section_3_better_use.statement_3000_repairable,
    currentData.section_5_end_of_life.statement_5032_closed_loop,
  ].filter(Boolean).length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Edit Button */}
      {editable && (
        <div className="flex justify-end">
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="gap-1 text-xs"
              >
                <X size={12} />
                Annuler
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                className="gap-1 text-xs"
              >
                <Save size={12} />
                Enregistrer
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-1 text-xs"
            >
              <Pencil size={12} />
              Modifier
            </Button>
          )}
        </div>
      )}

      {/* Section 2: Inputs */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Package size={16} className="text-sky-500" />
              <span className="text-slate-700">
                Section 2 — Entrées circulaires
              </span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                ISO 59040 PCDS
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <EditableStatementRow
              code="§2503"
              label="Contenu recyclé post-consommation"
              description="Le produit contient >25% de matière recyclée post-consommation"
              value={currentData.section_2_inputs.statement_2503_post_consumer}
              delay={0.2}
              isEditing={isEditing}
              onChange={(value) =>
                setEditedData({
                  ...editedData,
                  section_2_inputs: {
                    ...editedData.section_2_inputs,
                    statement_2503_post_consumer: value,
                  },
                })
              }
            />
            <EditableStatementRow
              code="§2301"
              label="Conformité REACH"
              description="Aucune substance extrêmement préoccupante au-dessus du seuil de 0.1%"
              value={currentData.section_2_inputs.statement_2301_reach_compliant}
              delay={0.3}
              isEditing={isEditing}
              onChange={(value) =>
                setEditedData({
                  ...editedData,
                  section_2_inputs: {
                    ...editedData.section_2_inputs,
                    statement_2301_reach_compliant: value,
                  },
                })
              }
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 3: Better Use */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wrench size={16} className="text-violet-500" />
              <span className="text-slate-700">Section 3 — Meilleur usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EditableStatementRow
              code="§3000"
              label="Réparable par non-expert"
              description="Le produit est conçu pour être réparé par un consommateur standard"
              value={currentData.section_3_better_use.statement_3000_repairable}
              delay={0.4}
              isEditing={isEditing}
              onChange={(value) =>
                setEditedData({
                  ...editedData,
                  section_3_better_use: {
                    ...editedData.section_3_better_use,
                    statement_3000_repairable: value,
                  },
                })
              }
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 5: End of Life */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <RotateCcw size={16} className="text-emerald-500" />
              <span className="text-slate-700">Section 5 — Fin de vie</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EditableStatementRow
              code="§5032"
              label="Design boucle fermée"
              description="Conçu pour le recyclage fibre-à-fibre (mono-matière ou facilement séparable)"
              value={currentData.section_5_end_of_life.statement_5032_closed_loop}
              delay={0.5}
              isEditing={isEditing}
              onChange={(value) =>
                setEditedData({
                  ...editedData,
                  section_5_end_of_life: {
                    ...editedData.section_5_end_of_life,
                    statement_5032_closed_loop: value,
                  },
                })
              }
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Bar */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg"
      >
        <ArrowUpCircle size={16} className="text-sky-500" />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Déclarations validées:</span>
            <span className="text-sm font-mono text-slate-700">
              {statementsCount} / 4
            </span>
          </div>
        </div>
        <Badge variant={statementsCount >= 3 ? "success" : "warning"}>
          {statementsCount >= 3 ? "Bon niveau" : "À améliorer"}
        </Badge>
      </motion.div>
    </motion.div>
  );
}
