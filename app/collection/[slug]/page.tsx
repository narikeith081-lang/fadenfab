"use client";

import { useParams } from "next/navigation";
import Image from "next/image";

const collections = {

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
        fabric: "Material: 100% Premium Heavyweight Mineral-Wash Cotton",
        gsm: "240–280 GSM",
      },
      {
        id: 2,
        name: "Find Your Canvas",
        image: "/findyourcanvas2.png",
        fabric: "Material: 100% Premium Heavyweight Mineral-Wash Cotton",
        gsm: "240–280 GSM",
      },
      {
        id: 3,
        name: "Timeless & Resilient",
        image: "/Timeless3.png",
        fabric: "Material: 100% Premium Heavyweight Mineral-Wash Cotton",
        gsm: "240–280 GSM",
      },
      {
        id: 4,
        name: "Journeys of Endurance",
        image: "/Journeys4.png",
        fabric: "Material: 100% Premium Heavyweight Mineral-Wash Cotton",
        gsm: "240–280 GSM",
      },
      {
        id: 5,
        name: "Raw Power & Endurance",
        image: "/RawPower5.png",
        fabric: "Material: 100% Premium Heavyweight Mineral-Wash Cotton",
        gsm: "240–280 GSM",
      },
      {
        id: 6,
        name: "Precision & Steadfast",
        image: "/Precision6.png",
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

    banner: "/FutureVision1.png",

    products: [
      {
        id: 1,
        name: "Future Vision",
        image: "/FutureVision1.png",
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
        image: "/Discipline3.png",
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
    <main className="min-h-screen bg-slate-50">

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
              className="object-cover"
            />

          </div>

        </div>

      </section>

      {/* Products */}

      <section className="max-w-7xl mx-auto px-6 pb-20">

        <h2 className="text-3xl font-bold mb-10 text-black">
          Available Designs
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

          {collection.products.map((product) => (

            <div
              key={product.id}
              className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300"
            >

              <div className="relative h-80">

                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />

              </div>

              <div className="p-6">

                <h3 className="text-xl font-bold text-[#0D4A86]">
                  {product.name}
                </h3>
                 <p className="mt-3 text-slate-600">
                  {product.color}
                </p>
                <p className="mt-3 text-slate-600">
                  {product.fabric}
                </p>

                <p className="text-slate-500">
                  {product.gsm}
                </p>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}