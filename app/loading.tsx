"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-2xl flex flex-col items-center max-w-[280px] text-center">
        {/* Spinner */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 mb-4">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-[#0D4A86] border-r-[#0D4A86] rounded-full animate-spin" />
        </div>

        {/* Text */}
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-wider font-serif mb-1 uppercase">
          FADENFAB
        </h3>
        <p className="text-xs text-slate-550 font-light leading-relaxed">
          Loading premium experience...
        </p>
      </div>
    </div>
  );
}
