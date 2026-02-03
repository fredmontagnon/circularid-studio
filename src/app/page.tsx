"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MagicDropzone } from "@/components/dropzone/MagicDropzone";
import { ScanningAnimation } from "@/components/scanning/ScanningAnimation";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { BatchDashboard } from "@/components/dashboard/BatchDashboard";
import { isCSVFormat, parseCSV, extractProductName } from "@/lib/csv-parser";
import type { ComplianceData } from "@/lib/schema";

type AppState = "input" | "scanning" | "dashboard" | "batch-dashboard";

export interface ProductHistoryEntry {
  data: ComplianceData;
  rawInput: string;
  timestamp: Date;
}

interface BatchProductEntry {
  data: ComplianceData;
  rawInput: string;
  productName: string;
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>("input");
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(
    null
  );
  const [rawInput, setRawInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [productHistory, setProductHistory] = useState<ProductHistoryEntry[]>(
    []
  );
  const [batchProducts, setBatchProducts] = useState<BatchProductEntry[]>([]);
  const [scanningProgress, setScanningProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const handleSubmit = useCallback(async (input: string) => {
    setRawInput(input);
    setError(null);
    setAppState("scanning");
    setScanningProgress(null);

    // Check if input is CSV format
    const isCSV = isCSVFormat(input);

    if (isCSV) {
      // Batch processing mode
      try {
        const { headers, rows, rawRowStrings } = parseCSV(input);
        const productNames = rows.map((row) =>
          extractProductName(headers, row)
        );

        setScanningProgress({ current: 0, total: rows.length });

        const response = await fetch("/api/analyze-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: rawRowStrings, productNames }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Batch analysis failed");
        }

        const result = await response.json();

        // Wait for scanning animation minimum duration
        await new Promise((resolve) => setTimeout(resolve, 4000));

        // Build batch products array from successful results
        const successfulProducts: BatchProductEntry[] = result.results
          .filter((r: { success: boolean }) => r.success)
          .map(
            (r: {
              data: ComplianceData;
              rawInput: string;
              productName: string;
            }) => ({
              data: r.data,
              rawInput: r.rawInput,
              productName: r.productName,
            })
          );

        if (successfulProducts.length === 0) {
          // Get first error for debugging
          const failedResults = result.results?.filter(
            (r: { success: boolean }) => !r.success
          ) || [];
          const firstError = failedResults[0];
          const errorDetail = firstError?.error || "No results returned";
          console.error("Batch failed. Results:", JSON.stringify(result, null, 2));
          throw new Error(
            `Batch analysis failed (${failedResults.length} errors). First error: ${errorDetail}`
          );
        }

        setBatchProducts(successfulProducts);
        setAppState("batch-dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setAppState("input");
        setScanningProgress(null);
      }
    } else {
      // Single product mode (existing flow)
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
        setProductHistory((prev) => [
          ...prev,
          { data: result.data, rawInput: input, timestamp: new Date() },
        ]);
        setAppState("dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setAppState("input");
      }
    }
  }, []);

  const handleReset = useCallback(() => {
    setComplianceData(null);
    setBatchProducts([]);
    setRawInput("");
    setError(null);
    setScanningProgress(null);
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
      <ScanningAnimation
        isActive={appState === "scanning"}
        progress={scanningProgress}
      />

      {/* Content */}
      <div className="relative z-10">
        {appState === "input" && (
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="w-full">
              <MagicDropzone onSubmit={handleSubmit} isLoading={false} />
              {error && (
                <div className="max-w-3xl mx-auto mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {appState === "dashboard" && complianceData && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-8"
          >
            <Dashboard
              data={complianceData}
              rawInput={rawInput}
              onReset={handleReset}
              productHistory={productHistory}
            />
          </motion.div>
        )}

        {appState === "batch-dashboard" && batchProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <BatchDashboard products={batchProducts} onReset={handleReset} />
          </motion.div>
        )}
      </div>
    </main>
  );
}
