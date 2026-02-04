"use client";

import { useLanguage, Language } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-1 py-1 border border-slate-200 shadow-sm">
      <Globe size={14} className="text-slate-400 ml-2" />
      <Button
        variant={language === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("en")}
        className={`h-7 px-3 text-xs font-medium rounded-full ${
          language === "en"
            ? "bg-sky-500 text-white hover:bg-sky-600"
            : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
        }`}
      >
        EN
      </Button>
      <Button
        variant={language === "fr" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("fr")}
        className={`h-7 px-3 text-xs font-medium rounded-full ${
          language === "fr"
            ? "bg-sky-500 text-white hover:bg-sky-600"
            : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
        }`}
      >
        FR
      </Button>
    </div>
  );
}
