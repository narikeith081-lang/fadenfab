"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, HeartIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCatalog } from "@/lib/products";
import CustomModal from "@/components/CustomModal";

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

    const fetchWishlistIds = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("wishlist")
          .select("product_id")
          .eq("user_id", user.id);
        if (data) {
          setWishlistedIds(data.map((item: any) => item.product_id));
        }
      }
    };
    fetchWishlistIds();

    return () => {
      window.removeEventListener("cart-updated", loadData);
      window.removeEventListener("catalog-updated", loadData);
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
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", product.id);

        if (error) throw error;
        setWishlistedIds(wishlistedIds.filter((id) => id !== product.id));

        setModalConfig({
          isOpen: true,
          type: "info",
          title: "Wishlist Updated",
          message: `${product.name} removed from your wishlist.`,
          onConfirm: () => setModalConfig(null),
        });
      } else {
        const { error } = await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: product.id,
            product_slug: slug,
            product_name: product.name,
            product_image: product.image,
          });

        if (error) throw error;
        setWishlistedIds([...wishlistedIds, product.id]);

        setModalConfig({
          isOpen: true,
          type: "success",
          title: "Added to Wishlist",
          message: `${product.name} saved to your wishlist.`,
          onConfirm: () => setModalConfig(null),
        });
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
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <h2 className="text-3xl font-bold mb-10 text-black">
          Available Designs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {collection.products && collection.products.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-500 font-medium">
              No designs currently available in this collection.
            </div>
          ) : (
            collection.products.map((product: any) => {
              const cartItem = cart.find((item: any) => item.id === product.id && item.slug === slug);
              const currentQty = cartItem ? cartItem.quantity : 0;

              return (
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
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
                        priority
                      />
                    ) : (
                      <span className="text-6xl text-slate-300">👕</span>
                    )}
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

                    {/* Scarcity warning when stock <= 5 */}
                    {product.stock <= 5 && (
                      <p className="mt-2.5 text-red-500 font-bold text-xs animate-pulse flex items-center gap-1.5">
                        <span>⚠️</span> Only {product.stock} left! Hurry up soon!
                      </p>
                    )}

                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-2xl font-extrabold text-[#0D4A86]">
                        ₹{slug === "oversized-tshirts" ? "699" : "1,499"}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddToWishlist(product)}
                          className="p-2.5 rounded-full border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-500 transition cursor-pointer flex items-center justify-center"
                          title={wishlistedIds.includes(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                          {wishlistedIds.includes(product.id) ? (
                            <HeartIconSolid className="w-5 h-5 text-red-500" />
                          ) : (
                            <HeartIcon className="w-5 h-5" />
                          )}
                        </button>

                        {currentQty > 0 ? (
                          /* Quantity selector adjuster */
                          <div className="flex items-center border border-slate-200 rounded-full p-1 bg-slate-50/50">
                            <button
                              onClick={() => handleUpdateCartQuantity(product, -1)}
                              className="p-1.5 hover:bg-slate-200 rounded-full text-slate-600 transition cursor-pointer flex items-center justify-center"
                            >
                              <MinusIcon className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center font-bold text-slate-800 text-sm">
                              {currentQty}
                            </span>
                            <button
                              onClick={() => handleUpdateCartQuantity(product, 1)}
                              className="p-1.5 hover:bg-slate-200 rounded-full text-slate-600 transition cursor-pointer flex items-center justify-center"
                            >
                              <PlusIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          /* Add to Cart CTA */
                          <button
                            onClick={() => handleUpdateCartQuantity(product, 1)}
                            className="bg-[#0D4A86] hover:bg-[#083A6B] text-white px-5 py-2.5 rounded-full text-xs font-bold transition cursor-pointer shadow-md hover:shadow-lg"
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </section>
    </motion.main>
  );
}