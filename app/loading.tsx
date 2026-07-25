"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white/70 backdrop-blur-md flex flex-col items-center justify-center gap-6">
      <div className="relative flex flex-col items-center">
        {/* Outer branded ring */}
        <div className="w-20 h-20 rounded-full border-[3px] border-slate-100 border-t-[#0D4A86] animate-spin mb-4" />
        
        {/* Branded text logo */}
        <motion.h2 
          initial={{ opacity: 0.3, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1.5,
            ease: "easeInOut"
          }}
          className="text-2xl sm:text-3xl font-extrabold tracking-widest text-[#0D4A86]" 
          style={{ fontFamily: '"American Typewriter","American Typewriter Std",serif' }}
        >
          FADENFAB
        </motion.h2>
      </div>
    </div>
  );
}
