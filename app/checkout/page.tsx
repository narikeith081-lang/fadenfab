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
    <div className="relative w-full h-full flex items-center justify-center bg-slate-50 p-0.5">
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
  size?: string;
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [trnxError, setTrnxError] = useState("");
  const [copied, setCopied] = useState(false);

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
          const dbAddress = user.user_metadata?.address || "";
          const savedAddress = dbAddress || localStorage.getItem(`fadenfab_address_${user.id}`) || "";
          setAddress(savedAddress);

          const dbCity = user.user_metadata?.city || "";
          const savedCity = dbCity || localStorage.getItem(`fadenfab_city_${user.id}`) || "";
          setCity(savedCity);

          const dbState = user.user_metadata?.state || "";
          const savedState = dbState || localStorage.getItem(`fadenfab_state_${user.id}`) || "";
          setStateName(savedState);

          const dbZip = user.user_metadata?.zip || "";
          const savedZip = dbZip || localStorage.getItem(`fadenfab_zip_${user.id}`) || "";
          setPinCode(savedZip);
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

  const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 100;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const couponDiscountAmount = appliedCoupon ? Math.round((subtotal * appliedCoupon.discount) / 100) : 0;
  const discountAmount = Math.max(comboDiscount, couponDiscountAmount);
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

    if (paymentMethod === "upi") {
      setTrnxError("");
      setTransactionId("");
      setShowPaymentModal(true);
      return;
    }

    // Otherwise COD order confirms immediately
    await executeOrderSubmission("Cash on Delivery", "");
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrnxError("");

    if (!transactionId.trim()) {
      setTrnxError("Please enter your UPI Ref number / Transaction UTR ID.");
      return;
    }

    if (transactionId.trim().length < 6) {
      setTrnxError("Please enter a valid Transaction Ref Number.");
      return;
    }

    await executeOrderSubmission("UPI Online Payment", transactionId.trim());
  };

  const executeOrderSubmission = async (method: string, txId: string) => {
    try {
      setIsSubmitting(true);
      
      // Update saved address, name, and phone permanently
      localStorage.setItem(`fadenfab_address_${user.id}`, address);
      localStorage.setItem(`fadenfab_city_${user.id}`, city);
      localStorage.setItem(`fadenfab_state_${user.id}`, stateName);
      localStorage.setItem(`fadenfab_zip_${user.id}`, pinCode);
      await supabase.auth.updateUser({
        data: {
          address: address,
          city: city,
          state: stateName,
          zip: pinCode
        }
      }).catch(e => console.error("Auth metadata update error:", e));

      await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          mobile: mobile
        })
        .eq("id", user.id);
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
        shipping_address: orderAddress,
        payment_method: method,
        transaction_id: txId || null
      };

      let placedOrder: any = null;

      // 1. Save order to Supabase
      const { data, error } = await supabase
        .from("leads")
        .insert([
          {
            name: fullName,
            email: user.email,
            phone: mobile,
            company: JSON.stringify({
              items: cart,
              shipping_address: orderAddress,
              payment_method: method,
              transaction_id: txId || null
            }),
            quantity: total.toString(),
            message: "Processing",
            status: "order"
          }
        ])
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
        placedOrder = {
          id: data.id.toString(),
          user_id: user.id,
          created_at: data.created_at,
          total: parseFloat(data.quantity) || 0,
          status: data.message,
          items: cart,
          shipping_address: orderAddress,
          payment_method: method,
          transaction_id: txId || null
        };
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
      
      // 5. Show Success Screen
      setOrderSuccess(placedOrder);
      setShowPaymentModal(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong while placing your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <div className="lg:col-span-8 bg-white rounded-2xl xs:rounded-3xl border border-slate-200 p-4 xs:p-8 shadow-xl">
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
                <div className="lg:col-span-4 bg-white rounded-2xl xs:rounded-3xl border border-slate-200 p-4 xs:p-6 shadow-xl space-y-6">
                  <h2 className="font-bold text-slate-900 text-xl pb-4 border-b border-slate-100">
                    Order Summary
                  </h2>

                  {/* Items List */}
                  <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex gap-4 py-4 items-center">
                        <div className="relative w-12 h-14 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          {item.name.startsWith("Custom") ? (
                            <CustomGarmentThumbnail name={item.name} color={item.color} logo={item.image} />
                          ) : item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="object-contain w-full h-full p-1"
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
                            Qty: {item.quantity} | Size: <span className="font-extrabold text-slate-600">{item.size || "L"}</span> | ₹{item.price} each
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
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>{appliedCoupon ? `Discount (${appliedCoupon.code})` : "Combo Discount (15% Off)"}</span>
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

      </div>
      <Footer />
    </div>

      {/* Online Payment Verification Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-800 z-10"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                Scan & Pay via UPI
              </h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed font-semibold">
                Scan the QR code below using any UPI app (GPay, PhonePe, Paytm, BHIM) to pay <span className="text-[#0D4A86] font-bold">₹{total}</span> to confirm your custom order.
              </p>

              {/* QR Code Container */}
              <div className="flex flex-col items-center bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-5">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`upi://pay?pa=narikeith081-2@okhdfcbank&pn=Naresh%20Kumar&am=${total}&cu=INR&tn=Fadenfab%20Order`)}`}
                  alt="Naresh Kumar UPI QR Code"
                  className="w-52 h-52 object-contain rounded-lg shadow-sm border border-slate-200 bg-white p-2"
                />

                {/* Precise Pay Banner */}
                <div className="mt-4 bg-blue-50/80 border border-blue-100 rounded-xl px-4 py-2.5 text-center w-full">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Amount to Pay</p>
                  <p className="text-2xl font-black text-[#0D4A86] mt-0.5">₹{total}</p>
                  <p className="text-[10px] text-amber-600 font-bold mt-1">⚠️ Scan using any UPI app to pay the exact amount of ₹{total}.</p>
                </div>

                <p className="text-xs font-extrabold text-slate-800 mt-4 font-mono">
                  UPI ID: narikeith081-2@okhdfcbank
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("narikeith081-2@okhdfcbank");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`text-[10px] mt-1 font-semibold transition cursor-pointer ${copied ? "text-green-600 font-bold" : "text-blue-500 hover:text-blue-700"}`}
                >
                  {copied ? "✓ UPI ID copied to clipboard!" : "Click to copy UPI ID"}
                </button>
              </div>

              {/* Mobile Deep Link Redirect */}
              <div className="mb-5">
                <a
                  href={`upi://pay?pa=narikeith081-2@okhdfcbank&pn=Naresh%20Kumar&am=${total}&cu=INR&tn=Fadenfab%20Order`}
                  className="w-full bg-[#0D4A86] hover:bg-[#083A6B] text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 text-sm text-center shadow-lg shadow-blue-500/10 cursor-pointer"
                >
                  <span>Pay via UPI App Directly</span>
                </a>
              </div>

              {/* Verification Form */}
              <form onSubmit={handleConfirmPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    UTR / Transaction Ref No. (12 Digits)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter 12-digit UPI Transaction No."
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none text-slate-800 focus:border-[#0D4A86] text-sm"
                  />
                  {trnxError && (
                    <p className="text-xs text-red-500 font-semibold mt-1">{trnxError}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-500 py-3 rounded-xl text-sm font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-bold transition cursor-pointer shadow-lg shadow-green-500/10"
                  >
                    {isSubmitting ? "Verifying..." : "Confirm Order"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Branded Loading Overlay */}
      {isSubmitting && (
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
      )}
    </ProtectedRoute>
  );
}