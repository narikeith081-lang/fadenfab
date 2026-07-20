export type Product = {
  id: number;
  name: string;
  image: string;
  color: string;
  fabric: string;
  gsm: string;
  stock: number;
};

export type Collection = {
  title: string;
  description: string;
  banner: string;
  products: Product[];
};

const DEFAULT_PRODUCTS: Record<string, Collection> = {
  "oversized-tshirts": {
    title: "Oversized T-Shirts",
    description: "Premium oversized collection for street wear lovers.",
    banner: "/classicneverdies.webp",
    products: [
      {
        id: 1,
        name: "Classic Never Dies",
        image: "/classicneverdies.webp",
        color: "Color: Faded Black",
        fabric: "Material: 100% Premium Heavyweight Mineral-Wash Cotton",
        gsm: "240–280 GSM",
        stock: 3
      },
      {
        id: 2,
        name: "Find Your Canvas",
        image: "/findyourcanvas2.webp",
        color: "Color: Faded Olive Green",
        fabric: "Material: 100% Premium Heavyweight Mineral-Wash Cotton",
        gsm: "240–280 GSM",
        stock: 10
      },
      {
        id: 3,
        name: "Timeless & Resilient",
        image: "/Timeless3.webp",
        color: "Color: Faded Orange",
        fabric: "Material: 100% Premium Heavyweight Mineral-Wash Cotton",
        gsm: "240–280 GSM",
        stock: 4
      },
      {
        id: 4,
        name: "Journeys of Endurance",
        image: "/Journeys4.webp",
        color: "Color: Faded Sand Beige",
        fabric: "Material: 100% Premium Heavyweight Mineral-Wash Cotton",
        gsm: "240–280 GSM",
        stock: 12
      },
      {
        id: 5,
        name: "Raw Power & Endurance",
        image: "/RawPower5.webp",
        color: "Color: White",
        fabric: "Material: 100% Premium Heavyweight Mineral-Wash Cotton",
        gsm: "240–280 GSM",
        stock: 2
      },
      {
        id: 6,
        name: "Precision & Steadfast",
        image: "/Precision6.webp",
        color: "Color: Faded Navy",
        fabric: "Material: 100% Premium Heavyweight Mineral-Wash Cotton",
        gsm: "240–280 GSM",
        stock: 15
      }
    ]
  },
  "hoodies": {
    title: "Premium Hoodies",
    description: "Luxury hoodies crafted with premium fleece for ultimate comfort, warmth and modern streetwear aesthetics.",
    banner: "/FutureVision_1.webp",
    products: [
      {
        id: 1,
        name: "Future Vision",
        image: "/FutureVision_1.webp",
        color: "Color: Sand Beige",
        fabric: "Material: Premium Brushed Fleece Cotton",
        gsm: "420 GSM",
        stock: 4
      },
      {
        id: 2,
        name: "Elevate",
        image: "/Elevate2.webp",
        color: "Color: Forest Green",
        fabric: "Material: Organic French Terry Cotton",
        gsm: "400 GSM",
        stock: 10
      },
      {
        id: 3,
        name: "Discipline",
        image: "/3Discipline.webp",
        color: "Color: Charcoal Black",
        fabric: "Material: Heavy Premium Terry Cotton",
        gsm: "380 GSM",
        stock: 1
      },
      {
        id: 4,
        name: "Shadow Ronin",
        image: "/Shadow_ronin4.webp",
        color: "Color: Burgundy",
        fabric: "Material: Cotton-Poly Premium Fleece Blend",
        gsm: "430 GSM",
        stock: 15
      },
      {
        id: 5,
        name: "Midnight Rally",
        image: "/MidnightRally5.webp",
        color: "Color: Midnight Navy",
        fabric: "Material: Heavyweight Loopback French Terry Cotton",
        gsm: "390 GSM",
        stock: 25
      },
      {
        id: 6,
        name: "Atlas Explorer",
        image: "/AtlasExplorer6.webp",
        color: "Color: Olive Green",
        fabric: "Material: Premium Sherpa-Lined Brushed Fleece Cotton",
        gsm: "450 GSM",
        stock: 3
      }
    ]
  }
};

export const getCatalog = (): Record<string, Collection> => {
  if (typeof window === "undefined") return DEFAULT_PRODUCTS;
  let stored = localStorage.getItem("fadenfab_catalog");
  if (!stored) {
    localStorage.setItem("fadenfab_catalog", JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }
  if (stored.includes(".png")) {
    stored = stored.replace(/\.png/g, ".webp");
    localStorage.setItem("fadenfab_catalog", stored);
  }
  return JSON.parse(stored);
};

export const saveCatalog = (catalog: Record<string, Collection>) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("fadenfab_catalog", JSON.stringify(catalog));
    window.dispatchEvent(new Event("catalog-updated"));
  }
};
