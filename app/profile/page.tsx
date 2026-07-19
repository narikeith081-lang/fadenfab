"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import CustomModal from "@/components/CustomModal";
import {
  UserIcon,
  ShoppingBagIcon,
  HeartIcon,
  LockClosedIcon,
  TrashIcon,
  CheckIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import Image from "next/image";

type Order = {
  id: string;
  status: string;
  total: number;
  items: any[];
  shipping_address: any;
  created_at: string;
};

type WishlistItem = {
  id: string;
  product_id: number;
  product_slug: string;
  product_name: string;
  product_image: string;
};

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Form states
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  // Security states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });
  const [modalConfig, setModalConfig] = useState<any>(null);

  // eCommerce states
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  // Sync active tab with query param
  useEffect(() => {
    if (tabParam && ["profile", "orders", "wishlist", "security"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // ================= INITIAL LOAD =================
  useEffect(() => {
    const loadSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        localStorage.removeItem("fadenfab_orders");
        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
          setFullName(profileData.full_name || "");
          setMobile(profileData.mobile || "");
          const savedAddress = localStorage.getItem(`fadenfab_address_${user.id}`) || "";
          setAddress(savedAddress);

          // Auto-sync profile name & phone with the admin's database view
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            fetch("/api/profile-sync", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                name: profileData.full_name || user.email?.split("@")[0] || "",
                phone: profileData.mobile || "N/A"
              })
            }).catch(e => console.error("Sync error:", e));
          }
        }
      }
    };
    loadSession();
  }, []);

  // ================= FETCH ORDERS =================
  const fetchOrders = useCallback(async () => {
    if (!user || !user.email) return;
    try {
      setLoadingOrders(true);
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("email", user.email)
        .eq("status", "order")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedOrders = (data || []).map((lead: any) => {
        let companyObj: any = {};
        try {
          companyObj = JSON.parse(lead.company);
        } catch (e) {
          console.error("Parse error for lead company order:", e);
        }
        return {
          id: lead.id.toString(),
          user_id: user.id,
          created_at: lead.created_at,
          total: parseFloat(lead.quantity) || 0,
          status: lead.message,
          items: companyObj.items || [],
          shipping_address: companyObj.shipping_address || {},
          payment_method: companyObj.payment_method || "N/A",
          transaction_id: companyObj.transaction_id || null
        };
      });

      setOrders(mappedOrders);
    } catch (err) {
      console.log("Supabase orders error, checking local storage:", err);
      // Fallback
      const localOrders = JSON.parse(localStorage.getItem("fadenfab_orders") || "[]");
      setOrders(localOrders);
    } finally {
      setLoadingOrders(false);
    }
  }, [user]);

  // ================= FETCH WISHLIST =================
  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingWishlist(true);
      const { data, error } = await supabase
        .from("wishlist")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setWishlist(data || []);
    } catch (err) {
      console.log("Supabase wishlist error, checking local storage:", err);
      // Fallback
      const localWishlist = JSON.parse(localStorage.getItem("fadenfab_wishlist") || "[]");
      setWishlist(localWishlist);
    } finally {
      setLoadingWishlist(false);
    }
  }, [user]);

  // Load orders and wishlist on tab change
  useEffect(() => {
    if (user) {
      if (activeTab === "orders") fetchOrders();
      if (activeTab === "wishlist") fetchWishlist();
    }
  }, [activeTab, user, fetchOrders, fetchWishlist]);

  // ================= UPDATE PROFILE =================
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setProfileMessage({ type: "", text: "" });

    if (!fullName.trim()) {
      setProfileMessage({ type: "error", text: "Please enter your name." });
      return;
    }

    if (mobile && !/^[6-9]\d{9}$/.test(mobile)) {
      setProfileMessage({ type: "error", text: "Please enter a valid 10-digit mobile number." });
      return;
    }

    try {
      setSavingProfile(true);
      localStorage.setItem(`fadenfab_address_${user.id}`, address);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          mobile: mobile,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Sync name and phone to RLS-free leads table for admin view via secure API
      if (user && user.email) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          await fetch("/api/profile-sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              name: fullName,
              phone: mobile
            })
          }).catch(e => console.error("Profile sync API error:", e));
        }

        // Fallback direct update (optional, but keep for RLS compatibility)
        await supabase
          .from("leads")
          .update({
            name: fullName,
            phone: mobile,
          })
          .eq("email", user.email)
          .eq("status", "user");

        // Also sync local storage user analytics
        const analytics = JSON.parse(localStorage.getItem("fadenfab_user_analytics") || "[]");
        const existing = analytics.find((u: any) => u.email === user.email);
        if (existing) {
          existing.name = fullName;
          existing.mobile = mobile;
          localStorage.setItem("fadenfab_user_analytics", JSON.stringify(analytics));
        }
      }

      setProfileMessage({ type: "success", text: "Profile updated successfully!" });
      
      // Update global navbar profile name state
      const event = new CustomEvent("profile-updated");
      window.dispatchEvent(event);
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSavingProfile(false);
    }
  };

  // ================= UPDATE PASSWORD =================
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (!newPassword) {
      setPasswordMessage({ type: "error", text: "Please enter a new password." });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    try {
      setUpdatingPassword(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setPasswordMessage({ type: "success", text: "Password changed successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Failed to update password." });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // ================= WISHLIST ACTIONS =================
  const handleRemoveFromWishlist = async (id: string, productId: number, productSlug: string) => {
    try {
      if (user) {
        await supabase
          .from("wishlist")
          .delete()
          .eq("id", id);
        
        setWishlist(wishlist.filter(item => item.id !== id));
      } else {
        // Fallback
        const local = JSON.parse(localStorage.getItem("fadenfab_wishlist") || "[]");
        const filtered = local.filter((item: any) => item.product_id !== productId);
        localStorage.setItem("fadenfab_wishlist", JSON.stringify(filtered));
        setWishlist(wishlist.filter(item => item.id !== id));
      }
      
      // Notify components
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddToCart = (product: any) => {
    const cart = JSON.parse(localStorage.getItem("fadenfab_cart") || "[]");
    const existingIndex = cart.findIndex((item: any) => item.id === product.product_id);
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: product.product_id,
        name: product.product_name,
        image: product.product_image,
        quantity: 1,
        price: product.product_slug === "oversized-tshirts" ? 699 : 1499,
        fabric: "Premium Fabric",
        color: "Selected Color"
      });
    }

    localStorage.setItem("fadenfab_cart", JSON.stringify(cart));
    // Trigger navbar updates
    window.dispatchEvent(new Event("cart-updated"));
    setModalConfig({
      isOpen: true,
      type: "success",
      title: "Added to Cart",
      message: `"${product.product_name}" has been successfully added to your shopping cart!`,
      onConfirm: () => setModalConfig(null)
    });
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
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900">
              Customer Portal
            </h1>
            <p className="mt-2 text-slate-600">
              Manage your orders, profile details, and account settings.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 p-6 shadow-xl">
              {/* User Avatar Info */}
              <div className="text-center pb-6 border-b border-slate-100">
                <div className="w-20 h-20 bg-[#0D4A86]/10 text-[#0D4A86] text-3xl font-black rounded-full flex items-center justify-center mx-auto mb-4 border border-[#0D4A86]/20">
                  {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-lg font-bold text-slate-900 truncate">
                  {fullName || "Customer"}
                </h3>
                <p className="text-sm text-slate-500 truncate mt-1">
                  {user?.email}
                </p>
              </div>

              {/* Navigation Tabs */}
              <div className="mt-6 flex flex-col gap-2">
                {[
                  { id: "profile", label: "Profile Details", icon: UserIcon },
                  { id: "orders", label: "Order History", icon: ShoppingBagIcon },
                  { id: "wishlist", label: "My Wishlist", icon: HeartIcon },
                  { id: "security", label: "Security & Password", icon: LockClosedIcon }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-4 w-full text-left px-4 py-3.5 rounded-2xl font-semibold transition cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-[#0D4A86] text-white shadow-lg"
                          : "text-slate-600 hover:bg-slate-100 hover:text-[#0D4A86]"
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dashboard Content Panel */}
            <div className="lg:col-span-9 bg-white rounded-3xl border border-slate-200 p-8 shadow-xl min-h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* ================= PROFILE TAB ================= */}
                  {activeTab === "profile" && (
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <UserIcon className="w-6 h-6 text-[#0D4A86]" /> Profile Information
                      </h2>

                      <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
                        {/* Email (Disabled) */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">
                            Email Address (Linked to Account)
                          </label>
                          <input
                            type="text"
                            value={user?.email || ""}
                            disabled
                            className="w-full rounded-xl border border-slate-200 bg-slate-100 text-slate-500 px-4 py-3 outline-none"
                          />
                        </div>

                        {/* Name */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20 transition"
                          />
                        </div>

                        {/* Mobile */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">
                            Mobile Number
                          </label>
                          <input
                            type="tel"
                            placeholder="e.g. 9876543210"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20 transition"
                          />
                        </div>

                        {/* Address */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">
                            Default Shipping Address
                          </label>
                          <textarea
                            placeholder="Enter your street address, city, state, and postal code..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            rows={4}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20 transition resize-none"
                          />
                        </div>

                        {/* Messages */}
                        {profileMessage.text && (
                          <div
                            className={`p-4 rounded-xl text-sm border font-semibold ${
                              profileMessage.type === "success"
                                ? "bg-green-50 border-green-200 text-green-700"
                                : "bg-red-50 border-red-200 text-red-700"
                            }`}
                          >
                            {profileMessage.text}
                          </div>
                        )}

                        {/* Save Button */}
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="bg-[#0D4A86] hover:bg-[#083A6B] text-white px-8 py-3.5 rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10"
                        >
                          {savingProfile ? "Saving Updates..." : "Save Details"}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* ================= ORDERS TAB ================= */}
                  {activeTab === "orders" && (
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <ShoppingBagIcon className="w-6 h-6 text-[#0D4A86]" /> Order History
                      </h2>

                      {loadingOrders ? (
                        <div className="text-center py-12 text-slate-500">
                          Fetching your orders...
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-3xl p-8">
                          <ShoppingBagIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-slate-800">
                            No Orders Found
                          </h3>
                          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                            You haven't placed any orders yet. Once you place custom orders, they will show up here.
                          </p>
                          <button
                            onClick={() => router.push("/")}
                            className="mt-6 bg-[#0D4A86] hover:bg-[#083A6B] text-white px-6 py-3 rounded-full font-bold transition cursor-pointer"
                          >
                            Explore Collection
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {orders.map((order) => (
                            <div
                              key={order.id}
                              className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-all duration-300"
                            >
                              <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                                <div>
                                  <span className="text-xs text-slate-400 font-bold uppercase block">
                                    Order ID
                                  </span>
                                  <span className="font-bold text-slate-800 text-sm truncate block max-w-xs md:max-w-md">
                                    {order.id}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs text-slate-400 font-bold uppercase block">
                                    Date Placed
                                  </span>
                                  <span className="font-medium text-slate-800 text-sm block">
                                    {new Date(order.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs text-slate-400 font-bold uppercase block">
                                    Total Amount
                                  </span>
                                  <span className="font-extrabold text-[#0D4A86] text-lg block">
                                    ₹{order.total}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs text-slate-400 font-bold uppercase block mb-1">
                                    Status
                                  </span>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                                      order.status === "Delivered"
                                        ? "bg-green-100 text-green-700"
                                        : order.status === "Shipped"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </div>
                              </div>

                              {/* Order Items */}
                              <div className="space-y-4">
                                {order.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex gap-4 items-center">
                                    <div className="relative w-16 h-16 bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1">
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
                                    <div className="flex-grow">
                                      <h4 className="font-bold text-slate-800 text-sm">
                                        {item.name}
                                      </h4>
                                      <p className="text-xs text-slate-500 mt-1">
                                        Qty: {item.quantity} | {item.fabric || "Premium Fabric"} | {item.color || "Standard"}
                                      </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="font-bold text-slate-900 text-sm">
                                        ₹{item.price * item.quantity}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Order Tracking Progress Stepper */}
                              {order.status !== "Cancelled" ? (
                                <div className="mt-6 pt-5 border-t border-slate-100">
                                  <span className="text-xs text-slate-400 font-bold uppercase block mb-4">
                                    Delivery Status Tracking
                                  </span>
                                  <div className="relative flex justify-between items-center max-w-md mx-auto px-2">
                                    {/* Progress Line */}
                                    <div className="absolute left-6 right-6 top-[14px] h-0.5 bg-slate-200 -z-10" />
                                    <div
                                      className="absolute left-6 top-[14px] h-0.5 bg-[#0D4A86] -z-10 transition-all duration-500"
                                      style={{
                                        width:
                                          order.status === "Delivered"
                                            ? "calc(100% - 48px)"
                                            : order.status === "Shipped"
                                            ? "calc(50% - 24px)"
                                            : "0px",
                                      }}
                                    />

                                    {/* Steps */}
                                    {[
                                      { name: "Confirmed", status: "Processing", label: "Confirmed" },
                                      { name: "Shipped", status: "Shipped", label: "In Transit" },
                                      { name: "Delivered", status: "Delivered", label: "Delivered" }
                                    ].map((step, sIdx) => {
                                      const isCompleted =
                                        order.status === "Delivered" ||
                                        (order.status === "Shipped" && step.status !== "Delivered") ||
                                        (order.status === "Processing" && step.status === "Processing");

                                      const isActive = order.status === step.status;

                                      return (
                                        <div key={sIdx} className="flex flex-col items-center">
                                          <div
                                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 ${
                                              isCompleted
                                                ? "bg-[#0D4A86] border-[#0D4A86] text-white shadow-md shadow-blue-500/20"
                                                : "bg-white border-slate-200 text-slate-400"
                                            } ${isActive ? "ring-4 ring-blue-500/20 scale-110" : ""}`}
                                          >
                                            {isCompleted ? "✓" : sIdx + 1}
                                          </div>
                                          <span
                                            className={`text-[9px] font-extrabold mt-2 tracking-wide uppercase ${
                                              isCompleted ? "text-slate-800" : "text-slate-400"
                                            }`}
                                          >
                                            {step.name}
                                          </span>
                                          <span className="text-[8px] text-slate-400 font-medium mt-0.5">
                                            {step.label}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider">
                                  ❌ Order Cancelled / Refunded
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ================= WISHLIST TAB ================= */}
                  {activeTab === "wishlist" && (
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <HeartIcon className="w-6 h-6 text-[#0D4A86]" /> My Wishlist
                      </h2>

                      {loadingWishlist ? (
                        <div className="text-center py-12 text-slate-500">
                          Fetching your wishlist...
                        </div>
                      ) : wishlist.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-3xl p-8">
                          <HeartIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-slate-800">
                            Your Wishlist is Empty
                          </h3>
                          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                            Save designs you like and they will show up here to add to cart easily later.
                          </p>
                          <button
                            onClick={() => router.push("/")}
                            className="mt-6 bg-[#0D4A86] hover:bg-[#083A6B] text-white px-6 py-3 rounded-full font-bold transition cursor-pointer"
                          >
                            Explore Designs
                          </button>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                          {wishlist.map((item) => (
                            <div
                              key={item.id}
                              className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/30 flex gap-4 p-4 hover:shadow-lg transition-all duration-300 hover:border-[#0D4A86]/20"
                            >
                              {/* Product Image */}
                              <div className="relative w-24 h-28 bg-white rounded-xl border border-slate-200 shrink-0 flex items-center justify-center p-2">
                                <img
                                  src={item.product_image}
                                  alt={item.product_name}
                                  className="object-contain w-full h-full"
                                />
                              </div>

                              {/* Details & Actions */}
                              <div className="flex flex-col justify-between flex-grow">
                                <div>
                                  <h3 className="font-bold text-slate-900 leading-tight">
                                    {item.product_name}
                                  </h3>
                                  <span className="text-xs text-[#0D4A86] font-bold mt-1 inline-block">
                                    {item.product_slug === "oversized-tshirts" ? "Oversized T-Shirt" : "Premium Hoodie"}
                                  </span>
                                  <p className="text-xs text-slate-500 mt-1">
                                    ₹{item.product_slug === "oversized-tshirts" ? "699" : "1,499"}
                                  </p>
                                </div>

                                <div className="flex gap-2 mt-3">
                                  <button
                                    onClick={() => handleAddToCart(item)}
                                    className="bg-[#0D4A86] hover:bg-[#083A6B] text-white text-xs font-semibold px-4 py-2 rounded-full transition flex items-center gap-1 cursor-pointer"
                                  >
                                    Add to Cart
                                  </button>
                                  <button
                                    onClick={() => handleRemoveFromWishlist(item.id, item.product_id, item.product_slug)}
                                    className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full transition cursor-pointer"
                                    title="Remove from Wishlist"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ================= SECURITY TAB ================= */}
                  {activeTab === "security" && (
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <LockClosedIcon className="w-6 h-6 text-[#0D4A86]" /> Security Settings
                      </h2>

                      <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-xl">
                        {/* New Password */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            placeholder="Enter at least 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20 transition"
                          />
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-600 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            placeholder="Re-enter your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#0D4A86] focus:ring-2 focus:ring-[#0D4A86]/20 transition"
                          />
                        </div>

                        {/* Messages */}
                        {passwordMessage.text && (
                          <div
                            className={`p-4 rounded-xl text-sm border font-semibold ${
                              passwordMessage.type === "success"
                                ? "bg-green-50 border-green-200 text-green-700"
                                : "bg-red-50 border-red-200 text-red-700"
                            }`}
                          >
                            {passwordMessage.text}
                          </div>
                        )}

                        {/* Update Button */}
                        <button
                          type="submit"
                          disabled={updatingPassword}
                          className="bg-[#0D4A86] hover:bg-[#083A6B] text-white px-8 py-3.5 rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10"
                        >
                          {updatingPassword ? "Updating Password..." : "Update Password"}
                        </button>
                      </form>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
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
    </ProtectedRoute>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-[#0D4A86] rounded-full animate-spin" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
