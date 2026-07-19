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

type CartItem = {
  id: number;
  name: string;
  image: string;
  quantity: number;
  price: number;
  fabric: string;
  color: string;
  slug: string;
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

  // ================= PRICING =================
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 100;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const discountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discount) / 100) : 0;
  const total = subtotal + shipping + tax - discountAmount;

  return (
    <main className="min-h-screen overflow-x-hidden text-slate-900 bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50 flex flex-col justify-between">
      {/* Background Glows */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-32 w-[550px] h-[550px] bg-blue-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-yellow-400/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[140px]" />
      </div>

      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-36 pb-24 w-full flex-grow">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900">
            Shopping Cart
          </h1>
          <p className="mt-2 text-slate-600">
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
                  {cart.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.slug}`}
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0, padding: 0 }}
                      className="flex flex-col sm:flex-row gap-6 py-6 items-start sm:items-center justify-between"
                    >
                      {/* Image & Info */}
                      <div className="flex gap-4 items-center flex-1">
                        <div className="relative w-20 h-24 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0 p-1 flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="object-contain w-full h-full"
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
                          <p className="text-xs text-slate-500 mt-1">
                            {item.color} | {item.fabric || "Premium Fabric"}
                          </p>
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

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                {shipping > 0 && (
                  <div className="bg-[#0D4A86]/5 rounded-xl p-3.5 text-xs text-[#0D4A86] leading-relaxed">
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

      <Footer />
    </main>
  );
}