"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Scan, Database, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const SCAN_PHASES = [
  { icon: Scan, label: "Parsing raw input...", color: "text-cyan-400" },
  { icon: Database, label: "Extracting material composition...", color: "text-purple-400" },
  { icon: Shield, label: "Checking AGEC compliance...", color: "text-orange-400" },
  { icon: Lock, label: "Validating ISO 59040 PCDS...", color: "text-green-400" },
  { icon: CheckCircle2, label: "Computing circularity score...", color: "text-cyan-300" },
];

const DATA_LINES = [
  ">> INIT textile_analysis_v3.2",
  ">> Loading AGEC regulation matrix...",
  ">> Parsing fiber composition...",
  '>> material.synthetic = "polyester" | "nylon" | "acrylic"',
  ">> Checking REACH SVHC registry...",
  ">> Cross-referencing ISO 59040:2024 §2-§5...",
  ">> Evaluating recyclability (5 French criteria)...",
  ">> Collection: CHECK | Sorting: CHECK",
  ">> Disruptors scan: elastane, coatings, trims...",
  ">> Generating gap_analysis_advice[]...",
  ">> Computing data_completeness_score...",
  ">> Computing circularity_performance_score...",
  ">> Compliance report ready.",
];

interface ScanningAnimationProps {
  isActive: boolean;
  progress?: { current: number; total: number } | null;
}

export function ScanningAnimation({ isActive, progress }: ScanningAnimationProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);

  useEffect(() => {
    if (!isActive) {
      setCurrentPhase(0);
      setVisibleLines([]);
      return;
    }

    const phaseInterval = setInterval(() => {
      setCurrentPhase((prev) => {
        if (prev >= SCAN_PHASES.length - 1) {
          clearInterval(phaseInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1800);

    let lineIndex = 0;
    const lineInterval = setInterval(() => {
      if (lineIndex < DATA_LINES.length) {
        setVisibleLines((prev) => [...prev, lineIndex]);
        lineIndex++;
      } else {
        clearInterval(lineInterval);
      }
    }, 600);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(lineInterval);
    };
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
        >
          {/* Scan lines overlay */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
              animate={{ top: ["-2px", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"
              animate={{ top: ["100%", "-1px"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-grid opacity-30" />

          <div className="relative flex gap-12 max-w-5xl w-full px-8">
            {/* Left: Status phases */}
            <div className="flex-1 space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-white mb-8 tracking-wide"
              >
                <span className="text-cyan-400">ARIANEE</span> PCDS ANALYSIS
                {progress && (
                  <span className="block text-sm font-normal text-white/40 mt-2">
                    Processing {progress.total} products...
                  </span>
                )}
              </motion.h2>

              {SCAN_PHASES.map((phase, idx) => {
                const Icon = phase.icon;
                const isActive = idx <= currentPhase;
                const isCurrent = idx === currentPhase;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{
                      opacity: isActive ? 1 : 0.2,
                      x: isActive ? 0 : -30,
                    }}
                    transition={{ delay: idx * 0.3, duration: 0.4 }}
                    className={`flex items-center gap-3 ${phase.color}`}
                  >
                    <motion.div
                      animate={
                        isCurrent
                          ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }
                          : {}
                      }
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Icon size={20} />
                    </motion.div>
                    <span className="text-sm font-mono">{phase.label}</span>
                    {idx < currentPhase && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-green-400 ml-auto"
                      >
                        <CheckCircle2 size={16} />
                      </motion.span>
                    )}
                    {isCurrent && (
                      <motion.div
                        className="ml-auto flex gap-1"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

              {/* Progress bar */}
              <motion.div className="mt-8 h-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-green-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${((currentPhase + 1) / SCAN_PHASES.length) * 100}%`,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </motion.div>
            </div>

            {/* Right: Data stream */}
            <div className="flex-1 relative">
              <div className="glass rounded-lg p-4 h-[400px] overflow-hidden font-mono text-xs">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-white/30 text-[10px] ml-2">
                    compliance_engine.log
                  </span>
                </div>

                <div className="space-y-1">
                  {DATA_LINES.map((line, idx) => (
                    <AnimatePresence key={idx}>
                      {visibleLines.includes(idx) && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`${
                            line.includes("CHECK")
                              ? "text-green-400"
                              : line.includes(">>")
                              ? "text-cyan-400/70"
                              : "text-white/50"
                          }`}
                        >
                          {line}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-cyan-400"
                  >
                    _
                  </motion.span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
