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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
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
              className={`group flex flex-col transition-all duration-300 ${
                item.comingSoon ? "cursor-not-allowed opacity-75" : "cursor-pointer"
              }`}
            >
              {/* Image Wrapper */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100/60 rounded-none border border-slate-100">
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

                {item.comingSoon && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <span className="bg-white/95 text-slate-800 tracking-widest uppercase font-bold px-5 py-2.5 text-xs border border-slate-200">
                      Coming Soon
                    </span>
                  </div>
                )}
              </div>

              {/* Text Description Below Image (Luxury Storefront Style) */}
              <div className="pt-4 pb-2 text-left">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#0D4A86] uppercase block">
                  {item.comingSoon ? "Next Season" : "Custom Collection"}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1" style={{ fontFamily: '"American Typewriter","American Typewriter Std",serif' }}>
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                  {item.comingSoon
                    ? "Premium corporate outerwear & tailored workwear coordinates"
                    : "Premium combed cotton, customized prints & embroidery"}
                </p>
                {!item.comingSoon && (
                  <span className="inline-block mt-3 text-xs font-semibold tracking-wider text-slate-800 border-b border-slate-800 pb-0.5 hover:text-[#0D4A86] hover:border-[#0D4A86] transition">
                    Explore Collection →
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}