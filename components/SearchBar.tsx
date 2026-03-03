"use client";

import React, { useState } from "react";
import { Search, Loader2 } from "lucide-react";

export default function SearchBar({
  onLocationFound,
}: {
  onLocationFound: (lat: number, lng: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        onLocationFound(lat, lng);
        setQuery("");
      } else {
        alert("Location not found. Try a different name.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="absolute left-1/2 top-8 z-50 w-full max-w-md -translate-x-1/2 px-4">
      <form
        onSubmit={handleSearch}
        className="relative flex w-full items-center overflow-hidden rounded-full border border-white/10 bg-black/60 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all focus-within:border-[#00E676]/50 focus-within:shadow-[0_0_20px_rgba(0,230,118,0.2)]"
      >
        <div className="pl-4 pr-2 text-gray-400">
          {isSearching ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Search size={18} />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search country, city, or region..."
          className="w-full bg-transparent py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={isSearching}
          className="border-l border-white/10 px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#00E676] transition-colors hover:bg-[#00E676]/10"
        >
          Fly
        </button>
      </form>
    </div>
  );
}
