"use client";

import React, { useState } from "react";
import { Clock, CalendarIcon, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TimeFilterProps {
    onFilter: (startTime: number, endTime: number) => void;
    onClear: () => void;
    isFiltering: boolean;
}

export default function TimeFilter({ onFilter, onClear, isFiltering }: TimeFilterProps) {
    const [dateStr, setDateStr] = useState("");
    const [hourStr, setHourStr] = useState("12");
    const [isOpen, setIsOpen] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!dateStr || !hourStr) return;

        // Create start epoch string, parsing it as IST (+05:30)
        // ISO format: YYYY-MM-DDTHH:MM:SS+05:30
        const [year, month, day] = dateStr.split("-").map(Number);
        const hour = Number(hourStr);

        const isoStringStart = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00+05:30`;
        const isoStringEnd = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:59:59+05:30`;

        const startTime = new Date(isoStringStart).getTime();
        const endTime = new Date(isoStringEnd).getTime();

        // Validate: Block searches before March 1, 2026 IST
        const LAUNCH_DATE_IST = new Date("2026-03-01T00:00:00+05:30").getTime();
        if (startTime < LAUNCH_DATE_IST) {
            setShowWarning(true);
            return;
        }

        onFilter(startTime, endTime);
        setIsOpen(false);
    };

    const handleClear = () => {
        onClear();
        setDateStr("");
        setHourStr("12");
        setIsOpen(false);
    }

    return (
        <div className="relative flex flex-col items-start gap-4 pointer-events-auto">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex h-12 w-12 items-center justify-center rounded-full shadow-2xl backdrop-blur-xl transition-all duration-300 z-50 ${isFiltering
                    ? "bg-white/20 border border-white text-white"
                    : isOpen
                        ? "bg-white/10 border border-white/20 text-white"
                        : "bg-black/60 border border-white/10 text-gray-400 hover:text-white"
                    }`}
            >
                <Clock className="h-5 w-5" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 10, scale: 0.95, filter: "blur(5px)" }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute bottom-full left-0 mb-4 w-[340px] rounded-3xl border border-white/10 bg-black/80 p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-50 origin-bottom-left"
                    >
                        <h3 className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            Historical Machine
                        </h3>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/40">Select Date</label>
                                <div className="relative group">
                                    <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#00E676] transition-colors">
                                        <CalendarIcon className="h-4 w-4" />
                                    </span>
                                    <input
                                        type="date"
                                        required
                                        value={dateStr}
                                        onChange={(e) => setDateStr(e.target.value)}
                                        className="h-12 w-full rounded-2xl border border-white/5 bg-white/5 pl-11 pr-4 text-sm font-medium tracking-wide text-white transition-all focus:border-[#00E676]/50 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-[#00E676]/10 placeholder:text-white/20 appearance-none"
                                        style={{ colorScheme: "dark" }}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/40">IST Window</label>
                                <div className="relative group">
                                    <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#00E676] transition-colors">
                                        <Clock className="h-4 w-4" />
                                    </span>
                                    <select
                                        required
                                        value={hourStr}
                                        onChange={(e) => setHourStr(e.target.value)}
                                        className="h-12 w-full cursor-pointer rounded-2xl border border-white/5 bg-white/5 pl-11 pr-4 text-sm font-medium tracking-wide text-white transition-all focus:border-[#00E676]/50 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-[#00E676]/10 appearance-none hide-scrollbar"
                                    >
                                        {Array.from({ length: 24 }).map((_, i) => {
                                            const ampm = i >= 12 ? 'PM' : 'AM';
                                            const displayHour = i % 12 || 12;
                                            return (
                                                <option key={i} value={i.toString().padStart(2, "0")} className="bg-neutral-900 border-none">
                                                    {displayHour.toString().padStart(2, "0")}:00 {ampm} — {displayHour.toString().padStart(2, "0")}:59 {ampm}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white/30 group-focus-within:text-[#00E676] transition-colors">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 flex gap-3">
                                {isFiltering && (
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        className="flex-1 rounded-2xl bg-white/5 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white/50 transition-all hover:bg-white/10 hover:text-white"
                                    >
                                        Clear
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="flex-[2] rounded-2xl bg-[#00E676] py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-black transition-all hover:bg-[#00E676]/90 hover:shadow-[0_0_20px_rgba(0,230,118,0.4)]"
                                >
                                    Activate
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Invalid Date Warning Popup */}
            <AnimatePresence>
                {showWarning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-red-500/20 bg-black/90 p-8 shadow-[0_0_50px_rgba(255,51,102,0.15)] backdrop-blur-xl"
                        >
                            <button
                                onClick={() => setShowWarning(false)}
                                className="absolute right-6 top-6 rounded-full bg-white/5 p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <div className="mb-6 flex items-center justify-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-[#FF3366]">
                                    <AlertTriangle className="h-8 w-8" />
                                </div>
                            </div>

                            <div className="text-center">
                                <h2 className="mb-2 text-xl font-bold tracking-tight text-white">System Released on Mar 1st, 2026</h2>
                                <p className="mb-8 text-sm leading-relaxed text-white/60">
                                    We&apos;re sorry! The Globe News engine was officially initialized on <strong>March 1, 2026</strong>. Archival real-time sentiment data prior to this deployment date has not been ingested into the main server block.
                                </p>

                                <button
                                    onClick={() => setShowWarning(false)}
                                    className="w-full rounded-2xl bg-white/10 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white/20 hover:shadow-lg"
                                >
                                    Understood
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
