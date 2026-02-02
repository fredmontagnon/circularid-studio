"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MagicDropzone } from "@/components/dropzone/MagicDropzone";
import { ScanningAnimation } from "@/components/scanning/ScanningAnimation";
import { Dashboard } from "@/components/dashboard/Dashboard";
import type { ComplianceData } from "@/lib/schema";

type AppState = "input" | "scanning" | "dashboard";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("input");
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(
    null
  );
  const [rawInput, setRawInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (input: string) => {
    setRawInput(input);
    setError(null);
    setAppState("scanning");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const result = await response.json();

      // Wait for scanning animation minimum duration
      await new Promise((resolve) => setTimeout(resolve, 8000));

      setComplianceData(result.data);
      setAppState("dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setAppState("input");
    }
  }, []);

  const handleReset = useCallback(() => {
    setComplianceData(null);
    setRawInput("");
    setError(null);
    setAppState("input");
  }, []);

  return (
    <main className="min-h-screen relative">
      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Scanning Overlay */}
      <ScanningAnimation isActive={appState === "scanning"} />

      {/* Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {appState === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-screen px-4"
            >
              <div className="w-full">
                <MagicDropzone
                  onSubmit={handleSubmit}
                  isLoading={false}
                />
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {appState === "dashboard" && complianceData && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="py-8"
            >
              <Dashboard
                data={complianceData}
                rawInput={rawInput}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
