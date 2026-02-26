"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface HypeGaugeProps {
  value: number; // -100 to 100
}

export function HypeGauge({ value }: HypeGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 150);
    return () => clearTimeout(timer);
  }, [value]);

  // Progress: 0 to 1 mapped from -100 to 100
  const progress = (animatedValue + 100) / 200;

  // Arc geometry
  const radius = 80;
  const cx = 100;
  const cy = 95;
  const startAngle = Math.PI; // 180 degrees (left)
  const endAngle = 0; // 0 degrees (right)
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Needle angle
  const needleAngle = Math.PI - progress * Math.PI;
  const needleLength = 65;
  const needleX = cx + needleLength * Math.cos(needleAngle);
  const needleY = cy - needleLength * Math.sin(needleAngle);

  const getLabel = (v: number) => {
    if (v >= 60) return "Very Bullish";
    if (v >= 20) return "Bullish";
    if (v > -20) return "Neutral";
    if (v > -60) return "Bearish";
    return "Very Bearish";
  };

  const getColorClass = (v: number) => {
    if (v >= 60) return "text-emerald-500";
    if (v >= 20) return "text-emerald-400";
    if (v > -20) return "text-amber-400";
    if (v > -60) return "text-red-400";
    return "text-red-500";
  };

  const getGradientId = "hypeGradient";

  return (
    <Card className="overflow-hidden border-border/40">
      <CardContent className="p-6 flex flex-col items-center">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Hype Index
        </p>

        <svg viewBox="0 0 200 120" className="w-full max-w-[260px]">
          <defs>
            <linearGradient id={getGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            className="text-muted/50"
          />

          {/* Colored progress arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={`url(#${getGradientId})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />

          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-foreground transition-all duration-1000 ease-out"
          />
          <circle cx={cx} cy={cy} r="4" className="fill-foreground" />

          {/* Scale labels */}
          <text x={cx - radius - 5} y={cy + 16} textAnchor="middle" className="fill-muted-foreground" fontSize="9" fontWeight="500">
            -100
          </text>
          <text x={cx} y={cy - radius + 2} textAnchor="middle" className="fill-muted-foreground" fontSize="9" fontWeight="500">
            0
          </text>
          <text x={cx + radius + 5} y={cy + 16} textAnchor="middle" className="fill-muted-foreground" fontSize="9" fontWeight="500">
            +100
          </text>
        </svg>

        <div className="text-center mt-3 space-y-1">
          <p className={`text-4xl font-bold tracking-tight ${getColorClass(value)}`}>
            {value > 0 ? "+" : ""}
            {value.toFixed(1)}
          </p>
          <p className={`text-sm font-medium ${getColorClass(value)}`}>
            {getLabel(value)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
