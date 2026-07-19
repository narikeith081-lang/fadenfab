"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  CreditCardIcon,
  TruckIcon,
  ArrowRightIcon,
  ChevronLeftIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

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

export default function CheckoutPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  
  // Checkout States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  // ================= LOAD DATA =================
  useEffect(() => {
    const loadSessionAndCart = async () => {
      // Load user & profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          setFullName(profile.full_name || "");
          setMobile(profile.mobile || "");
          const savedAddress = localStorage.getItem(`fadenfab_address_${user.id}`) || "";
          setAddress(savedAddress);
        }
      }

      // Load cart
      const cartItems = JSON.parse(localStorage.getItem("fadenfab_cart") || "[]");
      setCart(cartItems);

      // Load applied coupon
      const savedCoupon = localStorage.getItem("fadenfab_applied_coupon");
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }

      // Redirect to home if cart is empty and checkout hasn't succeeded
      if (cartItems.length === 0 && !orderSuccess) {
        router.replace("/cart");
      }

      setLoading(false);
    };

    loadSessionAndCart();
  }, [router, orderSuccess]);

  // ================= PRICING =================
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 100;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const discountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discount) / 100) : 0;
  const total = subtotal + shipping + tax - discountAmount;

  // ================= PLACE ORDER =================
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Field Validation
    if (!fullName.trim() || !mobile.trim() || !address.trim() || !city.trim() || !stateName.trim() || !pinCode.trim()) {
      setErrorMessage("Please fill in all shipping details.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(pinCode)) {
      setErrorMessage("Please enter a valid 6-digit PIN code.");
      return;
    }

    try {
      setIsSubmitting(true);
      const orderAddress = {
        street: address,
        city,
        state: stateName,
        pincode: pinCode,
        fullName,
        mobile
      };

      const orderData = {
        user_id: user.id,
        status: "Processing",
        total,
        items: cart,
        shipping_address: orderAddress
      };

      let placedOrder: any = null;

      // 1. Save order to Supabase
      const { data, error } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.log("Supabase save failed, storing in localStorage fallback:", error);
        // Fallback to localStorage orders
        const localOrders = JSON.parse(localStorage.getItem("fadenfab_orders") || "[]");
        placedOrder = {
          id: `local-ord-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          ...orderData,
          created_at: new Date().toISOString()
        };
        localOrders.push(placedOrder);
        localStorage.setItem("fadenfab_orders", JSON.stringify(localOrders));
      } else {
        placedOrder = data;
      }

      // 2. Increment coupon usage
      const savedCoupon = localStorage.getItem("fadenfab_applied_coupon");
      if (savedCoupon) {
        const { code } = JSON.parse(savedCoupon);
        const coupons = JSON.parse(localStorage.getItem("fadenfab_coupons") || "[]");
        const defaultCoupons = [
          { code: "FADENFAB10", discount: 10, usageCount: 0, users: [] },
          { code: "WELCOME20", discount: 20, usageCount: 0, users: [] },
          { code: "SUPER50", discount: 50, usageCount: 0, users: [] }
        ];
        const activeCoupons = coupons.length > 0 ? coupons : defaultCoupons;
        const target = activeCoupons.find((c: any) => c.code === code);
        if (target) {
          target.usageCount = (target.usageCount || 0) + 1;
          if (!target.users) target.users = [];
          if (!target.users.includes(user.email)) {
            target.users.push(user.email);
          }
        }
        localStorage.setItem("fadenfab_coupons", JSON.stringify(activeCoupons));
        localStorage.removeItem("fadenfab_applied_coupon");
      }

      // 3. Increment purchase count in analytics
      const analytics = JSON.parse(localStorage.getItem("fadenfab_user_analytics") || "[]");
      const userRecord = analytics.find((u: any) => u.email === user.email);
      if (userRecord) {
        userRecord.purchaseCount = (userRecord.purchaseCount || 0) + 1;
      } else {
        analytics.push({
          email: user.email,
          name: fullName || user.email.split("@")[0],
          mobile: mobile || "N/A",
          registeredAt: new Date().toISOString(),
          purchaseCount: 1,
          usageTime: 120, // default placeholder
          mockPassword: "••••••••"
        });
      }
      localStorage.setItem("fadenfab_user_analytics", JSON.stringify(analytics));

      // Sync purchase count to leads table
      const { data: existingLeadUser } = await supabase
        .from("leads")
        .select("id, quantity")
        .eq("email", user.email)
        .eq("status", "user")
        .maybeSingle();

      if (existingLeadUser) {
        const newCount = (parseInt(existingLeadUser.quantity || "0") + 1).toString();
        await supabase
          .from("leads")
          .update({ quantity: newCount })
          .eq("id", existingLeadUser.id);
      }

      // 4. Clear Cart
      localStorage.removeItem("fadenfab_cart");
      window.dispatchEvent(new Event("cart-updated"));
      
      // 3. Show Success Screen
      setOrderSuccess(placedOrder);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong while placing your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen overflow-x-hidden text-slate-900 bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50 flex flex-col justify-between">
        {/* Background Glows */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-32 w-[550px] h-[550px] bg-blue-500/10 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-yellow-400/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-1/3 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[140px]" />
        </div>

        <Navbar />

        <div className="max-w-7xl mx-auto px-6 pt-36 pb-24 w-full flex-grow">
          <AnimatePresence mode="wait">
            {orderSuccess ? (
              /* ================= SUCCESS SCREEN ================= */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-2xl text-center"
              >
                <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h1 className="text-3xl font-extrabold text-slate-900">
                  Order Confirmed!
                </h1>
                <p className="mt-2 text-slate-500">
                  Thank you for shopping with FADENFAB. Your custom apparel is in production!
                </p>

                {/* Order card summary */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mt-8 text-left space-y-4">
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                    <span className="text-slate-400 font-bold">ORDER ID</span>
                    <span className="font-bold text-slate-800 break-all pl-4 text-right">
                      {orderSuccess.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                    <span className="text-slate-400 font-bold">ESTIMATED DELIVERY</span>
                    <span className="font-semibold text-slate-800">
                      7-10 Working Days
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-bold">TOTAL AMOUNT</span>
                    <span className="font-extrabold text-[#0D4A86] text-lg">
                      ₹{orderSuccess.total}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
                  <button
                    onClick={() => router.push("/profile?tab=orders")}
                    className="bg-[#0D4A86] hover:bg-[#083A6B] text-white px-8 py-4 rounded-full font-bold transition shadow-lg shadow-blue-500/10 cursor-pointer"
                  >
                    View My Orders
                  </button>
                  <Link
                    href="/"
                    className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-full font-semibold transition"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </motion.div>
            ) : loading ? (
              <div className="text-center py-20 text-slate-500">
                Verifying checkout details...
              </div>
            ) : (
              /* ================= CHECKOUT CONTENT ================= */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid lg:grid-cols-12 gap-8 items-start"
              >
                {/* Checkout form */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-8 shadow-xl">
                  {/* Back button */}
                  <Link
                    href="/cart"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#0D4A86] mb-8 transition"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                    <span>Back to Cart</span>
                  </Link>

                  <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <TruckIcon className="w-6 h-6 text-[#0D4A86]" /> Shipping Details
                  </h2>

                  <form onSubmit={handlePlaceOrder} className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">
                        Recipient Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20 transition"
                      />
                    </div>

                    {/* Mobile */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">
                        Mobile Number (For Delivery Sync)
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20 transition"
                      />
                    </div>

                    {/* Street Address */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Apartment, Suite, Unit, Street address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20 transition"
                      />
                    </div>

                    {/* City, State, Pin */}
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Chennai"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Tamil Nadu"
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">
                          PIN Code
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 600001"
                          value={pinCode}
                          onChange={(e) => setPinCode(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20 transition"
                        />
                      </div>
                    </div>

                    {/* Payment methods */}
                    <div className="pt-6 border-t border-slate-100">
                      <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <CreditCardIcon className="w-6 h-6 text-[#0D4A86]" /> Select Payment Method
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { id: "upi", label: "UPI (GPay / PhonePe)", desc: "Scan and pay securely" },
                          { id: "cod", label: "Cash on Delivery", desc: "Pay cash upon delivery" }
                        ].map((method) => (
                          <label
                            key={method.id}
                            className={`flex flex-col p-4 border rounded-2xl cursor-pointer transition ${
                              paymentMethod === method.id
                                ? "border-[#0D4A86] bg-[#0D4A86]/5"
                                : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span>{method.label}</span>
                              <input
                                type="radio"
                                name="payment"
                                value={method.id}
                                checked={paymentMethod === method.id}
                                onChange={() => setPaymentMethod(method.id)}
                                className="text-[#0D4A86] focus:ring-[#0D4A86]"
                              />
                            </div>
                            <span className="text-xs text-slate-500 mt-1 block">
                              {method.desc}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Error Banner */}
                    {errorMessage && (
                      <div className="p-4 bg-red-50 border border-red-200 text-red-700 font-semibold text-sm rounded-xl">
                        {errorMessage}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#0D4A86] hover:bg-[#083A6B] text-white py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer text-lg group"
                    >
                      {isSubmitting ? (
                        <span>Processing Order...</span>
                      ) : (
                        <>
                          <span>Place Secure Order (₹{total})</span>
                          <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Summary Panel */}
                <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-6">
                  <h2 className="font-bold text-slate-900 text-xl pb-4 border-b border-slate-100">
                    Order Summary
                  </h2>

                  {/* Items List */}
                  <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex gap-4 py-4 items-center">
                        <div className="relative w-12 h-14 bg-slate-50 border border-slate-200 rounded-lg p-1 shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="object-contain w-full h-full"
                            />
                          ) : (
                            <span className="text-lg">👕</span>
                          )}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-slate-800 text-xs truncate max-w-[150px]">
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Qty: {item.quantity} | ₹{item.price} each
                          </span>
                        </div>
                        <span className="font-bold text-slate-800 text-sm shrink-0">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Tallies */}
                  <div className="border-t border-slate-100 pt-4 space-y-3.5 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-800">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping</span>
                      <span className="font-semibold text-slate-800">
                        {shipping === 0 ? "FREE" : `₹${shipping}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>GST (5%)</span>
                      <span className="font-semibold text-slate-800">₹{tax}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Discount ({appliedCoupon.code})</span>
                        <span>-₹{discountAmount}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-slate-900 font-extrabold text-lg">
                      <span>Grand Total</span>
                      <span className="text-xl text-[#0D4A86]">₹{total}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Footer />
      </main>
    </ProtectedRoute>
  );
}