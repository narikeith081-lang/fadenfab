"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

// Reusable Hardware-Accelerated 3D Tilt Card component
function TiltCard({ children, className, isDesktop, ...props }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  const rX = useTransform(rotateX, [-0.5, 0.5], [10, -10]);
  const rY = useTransform(rotateY, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(mouseY);
    rotateY.set(mouseX);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isDesktop ? rX : 0,
        rotateY: isDesktop ? rY : 0,
        transformStyle: "preserve-3d",
      }}
      className={className}
      {...props}
    >
      <div style={{ transform: isDesktop ? "translateZ(20px)" : "none", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
}

const products = [
  {
    title: "Oversized T-Shirts",
    slug: "oversized-tshirts",
    image: "/classicneverdies.webp", // Cover image shown on homepage
  },

{
  title: "Premium Hoodies",
  slug: "hoodies",
  image: "/FutureVision_1.webp",
},

  {
    title: "Corporate Wear",
    slug: "corporate-wear",
    image: "/Precision6.webp",
    comingSoon: true,
  },

];
export default function Gallery() {
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      id="gallery"
      className="relative py-4 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 md:px-6">
          {products.map((item, i) => (
            <motion.div
              key={i}
              onClick={() => {
                if (!item.comingSoon) {
                  router.push(`/collection/${item.slug}`);
                }
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
              }}
              className={`group relative aspect-[4/3] w-full overflow-hidden rounded-[24px] md:rounded-[32px] border border-slate-200/50 shadow-md ${
                item.comingSoon ? "cursor-not-allowed opacity-85" : "cursor-pointer"
              }`}
            >
              {/* Image */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
                className={`object-cover transition-transform duration-1000 ease-out ${
                  item.comingSoon ? "grayscale brightness-90" : "group-hover:scale-105"
                }`}
                priority
              />

              {/* Luxury dark gradient overlay for blending typography */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 transition-opacity duration-300 group-hover:from-black/90 group-hover:via-black/40" />

              {/* Top Right "PREMIUM" Badge (or "NEXT SEASON") */}
              <span className="absolute top-4 right-4 md:top-5 md:right-5 bg-white/95 text-slate-800 text-[9px] md:text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                {item.comingSoon ? "NEXT SEASON" : "PREMIUM"}
              </span>

              {/* Overlaid Typography at Bottom Left */}
              <div className="absolute bottom-5 left-5 right-5 md:bottom-7 md:left-7 md:right-7 text-left text-white z-10 pointer-events-none">
                <h3 
                  className="text-xl md:text-2xl font-extrabold text-white font-serif leading-tight"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
                >
                  {item.title}
                </h3>
                <p 
                  className="text-slate-200 text-xs mt-1 md:mt-2 font-light leading-relaxed max-w-[85%]"
                  style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
                >
                  {item.comingSoon
                    ? "Premium corporate outerwear & tailored workwear"
                    : item.slug === "oversized-tshirts"
                    ? "Premium quality custom printing"
                    : "Premium combed fleece fabric"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}