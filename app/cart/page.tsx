"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ArrowRightIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import CustomModal from "@/components/CustomModal";
import { getCatalog } from "@/lib/products";
import ProtectedRoute from "@/components/ProtectedRoute";

function CustomGarmentThumbnail({ name, color, logo }: { name: string; color: string; logo?: string }) {
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

type CartItem = {
  id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
  fabric: string;
  color: string;
  slug: string;
  gsm?: string;
  size?: string;
};

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  // Custom Modal state
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "success" | "warning" | "error" | "info" | "confirm";
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Load applied coupon on mount
  useEffect(() => {
    const saved = localStorage.getItem("fadenfab_applied_coupon");
    if (saved) {
      setAppliedCoupon(JSON.parse(saved));
    }
  }, []);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    const validCoupons: Record<string, number> = {
      "FADENFAB10": 10,
      "WELCOME20": 20,
      "SUPER50": 50
    };

    if (validCoupons[code]) {
      const discount = validCoupons[code];
      const couponObj = { code, discount };
      localStorage.setItem("fadenfab_applied_coupon", JSON.stringify(couponObj));
      setAppliedCoupon(couponObj);
      setCouponCode("");
      setModalConfig({
        isOpen: true,
        type: "success",
        title: "Coupon Applied",
        message: `Success! Code "${code}" has been applied. You get a ${discount}% discount on your order.`,
        onConfirm: () => setModalConfig(null)
      });
    } else {
      setModalConfig({
        isOpen: true,
        type: "error",
        title: "Invalid Coupon",
        message: "Sorry, this coupon code does not exist or has expired.",
        onConfirm: () => setModalConfig(null)
      });
    }
  };

  const handleRemoveCoupon = () => {
    localStorage.removeItem("fadenfab_applied_coupon");
    setAppliedCoupon(null);
    setModalConfig({
      isOpen: true,
      type: "info",
      title: "Coupon Removed",
      message: "The coupon code has been removed.",
      onConfirm: () => setModalConfig(null)
    });
  };

  // ================= LOAD CART =================
  const loadCart = useCallback(() => {
    const items = JSON.parse(localStorage.getItem("fadenfab_cart") || "[]");
    setCart(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCart();
    
    // Listen to changes
    window.addEventListener("cart-updated", loadCart);
    return () => {
      window.removeEventListener("cart-updated", loadCart);
    };
  }, [loadCart]);

  const getProductStock = (id: number, slug: string): number => {
    const catalog = getCatalog();
    const product = catalog[slug]?.products.find((p) => p.id === id);
    return product ? product.stock : 999;
  };

  // ================= QUANTITY CHANGE =================
  const handleQuantityChange = (id: number, slug: string, delta: number) => {
    let stockAlert = false;
    const maxStock = getProductStock(id, slug);

    const updated = cart.map((item) => {
      if (item.id === id && item.slug === slug) {
        const newQty = item.quantity + delta;
        if (newQty > maxStock) {
          stockAlert = true;
          return item;
        }
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    });

    if (stockAlert) {
      setModalConfig({
        isOpen: true,
        type: "warning",
        title: "Stock Limit Reached",
        message: `Only ${maxStock} units of this design are left in stock!`,
        onConfirm: () => setModalConfig(null)
      });
      return;
    }

    localStorage.setItem("fadenfab_cart", JSON.stringify(updated));
    setCart(updated);
    window.dispatchEvent(new Event("cart-updated"));
  };

  // ================= REMOVE ITEM =================
  const handleRemoveItem = (id: number, slug: string) => {
    const updated = cart.filter((item) => !(item.id === id && item.slug === slug));
    localStorage.setItem("fadenfab_cart", JSON.stringify(updated));
    setCart(updated);
    window.dispatchEvent(new Event("cart-updated"));
  };

  // ================= CLEAR CART =================
  const handleClearCart = () => {
    localStorage.removeItem("fadenfab_cart");
    setCart([]);
    window.dispatchEvent(new Event("cart-updated"));
  };

  // ================= PRICING & CROSS SELL =================
  const hasTshirt = cart.some(item => item.slug === "oversized-tshirts");
  const hasHoodie = cart.some(item => item.slug === "premium-hoodies");

  const crossSellSlug = hasTshirt && !hasHoodie ? "premium-hoodies" : (!hasTshirt && hasHoodie ? "oversized-tshirts" : null);
  const crossSellProduct = crossSellSlug ? getCatalog()[crossSellSlug]?.products[0] : null;

  const handleAddCrossSell = () => {
    if (!crossSellProduct || !crossSellSlug) return;
    const currentCart = [...cart];
    const existingIndex = currentCart.findIndex((item: any) => item.id === crossSellProduct.id && item.slug === crossSellSlug);
    const price = crossSellSlug === "oversized-tshirts" ? 699 : 1499;

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += 1;
    } else {
      currentCart.push({
        id: crossSellProduct.id,
        name: crossSellProduct.name,
        image: crossSellProduct.image,
        color: crossSellProduct.color,
        fabric: crossSellProduct.fabric,
        gsm: crossSellProduct.gsm,
        quantity: 1,
        slug: crossSellSlug,
        price: price
      });
    }

    setCart(currentCart);
    localStorage.setItem("fadenfab_cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("cart-updated"));

    setModalConfig({
      isOpen: true,
      type: "success",
      title: "Combo Activated!",
      message: `Added ${crossSellProduct.name} to your cart. Automatic 15% Combo Discount is now applied!`,
      onConfirm: () => setModalConfig(null),
    });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartHoodies: number[] = [];
  const cartTshirts: number[] = [];
  cart.forEach(item => {
    if (item.slug === "premium-hoodies") {
      for (let i = 0; i < item.quantity; i++) {
        cartHoodies.push(item.price);
      }
    } else if (item.slug === "oversized-tshirts") {
      for (let i = 0; i < item.quantity; i++) {
        cartTshirts.push(item.price);
      }
    }
  });
  cartHoodies.sort((a, b) => b - a);
  cartTshirts.sort((a, b) => b - a);
  
  let comboDiscount = 0;
  const maxCombos = Math.min(cartHoodies.length, cartTshirts.length, 3);
  for (let i = 0; i < maxCombos; i++) {
    comboDiscount += Math.round((cartHoodies[i] + cartTshirts[i]) * 0.15);
  }
  const isComboActive = comboDiscount > 0;

  const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 100;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const couponDiscountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discount) / 100) : 0;

  // Maximize user discount
  const discountAmount = Math.max(comboDiscount, couponDiscountAmount);
  const total = subtotal + shipping + tax - discountAmount;

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col justify-between relative w-full max-w-full overflow-x-hidden">
        <Navbar />
        <div className="w-full relative flex-grow min-w-0">
      {/* Background Glows */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-32 w-[550px] h-[550px] bg-blue-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-yellow-400/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[140px]" />
      </div>



      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-10 w-full flex-grow">
        {/* Page Title */}
        <div className="mb-6 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Shopping Cart
          </h1>
          <p className="mt-2 text-sm text-slate-650">
            Review your custom designs and proceed to secure checkout.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">
            Loading your cart...
          </div>
        ) : cart.length === 0 ? (
          /* ================= EMPTY STATE ================= */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 p-8 shadow-xl max-w-xl mx-auto"
          >
            <ShoppingBagIcon className="w-20 h-20 text-slate-300 mx-auto mb-6 animate-pulse" />
            <h2 className="text-2xl font-bold text-slate-800">
              Your Cart is Empty
            </h2>
            <p className="text-slate-500 mt-3 leading-relaxed">
              Looks like you haven't added any premium custom designs to your cart yet. Explore our latest oversized T-shirts and fleece hoodies!
            </p>
            <Link
              href="/"
              className="mt-8 inline-block bg-[#0D4A86] hover:bg-[#083A6B] text-white px-8 py-4 rounded-full font-bold transition shadow-lg shadow-blue-500/15"
            >
              Explore Collection
            </Link>
          </motion.div>
        ) : (
          /* ================= CART CONTENT ================= */
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="font-bold text-slate-800 text-lg">
                  {cart.length} {cart.length === 1 ? "Item" : "Items"} in Cart
                </span>
                <button
                  onClick={handleClearCart}
                  className="text-red-500 hover:text-red-600 text-sm font-semibold transition cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                <AnimatePresence>
                  {cart.map((item, index) => (
                    <motion.div
                      key={`${item.id}-${item.slug}`}
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0, padding: 0 }}
                      className="flex flex-col sm:flex-row gap-6 py-6 items-start sm:items-center justify-between"
                    >
                      {/* Image & Info */}
                      <div className="flex gap-4 items-center flex-1">
                        <div className="relative w-20 h-24 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                          {item.name.startsWith("Custom") ? (
                            <CustomGarmentThumbnail name={item.name} color={item.color} logo={item.image} />
                          ) : item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="object-contain w-full h-full p-1"
                            />
                          ) : (
                            <span className="text-2xl">👕</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 leading-snug">
                            {item.name}
                          </h3>
                          <span className="text-xs text-[#0D4A86] font-bold mt-1 inline-block uppercase tracking-wider">
                            {item.slug === "oversized-tshirts" ? "Oversized T-Shirt" : "Premium Hoodie"}
                          </span>
                          <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                            <span>Size:</span>
                            <select
                              value={item.size || "L"}
                              onChange={(e) => {
                                const newSize = e.target.value;
                                const updatedCart = cart.map((cartItem, idx) => 
                                  idx === index ? { ...cartItem, size: newSize } : cartItem
                                );
                                setCart(updatedCart);
                                localStorage.setItem("fadenfab_cart", JSON.stringify(updatedCart));
                                window.dispatchEvent(new Event("cart-updated"));
                              }}
                              className="font-extrabold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded px-1 py-0.5 text-[10px] focus:outline-none focus:border-[#0D4A86] transition cursor-pointer"
                            >
                              {["S", "M", "L", "XL", "XXL"].map((sz) => (
                                <option key={sz} value={sz}>{sz}</option>
                              ))}
                            </select>
                            <span className="text-slate-300">|</span>
                            <span>{item.color}</span>
                            <span className="text-slate-300">|</span>
                            <span>{item.fabric || "Premium Fabric"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Adjuster & Price */}
                      <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto shrink-0">
                        {/* Adjuster */}
                        <div className="flex items-center border border-slate-200 rounded-full p-1 bg-slate-50/50">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.slug, -1)}
                            className="p-1.5 hover:bg-slate-200 rounded-full text-slate-600 transition cursor-pointer"
                          >
                            <MinusIcon className="w-3 h-3" />
                          </button>
                          <span className="w-10 text-center font-bold text-slate-800 text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.slug, 1)}
                            className="p-1.5 hover:bg-slate-200 rounded-full text-slate-600 transition cursor-pointer"
                          >
                            <PlusIcon className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Totals */}
                        <div className="text-right min-w-[90px]">
                          <span className="block font-extrabold text-slate-900">
                            ₹{item.price * item.quantity}
                          </span>
                          <span className="block text-xs text-slate-400 mt-0.5">
                            ₹{item.price} each
                          </span>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => handleRemoveItem(item.id, item.slug)}
                          className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition cursor-pointer"
                          title="Remove item"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pairing Cross-sell Recommendation Box */}
              {crossSellProduct && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-[#FAF9F6] border border-slate-200/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-16 h-20 bg-white border border-slate-100 p-1 shrink-0 relative flex items-center justify-center">
                      {crossSellProduct.image ? (
                        <img src={crossSellProduct.image} alt={crossSellProduct.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xl">👕</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 tracking-wider uppercase font-serif">
                        Complete the Look & Save 15%
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-md font-light">
                        Pair your order with a matching {crossSellSlug === "oversized-tshirts" ? "Oversized T-Shirt" : "Premium Hoodie"} ({crossSellProduct.name}) to activate the automatic combo discount!
                      </p>
                      <span className="text-xs font-bold text-slate-900 block mt-1">
                        Add for ₹{crossSellSlug === "oversized-tshirts" ? "699" : "1,499"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleAddCrossSell}
                    className="bg-slate-950 hover:bg-slate-850 text-white text-xs font-bold uppercase tracking-widest px-5 py-3 transition shrink-0 cursor-pointer"
                  >
                    Add Pair
                  </button>
                </motion.div>
              )}
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-6">
              <h2 className="font-bold text-slate-900 text-xl pb-4 border-b border-slate-100">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-800">
                    {shipping === 0 ? (
                      <span className="text-green-600 font-bold">FREE</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (5%)</span>
                  <span className="font-semibold text-slate-800">₹{tax}</span>
                </div>

                 {isComboActive && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Combo Discount (15% Off)</span>
                    <span>-₹{comboDiscount}</span>
                  </div>
                )}

                {!isComboActive && appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{couponDiscountAmount}</span>
                  </div>
                )}

                {!isComboActive && subtotal > 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 text-xs text-amber-800 leading-relaxed font-light">
                    💡 <b>Combo Offer:</b> Add both a <b>T-Shirt</b> and a <b>Hoodie</b> to unlock an automatic <b>15% discount</b> on your order!
                  </div>
                )}

                {shipping > 0 && (
                  <div className="bg-slate-900/5 p-3.5 text-xs text-slate-700 leading-relaxed font-light">
                    💡 Add <b>₹{Math.max(0, 1000 - subtotal)}</b> more to qualify for <b>FREE shipping</b>!
                  </div>
                )}

                {/* Coupon Code Input */}
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Have a Coupon?</span>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3.5">
                      <div>
                        <p className="text-xs font-bold text-green-700">{appliedCoupon.code} Applied</p>
                        <p className="text-[10px] text-green-600 mt-0.5">{appliedCoupon.discount}% Off discount</p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-xs font-extrabold text-red-500 hover:text-red-700 transition cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. FADENFAB10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase outline-none focus:border-[#0D4A86]"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="bg-[#0D4A86] hover:bg-[#083A6B] text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-slate-900 font-extrabold text-xl">
                  <span>Total</span>
                  <span className="text-2xl text-[#0D4A86]">₹{total}</span>
                </div>
              </div>

              {/* Proceed */}
              <button
                onClick={() => router.push("/checkout")}
                className="w-full bg-[#0D4A86] hover:bg-[#083A6B] text-white py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="text-center">
                <Link
                  href="/"
                  className="text-xs font-semibold text-slate-500 hover:text-[#0D4A86] transition"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {modalConfig && (
        <CustomModal
          isOpen={modalConfig.isOpen}
          type={modalConfig.type}
          title={modalConfig.title}
          message={modalConfig.message}
          onConfirm={modalConfig.onConfirm}
        />
      )}

      </div>
      <Footer />
    </div>
    </ProtectedRoute>
  );
}