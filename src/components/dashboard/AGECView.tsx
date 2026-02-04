"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  MapPin,
  Recycle,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Pencil,
  Save,
  X,
} from "lucide-react";
import type { AGECCompliance } from "@/lib/schema";

interface AGECViewProps {
  data: AGECCompliance;
  onUpdate?: (newData: AGECCompliance) => void;
  editable?: boolean;
}

function StatusIcon({ value }: { value: boolean | null }) {
  if (value === null)
    return <HelpCircle size={16} className="text-slate-300" />;
  if (value) return <CheckCircle2 size={16} className="text-emerald-500" />;
  return <XCircle size={16} className="text-red-500" />;
}

function EditableCountryBadge({
  code,
  label,
  isEditing,
  onChange,
}: {
  code: string | null;
  label: string;
  isEditing: boolean;
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      {isEditing ? (
        <Input
          type="text"
          value={code || ""}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="XX"
          className="w-20 h-7 text-xs text-center uppercase"
          maxLength={2}
        />
      ) : code ? (
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

export function AGECView({ data, onUpdate, editable = true }: AGECViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<AGECCompliance>(data);

  const handleSave = () => {
    // Recalculate microplastic warning based on synthetic percentage
    const updatedData = {
      ...editedData,
      material_analysis: {
        ...editedData.material_analysis,
        microplastic_warning_required:
          editedData.material_analysis.synthetic_fiber_percentage > 50,
      },
    };
    onUpdate?.(updatedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(data);
    setIsEditing(false);
  };

  const currentData = isEditing ? editedData : data;

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Traceability Card */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-sky-500" />
                <span className="text-slate-700">Traçabilité</span>
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  AGEC Art. 13
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EditableCountryBadge
                code={currentData.traceability.weaving_knitting_country}
                label="Tissage / Tricotage"
                isEditing={isEditing}
                onChange={(value) =>
                  setEditedData({
                    ...editedData,
                    traceability: {
                      ...editedData.traceability,
                      weaving_knitting_country: value,
                    },
                  })
                }
              />
              <EditableCountryBadge
                code={currentData.traceability.dyeing_printing_country}
                label="Teinture / Impression"
                isEditing={isEditing}
                onChange={(value) =>
                  setEditedData({
                    ...editedData,
                    traceability: {
                      ...editedData.traceability,
                      dyeing_printing_country: value,
                    },
                  })
                }
              />
              <EditableCountryBadge
                code={currentData.traceability.manufacturing_country}
                label="Confection"
                isEditing={isEditing}
                onChange={(value) =>
                  setEditedData({
                    ...editedData,
                    traceability: {
                      ...editedData.traceability,
                      manufacturing_country: value,
                    },
                  })
                }
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Recyclability Card */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Recycle size={16} className="text-emerald-500" />
                <span className="text-slate-700">Recyclabilité</span>
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  5 critères
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">Majoritairement recyclable</span>
                {isEditing ? (
                  <Switch
                    checked={currentData.recyclability.is_majority_recyclable}
                    onCheckedChange={(checked) =>
                      setEditedData({
                        ...editedData,
                        recyclability: {
                          ...editedData.recyclability,
                          is_majority_recyclable: checked,
                        },
                      })
                    }
                  />
                ) : (
                  <StatusIcon value={currentData.recyclability.is_majority_recyclable} />
                )}
              </div>
              {currentData.recyclability.blockers.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-red-500 font-medium">
                    BLOQUANTS DÉTECTÉS:
                  </span>
                  {currentData.recyclability.blockers.map((blocker, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-md px-3 py-2 border border-red-100"
                    >
                      <AlertTriangle
                        size={12}
                        className="mt-0.5 flex-shrink-0"
                      />
                      {blocker}
                      {isEditing && (
                        <button
                          onClick={() =>
                            setEditedData({
                              ...editedData,
                              recyclability: {
                                ...editedData.recyclability,
                                blockers: editedData.recyclability.blockers.filter(
                                  (_, i) => i !== idx
                                ),
                              },
                            })
                          }
                          className="ml-auto text-red-400 hover:text-red-600"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
              {currentData.recyclability.blockers.length === 0 && (
                <div className="text-xs text-emerald-600 flex items-center gap-2">
                  <CheckCircle2 size={12} />
                  Aucun bloquant détecté
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
                <FlaskConical size={16} className="text-violet-500" />
                <span className="text-slate-700">Analyse matières</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Fibres synthétiques</span>
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={currentData.material_analysis.synthetic_fiber_percentage}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          material_analysis: {
                            ...editedData.material_analysis,
                            synthetic_fiber_percentage: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-16 h-7 text-xs text-right"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                ) : (
                  <span className="text-sm font-mono text-slate-700">
                    {currentData.material_analysis.synthetic_fiber_percentage}%
                  </span>
                )}
              </div>
              {/* Synthetic bar */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    currentData.material_analysis.synthetic_fiber_percentage > 50
                      ? "bg-amber-500"
                      : "bg-sky-500"
                  }`}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${currentData.material_analysis.synthetic_fiber_percentage}%`,
                  }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Contenu recyclé</span>
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={currentData.material_analysis.recycled_content_percentage}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          material_analysis: {
                            ...editedData.material_analysis,
                            recycled_content_percentage: Number(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-16 h-7 text-xs text-right"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                ) : (
                  <span className="text-sm font-mono text-slate-700">
                    {currentData.material_analysis.recycled_content_percentage}%
                  </span>
                )}
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${currentData.material_analysis.recycled_content_percentage}%`,
                  }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                />
              </div>

              {currentData.material_analysis.microplastic_warning_required && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2 border border-amber-200"
                >
                  <AlertTriangle size={12} />
                  Étiquette microplastique requise (synthétique &gt; 50%)
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
                <AlertTriangle size={16} className="text-amber-500" />
                <span className="text-slate-700">Substances dangereuses</span>
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  REACH / SVHC
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">Contient SVHC</span>
                {isEditing ? (
                  <Switch
                    checked={currentData.hazardous_substances.contains_svhc}
                    onCheckedChange={(checked) =>
                      setEditedData({
                        ...editedData,
                        hazardous_substances: {
                          ...editedData.hazardous_substances,
                          contains_svhc: checked,
                        },
                      })
                    }
                  />
                ) : (
                  <StatusIcon value={currentData.hazardous_substances.contains_svhc} />
                )}
              </div>
              {currentData.hazardous_substances.substance_names.length > 0 && (
                <div className="space-y-1.5">
                  {currentData.hazardous_substances.substance_names.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <Badge variant="warning" className="mr-1.5">
                        {name}
                      </Badge>
                      {isEditing && (
                        <button
                          onClick={() =>
                            setEditedData({
                              ...editedData,
                              hazardous_substances: {
                                ...editedData.hazardous_substances,
                                substance_names:
                                  editedData.hazardous_substances.substance_names.filter(
                                    (_, i) => i !== idx
                                  ),
                              },
                            })
                          }
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {!currentData.hazardous_substances.contains_svhc && (
                <div className="text-xs text-emerald-600 flex items-center gap-2">
                  <CheckCircle2 size={12} />
                  Aucun SVHC détecté au-dessus du seuil de 0.1%
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
