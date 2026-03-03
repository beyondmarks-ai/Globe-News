"use client";

import React from "react";

export interface TimelineSliderProps {
  minTime: number;
  maxTime: number;
  currentTime: number;
  onChange: (value: number) => void;
  onFilter: (startTime: number, endTime: number) => void;
  onClear: () => void;
  isFiltering: boolean;
}

import TimeFilter from "./TimeFilter";

export function TimelineSlider({
  minTime,
  maxTime,
  currentTime,
  onChange,
  onFilter,
  onClear,
  isFiltering
}: TimelineSliderProps) {
  const formattedTime = new Date(currentTime).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
    timeZoneName: "short"
  });

  return (
    <div className="absolute bottom-10 left-1/2 z-40 flex w-full max-w-3xl -translate-x-1/2 flex-row items-center gap-4">
      {/* Time Machine Toggle Button (Left aligned with timeline) */}
      <TimeFilter onFilter={onFilter} onClear={onClear} isFiltering={isFiltering} />

      {/* Main Scrubber Control Panel */}
      <div className="flex-1 flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/70 px-6 py-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
          <span>Timeline</span>
          <span className="rounded-full bg-[#00E676]/10 px-3 py-1 text-[#00E676]">
            {formattedTime}
          </span>
        </div>

        <input
          type="range"
          min={minTime}
          max={maxTime}
          value={currentTime}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-800 accent-[#00E676]"
        />

        <div className="flex justify-between font-mono text-[10px] text-gray-500">
          <span>Past</span>
          <span>Live</span>
        </div>
      </div>
    </div>
  );
}
