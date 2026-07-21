"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, HeartIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { getCatalog } from "@/lib/products";
import CustomModal from "@/components/CustomModal";

// Reusable Hardware-Accelerated 3D Tilt Card component
function TiltCard({ children, className, isDesktop, ...props }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  const rX = useTransform(rotateX, [-0.5, 0.5], [8, -8]);
  const rY = useTransform(rotateY, [-0.5, 0.5], [-8, 8]);

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
      <div style={{ transform: isDesktop ? "translateZ(15px)" : "none", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
}

type Product = {
  id: number;
  name: string;
  image: string;
  color: string;
  fabric: string;
  gsm: string;
  stock: number;
};

export default function CollectionPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [collection, setCollection] = useState<any>(null);
  const [wishlistedIds, setWishlistedIds] = useState<number[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);

  // Professional Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "success" | "warning" | "error" | "info" | "confirm";
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // ================= LOAD DATA =================
  const loadData = async () => {
    // 1. Load Cart only if logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const items = JSON.parse(localStorage.getItem("fadenfab_cart") || "[]");
      setCart(items);
    } else {
      setCart([]);
    }

    // 2. Load Catalog Collection
    const catalog = getCatalog();
    if (catalog[slug]) {
      setCollection(catalog[slug]);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("cart-updated", loadData);
    window.addEventListener("catalog-updated", loadData);

    setIsDesktop(window.innerWidth >= 1024);
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);

    const fetchWishlistIds = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        const { data } = await supabase
          .from("leads")
          .select("quantity")
          .eq("status", "wishlist")
          .eq("email", user.email);
        if (data) {
          setWishlistedIds(data.map((item: any) => parseInt(item.quantity) || 0));
        }
      }
    };
    fetchWishlistIds();

    return () => {
      window.removeEventListener("cart-updated", loadData);
      window.removeEventListener("catalog-updated", loadData);
      window.removeEventListener("resize", handleResize);
    };
  }, [slug]);

  // ================= ADD / EDIT QUANTITY =================
  const handleUpdateCartQuantity = async (product: Product, delta: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/userlogin");
      return;
    }

    const currentCart = JSON.parse(localStorage.getItem("fadenfab_cart") || "[]");
    const existingIndex = currentCart.findIndex((item: any) => item.id === product.id && item.slug === slug);
    const price = slug === "oversized-tshirts" ? 699 : 1499;

    if (existingIndex > -1) {
      const newQty = currentCart[existingIndex].quantity + delta;
      if (newQty <= 0) {
        currentCart.splice(existingIndex, 1);
        setModalConfig({
          isOpen: true,
          type: "info",
          title: "Removed",
          message: `${product.name} removed from your cart.`,
          onConfirm: () => setModalConfig(null),
        });
      } else {
        if (newQty > product.stock) {
          setModalConfig({
            isOpen: true,
            type: "warning",
            title: "Stock Limit Reached",
            message: `Only ${product.stock} units of ${product.name} are available in stock.`,
            onConfirm: () => setModalConfig(null),
          });
          return;
        }
        currentCart[existingIndex].quantity = newQty;
      }
    } else {
      if (delta > 0) {
        if (1 > product.stock) {
          setModalConfig({
            isOpen: true,
            type: "warning",
            title: "Out of Stock",
            message: `Sorry! ${product.name} is currently out of stock.`,
            onConfirm: () => setModalConfig(null),
          });
          return;
        }
        currentCart.push({
          id: product.id,
          name: product.name,
          image: product.image,
          quantity: 1,
          price,
          fabric: product.fabric,
          color: product.color,
          slug,
        });

        setModalConfig({
          isOpen: true,
          type: "success",
          title: "Added to Cart",
          message: `${product.name} has been added to your shopping cart.`,
          onConfirm: () => setModalConfig(null),
        });
      }
    }

    localStorage.setItem("fadenfab_cart", JSON.stringify(currentCart));
    setCart(currentCart);
    window.dispatchEvent(new Event("cart-updated"));
  };

  // ================= WISHLIST ACTIONS =================
  const handleAddToWishlist = async (product: Product) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/userlogin");
      return;
    }

    const isCurrentlyWishlisted = wishlistedIds.includes(product.id);

    try {
      if (isCurrentlyWishlisted) {
        const { error } = await supabase
          .from("leads")
          .delete()
          .eq("email", user.email)
          .eq("status", "wishlist")
          .eq("quantity", product.id.toString());

        if (error) throw error;
        setWishlistedIds(wishlistedIds.filter((id) => id !== product.id));
      } else {
        const { error } = await supabase
          .from("leads")
          .insert({
            name: product.name,
            email: user.email,
            phone: "N/A",
            company: slug,
            quantity: product.id.toString(),
            message: product.image,
            status: "wishlist"
          });

        if (error) throw error;
        setWishlistedIds([...wishlistedIds, product.id]);
      }

      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (err) {
      console.error(err);
    }
  };

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
      {/* Reusable Professional Popups */}
      {modalConfig && (
        <CustomModal
          isOpen={modalConfig.isOpen}
          type={modalConfig.type}
          title={modalConfig.title}
          message={modalConfig.message}
          onConfirm={modalConfig.onConfirm}
        />
      )}

      {/* ================= BACK BUTTON ================= */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/collection");
            }
          }}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-slate-700 shadow-sm transition-all duration-300 hover:bg-[#0D4A86] hover:text-white hover:border-[#0D4A86]"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
      </div>

      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-20">
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
            {collection.banner && (
              <Image
                src={collection.banner}
                alt={collection.title}
                fill
                className="object-contain"
              />
            )}
          </div>
        </div>
      </section>

      {/* ================= PRODUCTS GRID ================= */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-black">
          Available Designs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" style={{ perspective: 1000 }}>
          {collection.products && collection.products.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-500 font-medium">
              No designs currently available in this collection.
            </div>
          ) : (
            collection.products.map((product: any) => {
              const cartItem = cart.find((item: any) => item.id === product.id && item.slug === slug);
              const currentQty = cartItem ? cartItem.quantity : 0;

              return (
                <TiltCard
                  key={product.id}
                  isDesktop={isDesktop}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: product.id * 0.08,
                  }}
                  whileHover={isDesktop ? {
                    y: -6,
                    scale: 1.01
                  } : {}}
                >
                  <div className="relative h-[220px] sm:h-[300px] bg-slate-50/80 flex items-center justify-center p-4">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
                        priority
                      />
                    ) : (
                      <span className="text-5xl text-slate-300">👕</span>
                    )}
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-[#0D4A86] truncate">
                      {product.name}
                    </h3>

                    {product.color && (
                      <p className="mt-1.5 text-xs sm:text-sm text-slate-600 truncate">
                        {product.color}
                      </p>
                    )}

                    <p className="mt-1 text-xs sm:text-sm text-slate-600 truncate">{product.fabric}</p>

                    <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                      {product.gsm}
                    </p>

                    {/* Scarcity warning when stock <= 5 */}
                    {product.stock <= 5 && (
                      <p className="mt-2 text-red-500 font-bold text-[10px] sm:text-xs animate-pulse flex items-center gap-1">
                        <span>⚠️</span> Only {product.stock} left!
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-xl sm:text-2xl font-extrabold text-[#0D4A86]">
                        ₹{slug === "oversized-tshirts" ? "699" : "1,499"}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddToWishlist(product)}
                          className="p-2 rounded-full border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-500 transition cursor-pointer flex items-center justify-center"
                          title={wishlistedIds.includes(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                          {wishlistedIds.includes(product.id) ? (
                            <HeartIconSolid className="w-4 h-4 text-red-500" />
                          ) : (
                            <HeartIcon className="w-4 h-4" />
                          )}
                        </button>

                        {currentQty > 0 ? (
                          /* Quantity selector adjuster */
                          <div className="flex items-center border border-slate-200 rounded-full p-0.5 bg-slate-50/50">
                            <button
                              onClick={() => handleUpdateCartQuantity(product, -1)}
                              className="p-1 hover:bg-slate-200 rounded-full text-slate-600 transition cursor-pointer flex items-center justify-center"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-bold text-slate-800 text-xs">
                              {currentQty}
                            </span>
                            <button
                              onClick={() => handleUpdateCartQuantity(product, 1)}
                              className="p-1 hover:bg-slate-200 rounded-full text-slate-600 transition cursor-pointer flex items-center justify-center"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          /* Add to Cart CTA */
                          <button
                            onClick={() => handleUpdateCartQuantity(product, 1)}
                            className="bg-[#0D4A86] hover:bg-[#083A6B] text-white px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer shadow-md hover:shadow-lg"
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              );
            })
          )}
        </div>
      </section>
    </motion.main>
  );
}