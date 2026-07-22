"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white/70 backdrop-blur-md flex flex-col items-center justify-center gap-4">
      {/* Branded Loading Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#0D4A86] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
      
      {/* Brand Text */}
      <h2 
        className="text-xl font-bold tracking-widest text-[#0D4A86] animate-pulse" 
        style={{ fontFamily: '"American Typewriter","American Typewriter Std",serif' }}
      >
        FADENFAB
      </h2>
      <p className="text-xs text-slate-500 font-medium">Loading premium experience...</p>
    </div>
  );
}
