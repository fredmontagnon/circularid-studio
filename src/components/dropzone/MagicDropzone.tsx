"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Sparkles,
  ClipboardPaste,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MagicDropzoneProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

export function MagicDropzone({ onSubmit, isLoading }: MagicDropzoneProps) {
  const [textInput, setTextInput] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setTextInput(text);
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTextInput(text);
    } catch {
      // Clipboard API may not be available
    }
  };

  const handleSubmit = () => {
    if (textInput.trim()) {
      onSubmit(textInput.trim());
    }
  };

  const clearInput = () => {
    setTextInput("");
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
            CircularID
          </span>{" "}
          <span className="text-white/90">Studio</span>
        </h1>
        <p className="text-white/40 text-sm max-w-md mx-auto">
          Drop any textile data — supplier emails, PDF content, raw descriptions
          — and watch it transform into dual-compliance structured data.
        </p>
      </motion.div>

      {/* Dropzone Area */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl transition-all duration-300 ${
          isDragOver
            ? "glass-strong glow-cyan scale-[1.02]"
            : "glass hover:border-cyan-500/20"
        }`}
        whileHover={{ borderColor: "rgba(0, 240, 255, 0.2)" }}
      >
        {/* Animated border gradient */}
        <div
          className={`absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none ${
            isDragOver ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(45deg, rgba(0,240,255,0.1), rgba(168,85,247,0.1), rgba(0,240,255,0.1))",
          }}
        />

        <div className="relative p-8">
          {/* Text Area */}
          <div className="relative">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your textile product data here...&#10;&#10;Examples:&#10;• Supplier email content&#10;• PDF text extraction&#10;• Raw product descriptions&#10;• Material composition sheets"
              className="w-full h-48 bg-transparent border-0 text-white/90 placeholder-white/20 resize-none focus:outline-none focus:ring-0 text-sm font-mono leading-relaxed"
              disabled={isLoading}
            />
            {textInput && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={clearInput}
                className="absolute top-0 right-0 p-1 text-white/30 hover:text-white/60 transition-colors"
              >
                <X size={16} />
              </motion.button>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-white/20 text-xs font-mono">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePaste}
              disabled={isLoading}
              className="gap-2"
            >
              <ClipboardPaste size={14} />
              Paste from Clipboard
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="gap-2"
            >
              <FileSpreadsheet size={14} />
              Upload CSV / TXT
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.tsv"
              onChange={handleFileSelect}
              className="hidden"
            />

            {fileName && (
              <AnimatePresence>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-cyan-400/60 flex items-center gap-1"
                >
                  <FileText size={12} />
                  {fileName}
                </motion.span>
              </AnimatePresence>
            )}

            {/* Submit Button */}
            <div className="ml-auto">
              <Button
                onClick={handleSubmit}
                disabled={!textInput.trim() || isLoading}
                className="gap-2 relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Sparkles size={14} />
                      </motion.div>
                      Analyzing...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Upload size={14} />
                      Analyze
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center text-white/15 text-xs mt-4"
      >
        Powered by Claude AI — ISO 59040 + AGEC dual-compliance engine
      </motion.p>
    </motion.div>
  );
}
