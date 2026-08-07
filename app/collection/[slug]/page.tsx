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
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  const pairedSlug = slug === "oversized-tshirts" ? "premium-hoodies" : "oversized-tshirts";

  const [collection, setCollection] = useState<any>(null);
  const [pairedCollection, setPairedCollection] = useState<any>(null);
  const [wishlistedIds, setWishlistedIds] = useState<number[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [loading, setLoading] = useState(true);

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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        // 1. Load Cart
        const items = JSON.parse(localStorage.getItem("fadenfab_cart") || "[]");
        setCart(items);

        // 2. Fetch Wishlist
        if (user.email) {
          const { data } = await supabase
            .from("leads")
            .select("quantity")
            .eq("status", "wishlist")
            .eq("email", user.email);
          if (data) {
            setWishlistedIds(data.map((item: any) => parseInt(item.quantity) || 0));
          }
        }
      } else {
        setCart([]);
        setWishlistedIds([]);
      }

      // 3. Load Catalog Collection
      const catalog = getCatalog();
      if (catalog[slug]) {
        setCollection(catalog[slug]);
      } else {
        setCollection(null);
      }
      if (catalog[pairedSlug]) {
        setPairedCollection(catalog[pairedSlug]);
      } else {
        setPairedCollection(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("cart-updated", loadData);
    window.addEventListener("catalog-updated", loadData);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
      }
    );

    setIsDesktop(window.innerWidth >= 1024);
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("cart-updated", loadData);
      window.removeEventListener("catalog-updated", loadData);
      window.removeEventListener("resize", handleResize);
      subscription.unsubscribe();
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

  // ================= ADD COMBO DEAL TO CART =================
  const handleAddComboToCart = () => {
    const prod1 = collection?.products?.[0];
    const prod2 = pairedCollection?.products?.[0];

    if (!prod1 || !prod2) return;

    const currentCart = JSON.parse(localStorage.getItem("fadenfab_cart") || "[]");

    // Add Item 1 (current collection item)
    const idx1 = currentCart.findIndex((item: any) => item.id === prod1.id && item.slug === slug);
    if (idx1 > -1) {
      currentCart[idx1].quantity += 1;
    } else {
      currentCart.push({
        id: prod1.id,
        name: prod1.name,
        image: prod1.image,
        color: prod1.color,
        fabric: prod1.fabric,
        gsm: prod1.gsm,
        quantity: 1,
        slug: slug,
        price: slug === "oversized-tshirts" ? 699 : 1499
      });
    }

    // Add Item 2 (paired collection item)
    const idx2 = currentCart.findIndex((item: any) => item.id === prod2.id && item.slug === pairedSlug);
    if (idx2 > -1) {
      currentCart[idx2].quantity += 1;
    } else {
      currentCart.push({
        id: prod2.id,
        name: prod2.name,
        image: prod2.image,
        color: prod2.color,
        fabric: prod2.fabric,
        gsm: prod2.gsm,
        quantity: 1,
        slug: pairedSlug,
        price: pairedSlug === "oversized-tshirts" ? 699 : 1499
      });
    }

    localStorage.setItem("fadenfab_cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("cart-updated"));

    setModalConfig({
      isOpen: true,
      type: "success",
      title: "Combo Added!",
      message: `Success! Added the ${prod1.name} and ${prod2.name} to your cart. 15% Combo Discount is automatically applied!`,
      onConfirm: () => setModalConfig(null),
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white/70 backdrop-blur-md flex flex-col items-center justify-center gap-6">
        <div className="relative flex flex-col items-center">
          <div className="w-20 h-20 rounded-full border-[3px] border-slate-100 border-t-[#0D4A86] animate-spin mb-4" />
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
    <div className="min-h-screen flex flex-col justify-between relative w-full max-w-full overflow-x-hidden">
      <Navbar />
      <motion.div
        className="w-full relative flex-grow min-w-0 pt-28 md:pt-32"
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
                <motion.div
                  key={product.id}
                  className="bg-[#FAF9F6] overflow-hidden transition-all duration-300 border border-slate-100 flex flex-col justify-between"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: product.id * 0.05,
                  }}
                >
                  <div className="relative h-[250px] sm:h-[320px] bg-white flex items-center justify-center p-4 border-b border-slate-100">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-4 transition-transform duration-700 hover:scale-105"
                        sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
                        priority
                      />
                    ) : (
                      <span className="text-5xl text-slate-200">👕</span>
                    )}
                  </div>

                  <div className="p-5 text-left">
                    <h3 className="text-base font-bold text-slate-900 truncate uppercase tracking-wider font-serif">
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
                      <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
                        ₹{slug === "oversized-tshirts" ? "699" : "1,499"}
                      </span>

                      <div className={`items-center gap-2 ${user ? "flex" : "hidden md:flex"}`}>
                        <button
                          onClick={() => handleAddToWishlist(product)}
                          className="p-2 rounded-none border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-500 transition cursor-pointer flex items-center justify-center"
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
                          <div className="flex items-center border border-slate-200 rounded-none p-0.5 bg-slate-50/55">
                            <button
                              onClick={() => handleUpdateCartQuantity(product, -1)}
                              className="p-1 hover:bg-slate-200 rounded-none text-slate-600 transition cursor-pointer flex items-center justify-center"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-bold text-slate-800 text-xs">
                              {currentQty}
                            </span>
                            <button
                              onClick={() => handleUpdateCartQuantity(product, 1)}
                              className="p-1 hover:bg-slate-200 rounded-none text-slate-600 transition cursor-pointer flex items-center justify-center"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          /* Add to Cart CTA */
                          <button
                            onClick={() => handleUpdateCartQuantity(product, 1)}
                            className="bg-slate-950 hover:bg-slate-850 text-white px-4 py-2.5 rounded-none text-xs font-bold uppercase tracking-widest transition cursor-pointer"
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

      {/* ================= PERFECT PAIR COMBO DEAL ================= */}
      {pairedCollection && collection?.products?.[0] && pairedCollection?.products?.[0] && (
        <section className="max-w-7xl mx-auto px-6 pb-24 border-t border-slate-100 pt-16">
          <div className="bg-[#FAF9F6] border border-slate-200/60 p-8 md:p-12 text-center max-w-4xl mx-auto">
            <span className="text-[#0D4A86] text-xs font-bold tracking-[0.25em] uppercase">
              Exclusive Set Offer
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 mt-3 font-serif">
              The Perfect Pair Combo Deal
            </h2>
            <p className="text-slate-500 text-sm mt-3 max-w-xl mx-auto font-light leading-relaxed">
              Complete your collection coordinates. Purchase any Oversized T-Shirt and a Premium Hoodie together to automatically claim a <b>15% discount</b> on both!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-12 mt-10">
              {/* Product 1: current collection */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-40 bg-white border border-slate-100 p-2 flex items-center justify-center relative">
                  <img
                    src={collection.products[0].image}
                    alt={collection.products[0].name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs font-bold text-slate-700 mt-3 max-w-[120px] truncate uppercase tracking-wider">
                  {collection.products[0].name}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  ₹{slug === "oversized-tshirts" ? "699" : "1,499"}
                </p>
              </div>

              {/* PLUS SIGN */}
              <div className="text-2xl text-slate-400 font-light">+</div>

              {/* Product 2: paired collection */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-40 bg-white border border-slate-100 p-2 flex items-center justify-center relative">
                  <img
                    src={pairedCollection.products[0].image}
                    alt={pairedCollection.products[0].name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs font-bold text-slate-700 mt-3 max-w-[120px] truncate uppercase tracking-wider">
                  {pairedCollection.products[0].name}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  ₹{pairedSlug === "oversized-tshirts" ? "699" : "1,499"}
                </p>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="mt-8 border-t border-slate-200/80 pt-6">
              <p className="text-xs text-slate-400 uppercase tracking-widest">Combo Price</p>
              <div className="flex items-center justify-center gap-3 mt-1">
                <span className="text-slate-400 line-through text-sm">₹{699 + 1499}</span>
                <span className="text-xl md:text-2xl font-extrabold text-green-600 font-serif">
                  ₹{Math.round((699 + 1499) * 0.85)}
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-none font-bold uppercase">
                  Save 15%
                </span>
              </div>

              <button
                onClick={handleAddComboToCart}
                className="mt-6 bg-slate-950 hover:bg-slate-850 text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 transition cursor-pointer"
              >
                Add Combo Set to Cart
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Floating Go to Cart Shortcut */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[45] w-[92%] max-w-md bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center justify-between animate-fadeIn border border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛒</span>
            <div>
              <p className="font-bold text-sm">
                {cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)} Item(s) added
              </p>
              <p className="text-xs text-slate-400">
                Ready to review and check out?
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/cart")}
            className="bg-white hover:bg-slate-100 text-slate-900 px-5 py-2 rounded-full font-bold text-sm transition cursor-pointer flex items-center gap-1.5 shadow-md hover:scale-105"
          >
            Go to Cart <span className="text-lg">→</span>
          </button>
        </div>
      )}
      </motion.div>
      <Footer />
    </div>
  );
}