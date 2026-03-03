"use client";

import React from "react";
import { Activity } from "lucide-react";

export interface TensionMeterDatum {
  sentiment_score: number;
}

export default function TensionMeter({ data }: { data: TensionMeterDatum[] }) {
  if (!data || data.length === 0) return null;

  const avgSentiment =
    data.reduce((acc, curr) => acc + curr.sentiment_score, 0) / data.length;

  let status = "STABLE";
  let color = "text-yellow-400";
  let bgColor = "bg-yellow-400/10";
  let borderColor = "border-yellow-400/30";

  if (avgSentiment <= -1.5) {
    status = "CRITICAL";
    color = "text-[#FF3366]";
    bgColor = "bg-[#FF3366]/10";
    borderColor = "border-[#FF3366]/30";
  } else if (avgSentiment < 0) {
    status = "ELEVATED";
    color = "text-orange-400";
    bgColor = "bg-orange-400/10";
    borderColor = "border-orange-400/30";
  } else if (avgSentiment > 1.5) {
    status = "PEACEFUL";
    color = "text-[#00E676]";
    bgColor = "bg-[#00E676]/10";
    borderColor = "border-[#00E676]/30";
  }

  return (
    <div
      className={`absolute left-8 top-8 z-50 flex items-center gap-4 rounded-full border px-6 py-3 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-500 ${borderColor} bg-black/70`}
    >
      <div className={`rounded-full p-2 ${bgColor} ${color}`}>
        <Activity
          size={20}
          className={status === "CRITICAL" ? "animate-pulse" : ""}
        />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Global Tension Index
        </span>
        <span className={`text-base font-black tracking-widest ${color}`}>
          {status}{" "}
          <span className="ml-1 font-mono text-xs text-gray-400">
            ({avgSentiment > 0 ? "+" : ""}
            {avgSentiment.toFixed(2)})
          </span>
        </span>
      </div>
    </div>
  );
}
