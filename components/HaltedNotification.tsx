"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, ServerOff } from "lucide-react";

export function HaltedNotification() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show popup on every page load after a short delay
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleDismiss}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/80 p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              {/* Ambient glow behind the icon */}
              <div className="absolute -left-4 -top-4 h-32 w-32 rounded-full bg-amber-500/20 blur-[32px]" />
              
              <div className="relative flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <ServerOff className="h-6 w-6" />
                </div>
                
                <div className="flex-1 pt-1">
                  <h3 className="mb-2 text-base font-semibold uppercase tracking-wider text-amber-500">
                    System Notice
                  </h3>
                  <p className="text-sm leading-relaxed text-white/80">
                    Live data ingestion has been halted to optimize infrastructure costs. 
                    This application currently serves as a demonstration prototype rather than a production service.
                  </p>
                </div>

                <button
                  onClick={handleDismiss}
                  className="shrink-0 rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Dismiss notification"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Decorative progress line */}
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
