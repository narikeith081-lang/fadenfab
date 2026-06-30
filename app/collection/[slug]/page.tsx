"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

type Product = {
  id: number;
  name: string;
  image: string;
  color: string;
  fabric: string;
  gsm: string;
};

type Collection = {
  title: string;
  description: string;
  banner: string;
  products: Product[];
};

const collections: Record<string, Collection> = {

  // ================= OVERSIZED T-SHIRTS =================

  "oversized-tshirts": {
    title: "Oversized T-Shirts",
    description: "Premium oversized collection for street wear lovers.",

    banner: "/classicneverdies.png",

    products: [
      {
        id: 1,
        name: "Classic Never Dies",
        image: "/classicneverdies.png",
        color: "Color: Faded Black",
        fabric: "Material: 100% Premium Heavyweight Mineral-Wash Cotton",
        gsm: "240–280 GSM",
      },
      {
        id: 2,
        name: "Find Your Canvas",
        image: "/findyourcanvas2.png",
        color: "Color: Faded Olive Green",
        fabric: "Material: 100% Premium Heavyweight Mineral-Wash Cotton",
        gsm: "240–280 GSM",
      },
      {
        id: 3,
        name: "Timeless & Resilient",
        image: "/Timeless3.png",
        color: "Color: Faded Orange",
        fabric: "Material: 100% Premium Heavyweight Mineral-Wash Cotton",
        gsm: "240–280 GSM",
      },
      {
        id: 4,
        name: "Journeys of Endurance",
        image: "/Journeys4.png",
        color: "Color: Faded Sand Beige",
        fabric: "Material: 100% Premium Heavyweight Mineral-Wash Cotton",
        gsm: "240–280 GSM",
      },
      {
        id: 5,
        name: "Raw Power & Endurance",
        image: "/RawPower5.png",
        color: "Color: White",
        fabric: "Material: 100% Premium Heavyweight Mineral-Wash Cotton",
        gsm: "240–280 GSM",
      },
      {
        id: 6,
        name: "Precision & Steadfast",
        image: "/Precision6.png",
        color: "Color: Faded Navy",
        fabric: "Material: 100% Premium Heavyweight Mineral-Wash Cotton",
        gsm: "240–280 GSM",
      },
    ],
  },

  // ================= PREMIUM HOODIES =================

  hoodies: {
    title: "Premium Hoodies",

    description:
      "Luxury hoodies crafted with premium fleece for ultimate comfort, warmth and modern streetwear aesthetics.",

    banner: "/FutureVision_1.png",

    products: [
      {
        id: 1,
        name: "Future Vision",
        image: "/FutureVision_1.png",
        color: "Color: Sand Beige",
        fabric: "Material: Premium Brushed Fleece Cotton",
        gsm: "420 GSM",
      },

      {
        id: 2,
        name: "Elevate",
        image: "/Elevate2.png",
        color: "Color: Forest Green",
        fabric: "Material: Organic French Terry Cotton",
        gsm: "400 GSM",
      },

      {
        id: 3,
        name: "Discipline",
        image: "/3Discipline.png",
        color: "Color: Charcoal Black",
        fabric: "Material: Heavy Premium Terry Cotton",
        gsm: "380 GSM",
      },

      {
        id: 4,
        name: "Shadow Ronin",
        image: "/Shadow_ronin4.png",
        color: "Color: Burgundy",
        fabric: "Material: Cotton-Poly Premium Fleece Blend",
        gsm: "430 GSM",
      },

      {
        id: 5,
        name: "Midnight Rally",
        image: "/MidnightRally5.png",
        color: "Color: Midnight Navy",
        fabric: "Material: Heavyweight Loopback French Terry Cotton",
        gsm: "390 GSM",
      },

      {
        id: 6,
        name: "Atlas Explorer",
        image: "/AtlasExplorer6.png",
        color: "Color: Olive Green",
        fabric: "Material: Premium Sherpa-Lined Brushed Fleece Cotton",
        gsm: "450 GSM",
      },
    ],
  },
};



export default function CollectionPage() {
  const params = useParams();
  const slug = params.slug as string;

  const collection =
    collections[slug as keyof typeof collections];

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-3xl font-bold">
          Collection Not Found
        </h1>
      </div>
    );
  }

  return (
    <motion.main
  className="min-h-screen bg-slate-50"
  initial={{ opacity: 0, y: 60 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.8,
    ease: "easeOut",
  }}
>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <div>

            <span className="text-[#0D4A86] font-semibold uppercase tracking-wider">
              Our Collection
            </span>

            <h1 className="text-5xl font-extrabold mt-4 text-black">
              {collection.title}
            </h1>

            <p className="mt-6 text-lg text-slate-600">
              {collection.description}
            </p>

          </div>

          <div className="relative h-[450px] rounded-3xl overflow-hidden shadow-xl">

            <Image
              src={collection.banner}
              alt={collection.title}
              fill
              className="object-contain"
            />

          </div>

        </div>

      </section>

      {/* Products */}

      <section className="max-w-7xl mx-auto px-6 pb-20">

        <h2 className="text-3xl font-bold mb-10 text-black">
          Available Designs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">

          {collection.products.map((product) => (

<motion.div
  key={product.id}
  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{
    duration: 0.5,
    delay: product.id * 0.08,
  }}
>
  <div className="relative h-[420px] bg-gray-100 flex items-center justify-center p-4">

    <Image
      src={product.image}
      alt={product.name}
      fill
      className="object-contain"
      sizes="(max-width:768px) 100vw,
             (max-width:1200px) 50vw,
             33vw"
      priority
    />

  </div>

  <div className="p-6">

    <h3 className="text-xl font-bold text-[#0D4A86]">
      {product.name}
    </h3>

    {product.color && (
  <p className="mt-3 text-slate-600">
    {product.color}
  </p>
)}

    <p className="mt-2 text-slate-600">{product.fabric}</p>

    <p className="mt-2 text-slate-500 font-medium">
      {product.gsm}
    </p>

  </div>
</motion.div>

          ))}

        </div>

      </section>

    </motion.main>
  );
}