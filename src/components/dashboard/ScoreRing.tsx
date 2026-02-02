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
      primary: "#39ff14",
      glow: "rgba(57, 255, 20, 0.3)",
      bg: "rgba(57, 255, 20, 0.05)",
      class: "glow-green",
    };
  }
  if (score >= 50) {
    return {
      primary: "#ff6a00",
      glow: "rgba(255, 106, 0, 0.3)",
      bg: "rgba(255, 106, 0, 0.05)",
      class: "glow-orange",
    };
  }
  return {
    primary: "#ff0032",
    glow: "rgba(255, 0, 50, 0.3)",
    bg: "rgba(255, 0, 50, 0.05)",
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
      className={`relative flex flex-col items-center ${colors.class}`}
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
              <Cell fill="rgba(255,255,255,0.05)" />
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
            className="text-[10px] font-mono uppercase tracking-widest"
            style={{ color: colors.primary, opacity: 0.6 }}
          >
            / 100
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <p className="text-sm font-medium text-white/80">{label}</p>
        {subtitle && (
          <p className="text-xs text-white/30 mt-0.5">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
