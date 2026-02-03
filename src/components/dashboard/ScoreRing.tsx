"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  label: string;
  subtitle?: string;
  size?: number;
  delay?: number;
}

function getScoreColor(score: number): {
  primary: string;
  glow: string;
  bg: string;
  class: string;
} {
  if (score >= 80) {
    return {
      primary: "#22c55e",
      glow: "rgba(34, 197, 94, 0.3)",
      bg: "rgba(34, 197, 94, 0.05)",
      class: "glow-green",
    };
  }
  if (score >= 50) {
    return {
      primary: "#f59e0b",
      glow: "rgba(245, 158, 11, 0.3)",
      bg: "rgba(245, 158, 11, 0.05)",
      class: "glow-orange",
    };
  }
  return {
    primary: "#ef4444",
    glow: "rgba(239, 68, 68, 0.3)",
    bg: "rgba(239, 68, 68, 0.05)",
    class: "glow-red",
  };
}

export function ScoreRing({
  score,
  label,
  subtitle,
  size = 180,
  delay = 0,
}: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const colors = getScoreColor(score);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1500;
      const steps = 60;
      const increment = score / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(interval);
        } else {
          setAnimatedScore(Math.round(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [score, delay]);

  const data = [
    { name: "score", value: animatedScore },
    { name: "remaining", value: 100 - animatedScore },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay / 1000, duration: 0.5, ease: "easeOut" }}
      className={`relative flex flex-col items-center`}
      style={{ width: size }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={size * 0.35}
              outerRadius={size * 0.42}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
              cornerRadius={4}
            >
              <Cell fill={colors.primary} />
              <Cell fill="#e2e8f0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold tabular-nums"
            style={{ color: colors.primary }}
          >
            {animatedScore}
          </motion.span>
          <span
            className="text-[10px] font-mono uppercase tracking-widest text-slate-400"
          >
            / 100
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
