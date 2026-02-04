"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  Sparkles,
  ClipboardPaste,
  X,
  FileSpreadsheet,
  BookOpen,
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
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          <span className="bg-gradient-to-r from-sky-500 via-violet-500 to-sky-400 bg-clip-text text-transparent">
            Arianee
          </span>{" "}
          <span className="text-slate-800">PCDS & AGEC Analyser</span>
        </h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Drop any textile data — supplier emails, PDF content, raw descriptions
          — and watch it transform into dual-compliance structured data.
        </p>
      </div>

      {/* Dropzone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl transition-all duration-300 border-2 border-dashed ${
          isDragOver
            ? "border-sky-400 bg-sky-50 scale-[1.02]"
            : "border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50"
        } shadow-sm`}
      >
        {/* Animated border gradient */}
        <div
          className={`absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none ${
            isDragOver ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(45deg, rgba(14,165,233,0.05), rgba(139,92,246,0.05), rgba(14,165,233,0.05))",
          }}
        />

        <div className="relative p-8">
          {/* Text Area */}
          <div className="relative">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={"Paste your textile product data here...\n\nExamples:\n\u2022 Supplier email content\n\u2022 PDF text extraction\n\u2022 Raw product descriptions\n\u2022 Material composition sheets"}
              className="w-full h-48 bg-transparent border-0 text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-0 text-sm font-mono leading-relaxed"
              disabled={isLoading}
            />
            {textInput && (
              <button
                onClick={clearInput}
                className="absolute top-0 right-0 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            <span className="text-slate-400 text-xs font-medium">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
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
              <span className="text-xs text-sky-600 flex items-center gap-1">
                <FileText size={12} />
                {fileName}
              </span>
            )}

            {/* Submit Button */}
            <div className="ml-auto">
              <Button
                onClick={handleSubmit}
                disabled={!textInput.trim() || isLoading}
                className="gap-2 relative overflow-hidden"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload size={14} />
                    Analyze
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Nomenclature Button */}
      <div className="mt-8 text-center">
        <Link href="/nomenclature">
          <Button
            variant="outline"
            size="lg"
            className="gap-3 px-8 py-6 text-base font-medium border-2 border-sky-200 hover:border-sky-400 hover:bg-sky-50 text-slate-700"
          >
            <BookOpen size={20} className="text-sky-500" />
            Nomenclature et score AGEC et PCDS
          </Button>
        </Link>
      </div>

      {/* Hint */}
      <p className="text-center text-slate-400 text-xs mt-4">
        Powered by Claude AI — ISO 59040 + AGEC dual-compliance engine
      </p>
    </div>
  );
}
