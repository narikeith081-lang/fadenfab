"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

const products = [
  {
    title: "Oversized T-Shirts",
    slug: "oversized-tshirts",
    image: "/classicneverdies.png", // Cover image shown on homepage
  },

{
  title: "Premium Hoodies",
  slug: "hoodies",
  image: "/FutureVision1.png",
},

  {
    title: "Corporate Wear",
    slug: "corporate-wear",
    image: "/streetculture.png",
    comingSoon: true,
  },

];
export default function Gallery() {
  const router = useRouter();

  return (
    <section
      id="gallery"
      className="relative py-28 px-6 bg-gradient-to-b from-white to-slate-50 overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-[#0D4A86]/5 blur-[140px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#0D4A86]/10/10 blur-[140px] rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          
        </motion.div>
        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((item, i) => (
            <motion.div
  key={i}
  onClick={() => {
    if (!item.comingSoon) {
      router.push(`/collection/${item.slug}`);
    }
  }}
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.5,
    delay: i * 0.08,
  }}
  whileHover={{
    y: item.comingSoon ? 0 : -10,
    scale: item.comingSoon ? 1 : 1.02,
  }}
  className={`group relative overflow-hidden rounded-[32px] bg-white border border-slate-200 shadow-lg transition-all duration-500 ${
    item.comingSoon
      ? "cursor-not-allowed opacity-90"
      : "cursor-pointer hover:shadow-2xl"
  }`}
>
              {/* Image */}
<div className="relative h-[420px] overflow-hidden">
  <Image
    src={item.image}
    alt={item.title}
    fill
    sizes="(max-width:768px) 100vw,
           (max-width:1200px) 50vw,
           33vw"
    className={`object-cover transition-transform duration-700 ${
      item.comingSoon
        ? "grayscale brightness-75"
        : "group-hover:scale-110"
    }`}
  />

  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

  {item.comingSoon && (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="bg-[#0D4A86]/10 text-[#0D4A86] font-bold px-6 py-3 rounded-full text-lg shadow-xl">
        🚀 Coming Soon
      </span>
    </div>
  )}
</div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="text-2xl font-bold text-white">
                  {item.title}
                </h3>

<p className="text-white/80 mt-3">
  {item.comingSoon
    ? "Launching Soon"
    : "Premium quality custom printing"}
</p>
              </div>

              {/* Premium Badge */}
<div
  className={`absolute top-5 right-5 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold shadow-md ${
    item.comingSoon
      ? "bg-[#0D4A86]/10 text-[#0D4A86]"
      : "bg-white/90 text-[#0D4A86]"
  }`}
>
  {item.comingSoon ? "" : "PREMIUM"}
</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}