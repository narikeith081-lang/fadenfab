"use client";

import React from "react";

interface CustomGarmentThumbnailProps {
  name: string;
  color: string;
  logo?: string;
}

export default function CustomGarmentThumbnail({ name, color, logo }: CustomGarmentThumbnailProps) {
  const isTee = name.toLowerCase().includes("tee") || name.toLowerCase().includes("t-shirt") || name.toLowerCase().includes("tshirt");
  const isHoodie = name.toLowerCase().includes("hoodie") || name.toLowerCase().includes("jacket");
  const isPolo = name.toLowerCase().includes("polo");

  const colorMap: Record<string, string> = {
    "Off-White": "#FCFBFA",
    "Obsidian Black": "#1C1C1C",
    "Muted Beige": "#D6CFC4",
    "Vintage Sage": "#9EAA9B",
    "faded black": "#2A2A2A",
    "faded olive green": "#5F665C",
    "faded orange": "#D97B56",
    "faded sand beige": "#C9BFA8",
    "white": "#FFFFFF",
    "faded navy": "#3B4D61",
    "sand beige": "#E6DEC9",
    "forest green": "#2D4C3A",
    "charcoal black": "#333333",
    "burgundy": "#5C2C35",
    "midnight navy": "#1F2937",
    "olive green": "#556B2F"
  };

  const cleanColor = color ? color.replace("Color: ", "").trim() : "Off-White";
  const colorHex = colorMap[cleanColor] || colorMap[cleanColor.toLowerCase()] || "#E2E8F0";

  const renderSVG = () => {
    if (isHoodie) {
      return (
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
          <path d="M25 25 L35 15 L45 20 L55 20 L65 15 L75 25 L82 40 L73 44 L70 34 L70 85 L30 85 L30 34 L27 44 L18 40 Z" fill={colorHex} stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M35 15 C35 5, 65 5, 65 15 C65 25, 35 25, 35 15 Z" fill={colorHex} stroke="#1E293B" strokeWidth="2" />
          <path d="M38 65 L62 65 L58 78 L42 78 Z" fill="none" stroke="#1E293B" strokeWidth="2" />
        </svg>
      );
    }
    if (isPolo) {
      return (
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
          <path d="M25 15 L35 10 L45 13 L55 13 L65 10 L75 15 L82 30 L73 34 L70 26 L70 85 L30 85 L30 26 L27 34 L18 30 Z" fill={colorHex} stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M40 10 L50 22 L60 10" stroke="#1E293B" strokeWidth="2" />
          <path d="M45 13 L50 25 L55 13" stroke="#1E293B" strokeWidth="2" />
        </svg>
      );
    }
    return (
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
        <path d="M25 15 L35 10 L45 13 L55 13 L65 10 L75 15 L82 30 L73 34 L70 26 L70 85 L30 85 L30 26 L27 34 L18 30 Z" fill={colorHex} stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M45 13 C45 20 55 20 55 13" stroke="#1E293B" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-50 p-1">
      {renderSVG()}
      {logo && logo.startsWith("data:image/") && (
        <div className="absolute top-[35%] left-[38%] w-[24%] h-[18%] flex items-center justify-center overflow-hidden">
          <img src={logo} alt="Branding" className="object-contain max-w-full max-h-full" />
        </div>
      )}
    </div>
  );
}
