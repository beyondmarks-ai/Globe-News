"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Info, Target, MapPin, ExternalLink } from "lucide-react";
import type { NewsEvent } from "./NewsSentimentMap";

interface SummarizeData {
  imageUrl: string | null;
  what: string;
  why: string;
  where: string;
}

interface NewsPopupProps {
  selectedEvent: NewsEvent | null;
  onClose: () => void;
}

export function NewsPopup({ selectedEvent, onClose }: NewsPopupProps) {
  const [data, setData] = useState<SummarizeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!selectedEvent?.news_link) {
      setData(null);
      setLoading(false);
      setExiting(false);
      return;
    }
    setLoading(true);
    setError(false);
    setData(null);
    setExiting(false);

    const url = `/api/summarize?url=${encodeURIComponent(selectedEvent.news_link)}`;
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        setData({
          imageUrl: json.imageUrl ?? null,
          what: json.what ?? "—",
          why: json.why ?? "—",
          where: json.where ?? "—",
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [selectedEvent?.id, selectedEvent?.news_link]);

  const handleClose = () => {
    setExiting(true);
  };

  if (!selectedEvent) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={
        exiting
          ? { opacity: 0, y: 20 }
          : { opacity: 1, y: 0 }
      }
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      onAnimationComplete={() => exiting && onClose()}
      className="absolute bottom-8 right-8 z-50 flex w-[400px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-2xl backdrop-blur-xl"
    >
      {/* 1. STICKY HEADER: Always visible at the top */}
      <div className="z-10 flex items-center justify-between border-b border-white/10 bg-black/50 p-4">
        <h3 className="truncate pr-4 font-semibold text-white">
          {selectedEvent.location_name || "Unknown location"}
        </h3>
        <button
          type="button"
          onClick={handleClose}
          className="text-gray-400 transition-colors hover:text-white"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* 2. SCROLLABLE BODY */}
      <div className="custom-scrollbar max-h-[60vh] flex-1 overflow-y-auto">
        {loading ? (
          <>
            <div className="h-48 w-full animate-pulse bg-white/5" />
            <div className="space-y-4 p-5">
              <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-full animate-pulse rounded bg-white/10" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
            </div>
          </>
        ) : error ? (
          <div className="p-5">
            <p className="text-sm text-gray-400">
              Could not load summary. Try opening the article directly.
            </p>
          </div>
        ) : data ? (
          <>
            {data.imageUrl && (
              <img
                src={data.imageUrl}
                alt="Article thumbnail"
                className="h-48 w-full object-cover"
              />
            )}
            <div className="space-y-6 p-5">
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00E676]">
                  <Info size={14} />
                  What Happened
                </h4>
                <p className="text-sm leading-relaxed text-gray-300">
                  {data.what}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00E676]">
                  <Target size={14} />
                  Why It Matters
                </h4>
                <p className="text-sm leading-relaxed text-gray-300">
                  {data.why}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00E676]">
                  <MapPin size={14} />
                  Where
                </h4>
                <p className="text-sm leading-relaxed text-gray-300">
                  {data.where}
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* 3. STICKY FOOTER: Always visible at the bottom */}
      <div className="z-10 border-t border-white/10 bg-black/50 p-4">
        <a
          href={selectedEvent.news_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
        >
          Read full article
          <ExternalLink size={16} />
        </a>
      </div>
    </motion.div>
  );
}
