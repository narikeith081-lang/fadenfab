"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";
import Link from "next/link";

export default function Navbar({
  mobileMenuOpen: controlledMobileMenuOpen,
  setMobileMenuOpen: controlledSetMobileMenuOpen,
}: {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const mobileMenuOpen = controlledMobileMenuOpen !== undefined ? controlledMobileMenuOpen : internalMobileMenuOpen;
  const setMobileMenuOpen = controlledSetMobileMenuOpen !== undefined ? controlledSetMobileMenuOpen : setInternalMobileMenuOpen;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // ================= FETCH AUTH & PROFILE =================
  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        if (!currentUser) {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from DB when user changes
  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
    } else {
      setProfile(null);
    }
  }, [user]);

  // ================= COUNTERS SYNC =================
  const updateCounts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Cart Count
      const cart = JSON.parse(localStorage.getItem("fadenfab_cart") || "[]");
      const totalQty = cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      setCartCount(totalQty);

      // Wishlist Count
      const { data } = await supabase
        .from("leads")
        .select("id")
        .eq("status", "wishlist")
        .eq("email", user.email);
      setWishlistCount(data?.length || 0);
    } else {
      setCartCount(0);
      setWishlistCount(0);
    }
  }, []);

  useEffect(() => {
    updateCounts();

    window.addEventListener("cart-updated", updateCounts);
    window.addEventListener("wishlist-updated", updateCounts);

    return () => {
      window.removeEventListener("cart-updated", updateCounts);
      window.removeEventListener("wishlist-updated", updateCounts);
    };
  }, [updateCounts, user]);

  // ================= DROPDOWN CLOSE OUTSIDE =================
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".user-menu-dropdown") && !target.closest(".user-menu-btn")) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [dropdownOpen]);

  // ================= LOGOUT =================
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("fadenfab_cart");
    localStorage.removeItem("fadenfab_wishlist");
    setUser(null);
    setProfile(null);
    setDropdownOpen(false);
    window.location.href = "/";
  };

  // ================= INACTIVITY TIMEOUT LOGOUT =================
  useEffect(() => {
    if (!user) return;

    let timer: any;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        await supabase.auth.signOut();
        localStorage.removeItem("fadenfab_cart");
        localStorage.removeItem("fadenfab_wishlist");
        window.location.href = "/?expired=true";
      }, 30 * 60 * 1000); // 30 minutes
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  // ================= NAVIGATION =================
  const handleNavClick = (sectionId: string, href: string) => {
    if (pathname === "/") {
      if (sectionId === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          router.push(href);
        }
      }
    } else {
      router.push(href);
    }
    setMobileMenuOpen(false);
  };

  // Extract first name
  const firstName = profile?.full_name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "User";

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200 text-slate-900"
    >
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          className="text-3xl md:text-4xl font-bold tracking-wide text-[#0D4A86] cursor-pointer"
          style={{
            fontFamily: '"American Typewriter","American Typewriter Std",serif',
          }}
        >
          FADENFAB
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-lg font-medium">
          {user ? (
            // ================= LOGGED IN NAVBAR =================
            <>
              <button
                onClick={() => handleNavClick("home", "/")}
                className="hover:text-[#0D4A86] transition cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick("services", "/#services")}
                className="hover:text-[#0D4A86] transition cursor-pointer"
              >
                Services
              </button>
              <button
                onClick={() => handleNavClick("collection", "/#collection")}
                className="hover:text-[#0D4A86] transition cursor-pointer"
              >
                Collection
              </button>
              <button
                onClick={() => handleNavClick("why", "/#why")}
                className="hover:text-[#0D4A86] transition cursor-pointer"
              >
                Why Us
              </button>
              <button
                onClick={() => handleNavClick("contact", "/#contact")}
                className="hover:text-[#0D4A86] transition cursor-pointer"
              >
                Contact
              </button>
              
              {/* Wishlist Icon */}
              <Link href="/wishlist" className="hover:text-[#0D4A86] transition flex items-center gap-1 relative">
                <span>Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="bg-amber-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center animate-fadeIn">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <Link href="/cart" className="hover:text-[#0D4A86] transition flex items-center gap-1 relative">
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="bg-[#0D4A86] text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center animate-fadeIn">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Hi, Name Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="user-menu-btn flex items-center gap-1.5 text-[#0D4A86] hover:text-[#083A6B] font-semibold transition cursor-pointer"
                >
                  Hi, {firstName} <span className="text-xs">▼</span>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="user-menu-dropdown absolute right-0 mt-3 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50"
                    >
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-5 py-3 hover:bg-[#0D4A86]/5 hover:text-[#0D4A86] text-slate-700 transition"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-5 py-3 hover:bg-[#0D4A86]/5 hover:text-[#0D4A86] text-slate-700 transition"
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-5 py-3 hover:bg-[#0D4A86]/5 hover:text-[#0D4A86] text-slate-700 transition"
                      >
                        Wishlist
                      </Link>
                      <hr className="border-slate-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-5 py-3 hover:bg-red-50 text-red-600 transition font-medium cursor-pointer"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            // ================= LOGGED OUT NAVBAR =================
            <>
              <button
                onClick={() => handleNavClick("home", "/")}
                className="hover:text-[#0D4A86] transition cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick("services", "/#services")}
                className="hover:text-[#0D4A86] transition cursor-pointer"
              >
                Services
              </button>
              <button
                onClick={() => handleNavClick("collection", "/#collection")}
                className="hover:text-[#0D4A86] transition cursor-pointer"
              >
                Collection
              </button>
              <button
                onClick={() => handleNavClick("why", "/#why")}
                className="hover:text-[#0D4A86] transition cursor-pointer"
              >
                Why Us
              </button>
              <button
                onClick={() => handleNavClick("contact", "/#contact")}
                className="hover:text-[#0D4A86] transition cursor-pointer"
              >
                Contact
              </button>
              <button
                onClick={() => router.push("/userlogin")}
                className="bg-[#0D4A86] hover:bg-[#083A6B] text-white px-6 py-2 rounded-full font-semibold transition cursor-pointer"
              >
                Login
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden w-12 h-12 flex items-center justify-center text-3xl text-[#0D4A86] cursor-pointer touch-manipulation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ease-out transform-gpu will-change-[opacity] ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Mobile Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-72 bg-white shadow-2xl z-50 text-slate-900 flex flex-col transition-transform duration-200 ease-out transform-gpu will-change-transform ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <h2 className="text-2xl font-bold text-[#0D4A86]">
            FADENFAB
          </h2>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-3xl text-[#0D4A86] cursor-pointer touch-manipulation w-10 h-10 flex items-center justify-center"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Top Authentication Block */}
          {user ? (
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Account</span>
                <span className="text-xs bg-[#0D4A86]/10 text-[#0D4A86] font-bold px-2.5 py-0.5 rounded-full">Active</span>
              </div>
              <div className="text-slate-800 font-bold text-sm truncate" title={user.email}>
                {user.email}
              </div>
              <button
                onClick={handleLogout}
                className="mt-2.5 w-full border border-red-200 hover:bg-red-50 text-red-600 py-2.5 rounded-full font-bold transition cursor-pointer touch-manipulation text-xs text-center bg-white shadow-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <button
                onClick={() => {
                  router.push("/userlogin");
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-[#0D4A86] hover:bg-[#083A6B] text-white py-3 rounded-full font-bold transition cursor-pointer touch-manipulation text-sm text-center shadow-md"
              >
                Login / Sign Up
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex flex-col py-4">
            {user ? (
              // Logged In Mobile Menu
              <>
                <button
                  onClick={() => handleNavClick("home", "/")}
                  className="text-left px-8 py-4 hover:bg-[#0D4A86]/5 hover:text-[#0D4A86] transition font-medium cursor-pointer touch-manipulation"
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavClick("services", "/#services")}
                  className="text-left px-8 py-4 hover:bg-[#0D4A86]/5 hover:text-[#0D4A86] transition font-medium cursor-pointer touch-manipulation"
                >
                  Services
                </button>
                <button
                  onClick={() => handleNavClick("collection", "/#collection")}
                  className="text-left px-8 py-4 hover:bg-[#0D4A86]/5 hover:text-[#0D4A86] transition font-medium cursor-pointer touch-manipulation"
                >
                  Collection
                </button>
                <button
                  onClick={() => handleNavClick("why", "/#why")}
                  className="text-left px-8 py-4 hover:bg-[#0D4A86]/5 hover:text-[#0D4A86] transition font-medium cursor-pointer touch-manipulation"
                >
                  Why Us
                </button>
                <button
                  onClick={() => handleNavClick("contact", "/#contact")}
                  className="text-left px-8 py-4 hover:bg-[#0D4A86]/5 hover:text-[#0D4A86] transition font-medium cursor-pointer touch-manipulation"
                >
                  Contact
                </button>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left px-8 py-4 hover:bg-[#0D4A86]/5 hover:text-[#0D4A86] transition font-medium flex justify-between items-center cursor-pointer touch-manipulation"
                >
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left px-8 py-4 hover:bg-[#0D4A86]/5 hover:text-[#0D4A86] transition font-medium flex justify-between items-center cursor-pointer touch-manipulation"
                >
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-[#0D4A86] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left px-8 py-4 hover:bg-[#0D4A86]/5 hover:text-[#0D4A86] transition font-medium cursor-pointer touch-manipulation"
                >
                  My Profile
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left px-8 py-4 hover:bg-[#0D4A86]/5 hover:text-[#0D4A86] transition font-medium cursor-pointer touch-manipulation"
                >
                  My Orders
                </Link>
              </>
            ) : (
              // Logged Out Mobile Menu
              <>
                <button
                  onClick={() => handleNavClick("home", "/")}
                  className="text-left px-8 py-4 hover:bg-[#0D4A86]/5 hover:text-[#0D4A86] transition font-medium cursor-pointer touch-manipulation"
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavClick("services", "/#services")}
                  className="text-left px-8 py-4 hover:bg-[#0D4A86]/5 hover:text-[#0D4A86] transition font-medium cursor-pointer touch-manipulation"
                >
                  Services
                </button>
                <button
                  onClick={() => handleNavClick("collection", "/#collection")}
                  className="text-left px-8 py-4 hover:bg-[#0D4A86]/5 hover:text-[#0D4A86] transition font-medium cursor-pointer touch-manipulation"
                >
                  Collection
                </button>
                <button
                  onClick={() => handleNavClick("why", "/#why")}
                  className="text-left px-8 py-4 hover:bg-[#0D4A86]/5 hover:text-[#0D4A86] transition font-medium cursor-pointer touch-manipulation"
                >
                  Why Us
                </button>
                <button
                  onClick={() => handleNavClick("contact", "/#contact")}
                  className="text-left px-8 py-4 hover:bg-[#0D4A86]/5 hover:text-[#0D4A86] transition font-medium cursor-pointer touch-manipulation"
                >
                  Contact
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}