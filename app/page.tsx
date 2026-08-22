"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import Gallery from "../components/Gallery";
import Footer from "../components/Footer";
import Contact from "../components/Contact";
import Testimonials from "../components/Testimonials";
import { HiMenu, HiX } from "react-icons/hi";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from "framer-motion";
import Navbar from "@/components/Navbar";
import { getCatalog } from "@/lib/products";
import { supabase } from "@/lib/supabase";
import CustomModal from "@/components/CustomModal";

// Reusable Hardware-Accelerated 3D Tilt Card component
function TiltCard({ children, className, isDesktop, ...props }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  // Subtle 15-degree maximum rotation for elegant feel
  const rX = useTransform(rotateX, [-0.5, 0.5], [12, -12]);
  const rY = useTransform(rotateY, [-0.5, 0.5], [-12, 12]);

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
      <div style={{ transform: isDesktop ? "translateZ(25px)" : "none", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
}

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 60,
  },

  show: {
    opacity: 1,
    y: 0,
  },
};

export default function Home() {

  const router = useRouter();
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "success" | "warning" | "error" | "info" | "confirm";
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // ================= SIMULATOR STATE =================
  const [simSilhouette, setSimSilhouette] = useState("Oversized Tee");
  const [simWeight, setSimWeight] = useState("220 GSM Combed Cotton");
  const [simColor, setSimColor] = useState("Off-White");
  const [configStep, setConfigStep] = useState(1);
  const [selectedDesignerSize, setSelectedDesignerSize] = useState("L");
  const [customDesignFile, setCustomDesignFile] = useState<string | null>(null);
  const [comboTshirtSize, setComboTshirtSize] = useState("L");
  const [comboHoodieSize, setComboHoodieSize] = useState("L");
  const [selectedComboIndex, setSelectedComboIndex] = useState(0);

  const combos = useMemo(() => {
    const catalog = getCatalog();
    const tshirts = catalog["oversized-tshirts"]?.products || [];
    const hoodies = catalog["hoodies"]?.products || [];

    return [0, 1, 2].map((idx) => {
      const hoodie = hoodies[idx] || hoodies[0] || {
        id: 1001 + idx,
        name: "Future Vision",
        price: 1499,
        image: "/FutureVision_1.webp",
        color: "Off-White",
        fabric: "French Terry",
        gsm: "350 GSM"
      };

      const tshirt = tshirts[idx] || tshirts[0] || {
        id: 1002 + idx,
        name: "Classic Never Dies",
        price: 699,
        image: "/classicneverdies.webp",
        color: "Charcoal",
        fabric: "Organic Cotton",
        gsm: "220 GSM"
      };

      const name = idx === 0 ? "Neutral Coordinates" : idx === 1 ? "Minimalist Lounge" : "Athleisure Precision";
      const desc = `Complete your collection coordinates. Purchase the ${tshirt.name.replace("Color: ", "")} and ${hoodie.name} together to claim a 15% discount.`;

      return {
        id: idx + 1,
        name,
        desc,
        item1: {
          id: hoodie.id,
          name: hoodie.name.toLowerCase().includes("hoodie") || hoodie.name.toLowerCase().includes("jacket") ? hoodie.name : `${hoodie.name} Hoodie`,
          price: (hoodie as any).price || 1499,
          image: hoodie.image,
          slug: "premium-hoodies",
          color: hoodie.color.replace("Color: ", ""),
          fabric: hoodie.fabric.replace("Material: ", ""),
          gsm: hoodie.gsm
        },
        item2: {
          id: tshirt.id,
          name: tshirt.name.toLowerCase().includes("tee") || tshirt.name.toLowerCase().includes("t-shirt") ? tshirt.name : `${tshirt.name} Tee`,
          price: (tshirt as any).price || 699,
          image: tshirt.image,
          slug: "oversized-tshirts",
          color: tshirt.color.replace("Color: ", ""),
          fabric: tshirt.fabric.replace("Material: ", ""),
          gsm: tshirt.gsm
        }
      };
    });
  }, []);


  const colors = useMemo(() => [
    { name: "Off-White", hex: "#FCFBFA" },
    { name: "Obsidian Black", hex: "#1C1C1C" },
    { name: "Muted Beige", hex: "#D6CFC4" },
    { name: "Vintage Sage", hex: "#9EAA9B" },
  ], []);

  // ================= STORY SLIDER STATE =================
  const [storyStep, setStoryStep] = useState(0);
  const storySteps = useMemo(() => [
    {
      title: "Sourcing Premium Organic Fabrics",
      subtitle: "100% long-staple combed cottons, heavyweight premium GSM terry loops, custom knit to stay soft and hold structure wash after wash.",
      image: "/brand_story_editorial.jpg",
    },
    {
      title: "Tailoring & Pattern Precision",
      subtitle: "Every cut, pattern, and stitch is calculated. Industrial embroidery and technical high-definition prints applied with absolute precision.",
      image: "/tailoring_precision.jpg",
    },
    {
      title: "Bespoke Packaging & Logistics",
      subtitle: "Each garment is individually pressed, hand-inspected, and delivered across India in premium dust bags and robust shipping cases.",
      image: "/luxury_hero_banner.jpg",
    }
  ], []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("expired") === "true") {
      setShowExpiredModal(true);
    }
  }, []);   // <-- HERE

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const targetId = hash.replace("#", "");
      setTimeout(() => {
        scrollToSection(targetId);
      }, 150);
    } else {
      window.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }
  }, []);

  // Usage telemetry session timer & Supabase RLS bypass sync
  useEffect(() => {
    let interval: any = null;
    const trackUsage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) return;

      // 1. Fetch live user profile from Supabase profiles table
      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("full_name, mobile")
        .eq("id", user.id)
        .maybeSingle();

      const liveName = dbProfile?.full_name || user.user_metadata?.full_name || user.email.split("@")[0];
      const livePhone = dbProfile?.mobile || user.user_metadata?.mobile || "N/A";

      // 2. Initial check & insert/update in RLS-free leads table
      const { data: existingUser } = await supabase
        .from("leads")
        .select("id, name, phone")
        .eq("email", user.email)
        .eq("status", "user")
        .maybeSingle();

      if (!existingUser || existingUser.name !== liveName || existingUser.phone !== livePhone) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          await fetch("/api/profile-sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              name: liveName,
              phone: livePhone
            })
          }).catch(e => console.error("Sync API error on home:", e));
        }
      }

      // 2. Local telemetry + Supabase sync interval
      interval = setInterval(async () => {
        // Sync local storage
        const analytics = JSON.parse(localStorage.getItem("fadenfab_user_analytics") || "[]");
        const existing = analytics.find((u: any) => u.email === user.email);
        if (existing) {
          existing.usageTime = (existing.usageTime || 0) + 10;
        } else {
          analytics.push({
            email: user.email,
            name: user.user_metadata?.full_name || user.email!.split("@")[0],
            mobile: user.user_metadata?.mobile || "N/A",
            registeredAt: new Date().toISOString(),
            purchaseCount: 0,
            usageTime: 10,
            mockPassword: "••••••••"
          });
        }
        localStorage.setItem("fadenfab_user_analytics", JSON.stringify(analytics));

        // Sync to Supabase leads table
        const { data: uLead } = await supabase
          .from("leads")
          .select("id, message")
          .eq("email", user.email)
          .eq("status", "user")
          .maybeSingle();

        if (uLead) {
          let seconds = 0;
          if (uLead.message && uLead.message.includes("Usage: ")) {
            seconds = parseInt(uLead.message.replace("Usage: ", "").replace("s", "")) || 0;
          }
          seconds += 10;
          await supabase
            .from("leads")
            .update({ message: `Usage: ${seconds}s` })
            .eq("id", uLead.id);
        }
      }, 10000);
    };

    trackUsage();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const { scrollY } = useScroll();
  const bgGlowY1 = useTransform(scrollY, [0, 1000], [0, -100]);
  const bgGlowY2 = useTransform(scrollY, [0, 2000], [0, 150]);
  const bgGlowY3 = useTransform(scrollY, [0, 3000], [0, -200]);

  const heroTextY = useTransform(scrollY, [0, 800], [0, 50]);
  const heroImageY = useTransform(scrollY, [0, 800], [0, -80]);

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Slideshow images matching catalog designs
  const slides = useMemo(() => [
    "/classicneverdies.webp",
    "/findyourcanvas2.webp",
    "/FutureVision_1.webp"
  ], []);

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleAddLookToCart = () => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/userlogin");
        return;
      }

      const currentCart: any[] = JSON.parse(localStorage.getItem("fadenfab_cart") || "[]");
      const activeCombo = combos[selectedComboIndex];
      const prod1 = activeCombo.item2; // Tee
      const prod2 = activeCombo.item1; // Hoodie

      // Add T-Shirt
      const idx1 = currentCart.findIndex((item: any) => item.id === prod1.id && item.slug === prod1.slug && item.size === comboTshirtSize);
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
          slug: prod1.slug,
          price: prod1.price,
          size: comboTshirtSize
        });
      }

      // Add Hoodie
      const idx2 = currentCart.findIndex((item: any) => item.id === prod2.id && item.slug === prod2.slug && item.size === comboHoodieSize);
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
          slug: prod2.slug,
          price: prod2.price,
          size: comboHoodieSize
        });
      }

      localStorage.setItem("fadenfab_cart", JSON.stringify(currentCart));
      window.dispatchEvent(new Event("cart-updated"));

      setModalConfig({
        isOpen: true,
        type: "success",
        title: "Combo Added!",
        message: `Success! Added the ${prod1.name} (Size ${comboTshirtSize}) and ${prod2.name} (Size ${comboHoodieSize}) to your cart. 15% Combo Discount is automatically applied!`,
        onConfirm: () => setModalConfig(null),
      });
    });
  };

  const handleAddCustomMockupToCart = () => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/userlogin");
        return;
      }

      const currentCart: any[] = JSON.parse(localStorage.getItem("fadenfab_cart") || "[]");
      const mockId = Date.now();

      currentCart.push({
        id: mockId,
        name: `Custom ${simSilhouette}`,
        image: customDesignFile || "",
        color: simColor,
        fabric: simWeight,
        gsm: simWeight.split(" ")[0] || "220",
        quantity: 1,
        slug: simSilhouette === "Oversized Tee" ? "oversized-tshirts" : "premium-hoodies",
        price: simSilhouette === "Oversized Tee" ? 699 : simSilhouette === "Luxury Hoodie" ? 1499 : 899,
        size: selectedDesignerSize
      });

      localStorage.setItem("fadenfab_cart", JSON.stringify(currentCart));
      window.dispatchEvent(new Event("cart-updated"));

      setModalConfig({
        isOpen: true,
        type: "success",
        title: "Spec Added to Cart!",
        message: `Success! Added your custom-configured ${simSilhouette} (${simColor}, ${simWeight}, Size ${selectedDesignerSize}) to your cart.`,
        onConfirm: () => setModalConfig(null),
      });
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative w-full max-w-full overflow-x-hidden">
      <Navbar />
      <div className="w-full relative flex-grow min-w-0">
        <div className="fixed inset-0 -z-10 overflow-hidden">

  <motion.div
    style={{ y: isDesktop ? bgGlowY1 : 0 }}
    className="
      absolute
      -top-40
      -left-32
      w-[550px]
      h-[550px]
      bg-blue-500/10
      rounded-full
      blur-[140px]
    "
  />

  <motion.div
    style={{ y: isDesktop ? bgGlowY2 : 0 }}
    className="
      absolute
      top-1/3
      -right-32
      w-[500px]
      h-[500px]
      bg-yellow-400/10
      rounded-full
      blur-[140px]
    "
  />

  <motion.div
    style={{ y: isDesktop ? bgGlowY3 : 0 }}
    className="
      absolute
      bottom-0
      left-1/3
      w-[450px]
      h-[450px]
      bg-indigo-500/10
      rounded-full
      blur-[140px]
    "
  />

</div>
  
      {/* ================= BACKGROUND ================= */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.12),transparent_60%)]" />



{/* ================= HERO ================= */}
<section className="relative px-4 pt-24 md:pt-32 pb-4 md:pb-8 overflow-hidden">
  <div className="relative max-w-7xl mx-auto h-[480px] xs:h-[530px] md:h-[700px] overflow-hidden bg-slate-950 flex items-end">
    {/* Background Image */}
    <div className="absolute inset-0 z-0">
      <img
        src="/luxury_hero_banner.jpg"
        alt="FADENFAB Bespoke Series"
        className="w-full h-full object-cover object-center opacity-85 transition-transform duration-10000 ease-out hover:scale-105"
      />
      {/* Subtle overlay gradient to keep text readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30" />
    </div>

    {/* Text Overlay - blended directly over the dark bottom area of the background photo with luxury drop shadows */}
    <div className="relative z-10 p-5 xs:p-8 sm:p-12 md:p-16 max-w-2xl text-left text-white">
      <span 
        className="text-[10px] xs:text-xs font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-slate-350 block mb-2 xs:mb-3"
        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
      >
        The Autumn Edit
      </span>
      <h1 
        className="text-xl xs:text-2xl sm:text-3xl md:text-5xl font-extrabold leading-tight text-white mb-4 xs:mb-6" 
        style={{ 
          fontFamily: '"American Typewriter","American Typewriter Std",serif',
          textShadow: '0 3px 12px rgba(0,0,0,0.6)'
        }}
      >
        Premium Custom Apparel.<br />Refined Craftsmanship.
      </h1>
      <p 
        className="text-slate-200 text-[11px] xs:text-xs sm:text-sm md:text-base leading-relaxed mb-6 xs:mb-8 max-w-lg font-light"
        style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
      >
        Elevate your team’s presence with luxury heavyweight coordinates. Engineered with organic combed cotton, durable precision stitching, and high-fidelity dye prints.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={() => scrollToSection("contact")}
          className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition cursor-pointer shadow-md rounded-none"
        >
          Request Quote
        </button>
        <button
          onClick={() => scrollToSection("collection")}
          className="border border-white hover:bg-white/10 text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest transition cursor-pointer rounded-none"
        >
          View Collections
        </button>
      </div>
    </div>
  </div>
</section>

      {/* ================= COLLECTION ================= */}
      <section
        id="collection"
        className="relative py-10 md:py-16 scroll-mt-24 bg-gradient-to-b from-slate-100 via-white to-slate-50 overflow-hidden"
      >
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0D4A86]/2 blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#0D4A86]/2 blur-[160px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6">
          {/* Section Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-8 md:mb-12"
          >
            <span className="text-[#0D4A86] font-semibold tracking-[4px] uppercase">
              Our Collection
            </span>

            <h2 className="text-4xl md:text-6xl font-extrabold mt-4 text-slate-900">
              Crafted For Every
              <span className="text-[#0D4A86]"> Occasion</span>
            </h2>

            <p className="mt-6 text-lg text-slate-600 leading-8">
              Explore our premium collection of custom apparel designed for corporations, universities, startups, events, and growing brands.
            </p>
          </motion.div>

          {/* Gallery Component */}
          <Gallery />
        </div>
      </section>

      {/* ================= THE PERFECT PAIR COMBO DEAL BANNER ================= */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        <div className="relative bg-[#FAF9F6] border border-slate-200/60 rounded-[24px] md:rounded-[32px] overflow-hidden p-5 xs:p-8 md:p-16 flex flex-col gap-6 md:gap-8 shadow-sm">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px]" />
          
          {/* 1. Header Title Block (Full width, text-left) */}
          <div className="text-left w-full z-10">
            <span className="text-[#0D4A86] text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase block mb-1">
              Exclusive Set Offer
            </span>
            <h2 
              className="text-2xl xs:text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-3 md:mb-5"
              style={{ fontFamily: '"American Typewriter","American Typewriter Std",serif' }}
            >
              {combos[selectedComboIndex].name}<br />Combo Deal
            </h2>
            <p className="hidden sm:block text-slate-500 text-sm md:text-base leading-relaxed font-light mb-8 max-w-lg">
              {combos[selectedComboIndex].desc}
            </p>
          </div>

          {/* Combo tabs (Spans top of card) */}
          <div className="flex gap-1.5 pb-1.5 border-b border-slate-200/40 w-full max-w-md z-10">
            {combos.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setSelectedComboIndex(idx)}
                className={`text-[9px] xs:text-[10px] font-bold uppercase tracking-wider px-4 py-2 border transition-all cursor-pointer ${
                  selectedComboIndex === idx
                    ? "bg-slate-950 border-slate-950 text-white"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                }`}
              >
                Set 0{c.id}
              </button>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-center w-full z-10">
            {/* Left Side: Combo Offer details */}
            <div className="w-full lg:w-1/2 text-left flex flex-col justify-center order-2 lg:order-1">
              {/* Sizing options */}
              <div className="space-y-3.5 mb-6 max-w-md bg-white border border-slate-200/60 p-4 sm:p-5 rounded-2xl shadow-sm">
                {/* Tshirt Size select */}
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-widest">T-Shirt Size</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {["S", "M", "L", "XL", "XXL"].map((size) => (
                      <button
                        key={size}
                        onClick={() => setComboTshirtSize(size)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold border transition-all cursor-pointer ${
                          comboTshirtSize === size
                            ? "bg-slate-950 border-slate-950 text-white shadow-md shadow-slate-950/20"
                            : "bg-white border-slate-200 text-slate-650 hover:border-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hoodie Size select */}
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-widest">Hoodie Size</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {["S", "M", "L", "XL", "XXL"].map((size) => (
                      <button
                        key={size}
                        onClick={() => setComboHoodieSize(size)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-bold border transition-all cursor-pointer ${
                          comboHoodieSize === size
                            ? "bg-slate-950 border-slate-950 text-white shadow-md shadow-slate-950/20"
                            : "bg-white border-slate-200 text-slate-655 hover:border-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing indicator */}
              <div className="flex items-end gap-4 mb-5 pt-2 border-t border-slate-200/50">
                <div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase block mb-0.5">Combo Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#0D4A86]">
                      ₹{Math.round((combos[selectedComboIndex].item1.price + combos[selectedComboIndex].item2.price) * 0.85)}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-400 line-through">
                      ₹{combos[selectedComboIndex].item1.price + combos[selectedComboIndex].item2.price}
                    </span>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-[8px] sm:text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-0.5">
                  Save 15% Instantly
                </span>
              </div>

              {/* CTA Action button */}
              <button
                onClick={handleAddLookToCart}
                className="w-full sm:w-auto bg-slate-950 hover:bg-slate-850 text-white text-xs font-bold uppercase tracking-widest px-10 py-4 transition cursor-pointer rounded-none text-center shadow-lg shadow-slate-950/10"
              >
                Add Combo Set to Cart
              </button>
            </div>

            {/* Right Side: Visual product representation */}
            <div className="w-full lg:w-1/2 flex flex-row items-center justify-center gap-3 sm:gap-6 relative select-none order-1 lg:order-2">
              {/* Card 1: Hoodie */}
              <div className="bg-white border border-slate-100 p-2 sm:p-4 shadow-md rounded-2xl sm:rounded-3xl w-[44%] sm:w-44 md:w-52 transition-transform duration-500 hover:-translate-y-2">
                <div className="relative aspect-[3/4] bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl overflow-hidden mb-2 sm:mb-3">
                  <img
                    src={combos[selectedComboIndex].item1.image}
                    alt={combos[selectedComboIndex].item1.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-bold text-slate-800 text-[10px] sm:text-xs truncate">{combos[selectedComboIndex].item1.name}</h4>
                <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 sm:mt-1 block">₹{combos[selectedComboIndex].item1.price}</span>
              </div>

              <span className="text-slate-450 font-black text-xl shrink-0">+</span>

              {/* Card 2: Tee */}
              <div className="bg-white border border-slate-100 p-2 sm:p-4 shadow-md rounded-2xl sm:rounded-3xl w-[44%] sm:w-44 md:w-52 transition-transform duration-500 hover:-translate-y-2">
                <div className="relative aspect-[3/4] bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl overflow-hidden mb-2 sm:mb-3">
                  <img
                    src={combos[selectedComboIndex].item2.image}
                    alt={combos[selectedComboIndex].item2.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-bold text-slate-800 text-[10px] sm:text-xs truncate">{combos[selectedComboIndex].item2.name}</h4>
                <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 sm:mt-1 block">₹{combos[selectedComboIndex].item2.price}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
{/* ================= BESPOKE CAPABILITIES ================= */}
<section
  id="services"
  className="relative px-6 py-16 scroll-mt-24 bg-white overflow-hidden"
>
  {/* Heading */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="text-center max-w-3xl mx-auto mb-16"
  >
    <span className="text-[#0D4A86] text-xs font-bold tracking-[0.3em] uppercase block">
      Business Segments
    </span>

    <h2 className="text-3xl md:text-5xl font-extrabold mt-4 text-slate-900" style={{ fontFamily: '"American Typewriter","American Typewriter Std",serif' }}>
      Where We Deliver Value
    </h2>

    <p className="mt-4 text-slate-500 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-light">
      FADENFAB manufactures and distributes high-volume custom apparel collections, serving organizations through three primary business channels.
    </p>
  </motion.div>

  {/* Cards Grid */}
  <div className="flex flex-col md:flex-row gap-6 md:gap-8 max-w-7xl mx-auto">
    {[
      {
        title: "Corporate & Team Wear",
        desc: "High-grade custom clothing tailored to reinforce corporate brand identity, company events, and internal team unity.",
        icon: (
          <svg className="w-8 h-8 text-slate-800" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4a3 3 0 00-3 3h6a3 3 0 00-3-3zM3 13.5l9-5.5 9 5.5V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-3.5z" />
          </svg>
        ),
      },
      {
        title: "Academic & Fest Orders",
        desc: "Custom hoodies and event coordinates manufactured in bulk for universities, college departments, and event fests.",
        icon: (
          <svg className="w-8 h-8 text-slate-800" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 019.898 5.841 50.58 50.58 0 00-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M12 13.489v6.517" />
          </svg>
        ),
      },
      {
        title: "Startup & Brand Merch",
        desc: "Premium streetwear-grade apparel manufactured for growing brands, online communities, and content creators.",
        icon: (
          <svg className="w-8 h-8 text-slate-800" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        ),
      },
    ].map((service, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.1, duration: 0.6 }}
        className="flex-1 group bg-transparent md:bg-[#FAF9F6] border-b border-slate-100 last:border-b-0 md:border md:border-slate-100 p-4 py-8 md:p-10 transition-all duration-300 rounded-none flex flex-col justify-between text-left"
      >
        <div>
          {/* Icon */}
          <div className="w-14 h-14 bg-white border border-slate-100 flex items-center justify-center mb-4 md:mb-8 transition-colors group-hover:bg-slate-900 group-hover:text-white">
            <div className="transition-transform duration-500 group-hover:scale-110 group-hover:invert">
              {service.icon}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg md:text-xl font-bold text-slate-900" style={{ fontFamily: '"American Typewriter","American Typewriter Std",serif' }}>
            {service.title}
          </h3>

          {/* Desc */}
          <p className="text-slate-500 mt-2 md:mt-4 text-sm leading-relaxed font-light">
            {service.desc}
          </p>
        </div>

        {/* Bottom Underline */}
        <div className="hidden md:block mt-8 h-[1px] w-8 bg-[#0D4A86] group-hover:w-full transition-all duration-500 ease-out" />
      </motion.div>
    ))}
  </div>
</section>



    {/* ================= BESPOKE FITTING ROOM SIMULATOR ================= */}
    <div id="designer" className="mt-8 md:mt-16 border-t border-slate-100 pt-8 md:pt-12 scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-3xl mx-auto mb-6 md:mb-10"
      >
        <span className="text-[#0D4A86] text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase block">
          Design Studio
        </span>
        <h2 className="text-xl xs:text-2xl md:text-4xl font-extrabold mt-2 text-slate-900" style={{ fontFamily: '"American Typewriter","American Typewriter Std",serif' }}>
          Interactive Mockup Designer
        </h2>
        <p className="mt-2 text-slate-500 text-xs sm:text-sm leading-relaxed font-light max-w-2xl mx-auto">
          Build a custom preview of your corporate, team, or college apparel. Select parameters to simulate color, weight, and layout combinations instantly.
        </p>
      </motion.div>

      <div className="bg-transparent p-0 grid lg:grid-cols-12 gap-4 md:gap-6 items-stretch max-w-7xl mx-auto px-4 md:px-6">
        {/* Left Side: Mockup Live Canvas Preview */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50/50 border border-slate-100 relative min-h-[300px] md:min-h-[380px] rounded-none overflow-hidden">
          <span className="absolute top-3 left-3 text-[9px] font-bold tracking-[0.2em] text-[#0D4A86] uppercase bg-blue-50/90 backdrop-blur px-2.5 py-1 rounded z-10">
            Live Design Preview
          </span>

          {/* T-Shirt or Hoodie Outline with Spring-Loaded Parallax Feel */}
          <motion.div
            key={simSilhouette + simColor + configStep}
            initial={{ opacity: 0.85, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="relative w-full h-[200px] md:h-[260px] flex items-center justify-center transition-all duration-300 my-4"
          >
            {simSilhouette === "Oversized Tee" && (
              <svg className="w-36 h-36 md:w-52 md:h-52 transition-all duration-300 drop-shadow-lg" viewBox="0 0 100 100" fill="none">
                <defs>
                  {/* Textile grain weave filter simulation */}
                  <filter id="tee-fabric-bump" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.08 0" result="coloredNoise" />
                    <feComposite operator="in" in2="SourceGraphic" result="texture" />
                    <feBlend mode="multiply" in="SourceGraphic" in2="texture" />
                  </filter>
                  <linearGradient id="tee-shading" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                    <stop offset="50%" stopColor="#000000" stopOpacity="0.0" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.32" />
                  </linearGradient>
                </defs>
                {/* Custom Branding artwork overlay on chest */}
                {customDesignFile && (
                  <g opacity="0.8">
                    <image
                      href={customDesignFile}
                      x="38"
                      y="32"
                      width="24"
                      height="18"
                      preserveAspectRatio="xMidYMid meet"
                    />
                  </g>
                )}
                {/* Main Shirt Body */}
                <path
                  d="M 25,17 C 32,20 68,20 75,17 L 85,28 C 87,29.5 83,37 79,37 C 76,37 75,34 75,34 L 75,85 C 75,88 25,88 25,85 L 25,34 C 25,34 24,37 20,37 C 17,37 13,29.5 15,28 Z"
                  fill={colors.find(c => c.name === simColor)?.hex}
                  filter="url(#tee-fabric-bump)"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Realistic shading overlay */}
                <path
                  d="M 25,17 C 32,20 68,20 75,17 L 85,28 C 87,29.5 83,37 79,37 C 76,37 75,34 75,34 L 75,85 C 75,88 25,88 25,85 L 25,34 C 25,34 24,37 20,37 C 17,37 13,29.5 15,28 Z"
                  fill="url(#tee-shading)"
                  stroke="none"
                />
                {/* Neck Line Ring collar details */}
                <path
                  d="M 40,18.5 C 43,22 57,22 60,18.5"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                {/* Sleeve Seams */}
                <path d="M 25,34 L 15,28 M 75,34 L 85,28" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="1,1" />
                {/* Fold lines for depth */}
                <path d="M 28,36 C 33,42 32,46 35,52" fill="none" stroke="#000" strokeWidth="0.8" opacity="0.12" />
                <path d="M 72,36 C 67,42 68,46 65,52" fill="none" stroke="#000" strokeWidth="0.8" opacity="0.12" />
              </svg>
            )}
            {simSilhouette === "Luxury Hoodie" && (
              <svg className="w-36 h-36 md:w-52 md:h-52 transition-all duration-300 drop-shadow-lg" viewBox="0 0 100 100" fill="none">
                <defs>
                  {/* Textile grain weave filter simulation */}
                  <filter id="hoodie-fabric-bump" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.08 0" result="coloredNoise" />
                    <feComposite operator="in" in2="SourceGraphic" result="texture" />
                    <feBlend mode="multiply" in="SourceGraphic" in2="texture" />
                  </filter>
                  <linearGradient id="hoodie-shading" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
                    <stop offset="50%" stopColor="#000000" stopOpacity="0.0" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
                  </linearGradient>
                </defs>
                {/* Custom Branding artwork overlay on chest */}
                {customDesignFile && (
                  <g opacity="0.8">
                    <image
                      href={customDesignFile}
                      x="38"
                      y="40"
                      width="24"
                      height="18"
                      preserveAspectRatio="xMidYMid meet"
                    />
                  </g>
                )}
                {/* Main Hoodie Body */}
                <path
                  d="M 24,25 C 32,27 68,27 76,25 L 86,40 C 88,42.5 83,49 79,49 C 76,49 75,44 75,44 L 75,85 C 75,88 25,88 25,85 L 25,44 C 25,44 24,49 20,49 C 16,49 12,42.5 14,40 Z"
                  fill={colors.find(c => c.name === simColor)?.hex}
                  filter="url(#hoodie-fabric-bump)"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Realistic shading overlay */}
                <path
                  d="M 24,25 C 32,27 68,27 76,25 L 86,40 C 88,42.5 83,49 79,49 C 76,49 75,44 75,44 L 75,85 C 75,88 25,88 25,85 L 25,44 C 25,44 24,49 20,49 C 16,49 12,42.5 14,40 Z"
                  fill="url(#hoodie-shading)"
                  stroke="none"
                />
                {/* Hood Overlay behind head/neck area */}
                <path
                  d="M 33,25 C 28,12 36,4 50,4 C 64,4 72,12 67,25 C 57,29 43,29 33,25 Z"
                  fill={colors.find(c => c.name === simColor)?.hex}
                  filter="url(#hoodie-fabric-bump)"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Inner Hood shadow shading */}
                <path
                  d="M 38,23 C 38,15 42,9 50,9 C 58,9 62,15 62,23 C 55,25 45,25 38,23 Z"
                  fill="#000000"
                  opacity="0.18"
                />
                {/* Drawstrings */}
                <path d="M 46,24 L 46,42 M 54,24 L 54,42" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="46" cy="42" r="1.5" fill="#1e293b" />
                <circle cx="54" cy="42" r="1.5" fill="#1e293b" />
                {/* Kangaroo Pocket */}
                <path
                  d="M 32,62 C 32,58 68,58 68,62 L 64,82 C 64,84 36,84 36,82 Z"
                  fill={colors.find(c => c.name === simColor)?.hex}
                  stroke="#1e293b"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                {/* Kangaroo Pocket Slant Cuts */}
                <path d="M 32,62 L 39,72 L 39,82" fill="none" stroke="#1e293b" strokeWidth="1.2" />
                <path d="M 68,62 L 61,72 L 61,82" fill="none" stroke="#1e293b" strokeWidth="1.2" />
                {/* Ribbed Hem & Cuffs */}
                <path d="M 24,83 L 76,83" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="1,1" />
                <path d="M 24,86 L 76,86" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              </svg>
            )}
            {simSilhouette === "Classic Polo" && (
              <svg className="w-36 h-36 md:w-52 md:h-52 transition-all duration-300 drop-shadow-lg" viewBox="0 0 100 100" fill="none">
                <defs>
                  {/* Textile grain weave filter simulation */}
                  <filter id="polo-fabric-bump" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" result="noise" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.08 0" result="coloredNoise" />
                    <feComposite operator="in" in2="SourceGraphic" result="texture" />
                    <feBlend mode="multiply" in="SourceGraphic" in2="texture" />
                  </filter>
                  <linearGradient id="polo-shading" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                    <stop offset="50%" stopColor="#000000" stopOpacity="0.0" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.32" />
                  </linearGradient>
                </defs>
                {/* Custom Branding artwork overlay on chest */}
                {customDesignFile && (
                  <g opacity="0.8">
                    <image
                      href={customDesignFile}
                      x="32"
                      y="32"
                      width="10"
                      height="8"
                      preserveAspectRatio="xMidYMid meet"
                    />
                  </g>
                )}
                {/* Main Polo Body */}
                <path
                  d="M 30,17 C 38,20 62,20 70,17 L 85,28 C 87,29.5 83,37 79,37 C 76,37 75,34 75,34 L 75,88 C 75,91 25,91 25,88 L 25,34 C 25,34 24,37 20,37 C 17,37 13,29.5 15,28 Z"
                  fill={colors.find(c => c.name === simColor)?.hex}
                  filter="url(#polo-fabric-bump)"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Shading */}
                <path
                  d="M 30,17 C 38,20 62,20 70,17 L 85,28 C 87,29.5 83,37 79,37 C 76,37 75,34 75,34 L 75,88 C 75,91 25,91 25,88 L 25,34 C 25,34 24,37 20,37 C 17,37 13,29.5 15,28 Z"
                  fill="url(#polo-shading)"
                  stroke="none"
                />
                {/* Polo Collar */}
                <path
                  d="M 30,17 L 42,26 L 50,20 L 58,26 L 70,17 C 62,21 38,21 30,17 Z"
                  fill={colors.find(c => c.name === simColor)?.hex}
                  filter="url(#polo-fabric-bump)"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Collar Rib Border Detail */}
                <path d="M 30,17 L 42,26 M 58,26 L 70,17" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                {/* Button Placket */}
                <path
                  d="M 46,20 L 46,38 L 54,38 L 54,20 Z"
                  fill={colors.find(c => c.name === simColor)?.hex}
                  stroke="#1e293b"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                {/* Placket Seams */}
                <line x1="46" y1="20" x2="46" y2="38" stroke="#1e293b" strokeWidth="0.8" />
                <line x1="54" y1="20" x2="54" y2="38" stroke="#1e293b" strokeWidth="0.8" />
                {/* Buttons */}
                <circle cx="50" cy="26" r="1.2" fill="#fff" stroke="#1e293b" strokeWidth="0.6" />
                <circle cx="50" cy="32" r="1.2" fill="#fff" stroke="#1e293b" strokeWidth="0.6" />
                {/* Chest Pocket */}
                <path
                  d="M 58,35 L 67,35 L 67,46 L 62.5,49 L 58,46 Z"
                  fill={colors.find(c => c.name === simColor)?.hex}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeLinejoin="round"
                  opacity="0.8"
                />
                <line x1="58" y1="36" x2="67" y2="36" stroke="#1e293b" strokeWidth="0.6" opacity="0.6" />
                {/* Sleeve Hem Ribs */}
                <path d="M 25,34 L 15,28" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="1,1" />
                <path d="M 75,34 L 85,28" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="1,1" />
              </svg>
            )}

            {/* Visual Textures details */}
            <span className="absolute bottom-2 text-[9px] tracking-[0.2em] uppercase font-bold text-slate-400">
              {simSilhouette} • {simColor}
            </span>
          </motion.div>

          {/* Floating Est. Price Badge */}
          <div className="absolute top-3 right-3 bg-slate-900 text-white px-3 py-1.5 shadow-md text-right animate-fadeIn z-10">
            <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest block leading-none mb-0.5">Est. Price</span>
            <span className="text-xs sm:text-sm font-extrabold font-serif">
              {simSilhouette === "Oversized Tee" ? "₹699" : simSilhouette === "Luxury Hoodie" ? "₹1,499" : "₹899"}
            </span>
          </div>

          {/* Floating bottom corners info badges */}
          <div className="absolute bottom-3 left-3 bg-white/95 border border-slate-200/50 shadow-sm text-slate-800 px-2.5 py-1 z-10">
            <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest block leading-none mb-0.5">Weight</span>
            <span className="text-[9px] sm:text-xs font-extrabold text-slate-900 block leading-tight">{simWeight.split(" ")[0]} GSM</span>
          </div>

          <div className="absolute bottom-3 right-3 bg-white/95 border border-slate-200/50 shadow-sm text-slate-800 px-2.5 py-1 z-10 text-right">
            <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest block leading-none mb-0.5">Shade</span>
            <span className="text-[9px] sm:text-xs font-extrabold text-slate-900 block leading-tight">{simColor}</span>
          </div>
        </div>

        {/* Right Side: Step Configurator Panel */}
        <div className="lg:col-span-7 bg-white border border-slate-100 p-4 sm:p-6 flex flex-col justify-between text-left relative min-h-[260px] md:min-h-[380px] rounded-none shadow-sm">
          <div>
            {/* Step Indicators */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5 md:mb-4">
              {[
                { step: 1, label: "Silhouette" },
                { step: 2, label: "GSM Weight" },
                { step: 3, label: "Shade" },
                { step: 4, label: "Review" }
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                    configStep === s.step
                      ? "bg-[#0D4A86] text-white"
                      : configStep > s.step
                      ? "bg-green-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}>
                    {configStep > s.step ? "✓" : s.step}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest hidden sm:inline transition-colors duration-300 ${
                    configStep === s.step ? "text-[#0D4A86]" : "text-slate-400"
                  }`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Config Panels with Framer Motion slide-in animations */}
            <AnimatePresence mode="wait">
              {configStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2 md:space-y-4"
                >
                  <div>
                    <span className="text-[8px] sm:text-[10px] font-bold tracking-[0.2em] text-[#0D4A86] uppercase block mb-0.5">Step 01</span>
                    <h3 className="text-sm sm:text-lg font-bold text-slate-800 font-serif">Choose Garment Silhouette</h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed font-light mb-2 md:mb-4">Select the design cut format for your custom project.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 xs:gap-2">
                    {[
                      { name: "Oversized Tee", sub: "220 GSM Relaxed" },
                      { name: "Luxury Hoodie", sub: "350 GSM Fleece" },
                      { name: "Classic Polo", sub: "240 GSM Knit" }
                    ].map((item) => (
                      <button
                        key={item.name}
                        onClick={() => setSimSilhouette(item.name)}
                        className={`p-1.5 xs:p-2.5 sm:p-4 border transition cursor-pointer text-left rounded-none flex flex-col justify-between min-h-[50px] sm:min-h-[75px] w-full ${
                          simSilhouette === item.name
                            ? "border-[#0D4A86] bg-[#0D4A86]/5 text-[#0D4A86] font-bold"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        <span className="text-[8px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-wider block leading-tight">{item.name}</span>
                        <span className="text-[6.5px] xs:text-[8px] sm:text-[9px] mt-1 md:mt-2 block opacity-70 font-light leading-tight">{item.sub}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {configStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2 md:space-y-4"
                >
                  <div>
                    <span className="text-[8px] sm:text-[10px] font-bold tracking-[0.2em] text-[#0D4A86] uppercase block mb-0.5">Step 02</span>
                    <h3 className="text-sm sm:text-lg font-bold text-slate-800 font-serif">Choose Fabric Weight</h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed font-light mb-2 md:mb-4">Select the fabric weight (GSM) and coordinate material knit profile.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 xs:gap-2">
                    {[
                      { name: "220 GSM Combed Cotton", desc: "Organic Cotton - Soft & Light" },
                      { name: "350 GSM Loopback Terry", desc: "French Terry - Heavy & Warm" }
                    ].map((weight) => (
                      <button
                        key={weight.name}
                        onClick={() => setSimWeight(weight.name)}
                        className={`p-1.5 xs:p-2.5 sm:p-4 border transition cursor-pointer text-left rounded-none flex flex-col justify-between min-h-[50px] sm:min-h-[75px] w-full ${
                          simWeight === weight.name
                            ? "border-[#0D4A86] bg-[#0D4A86]/5 text-[#0D4A86] font-bold"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        <span className="text-[8px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-wider block leading-tight">{weight.name.split(" ")[0]} {weight.name.split(" ")[1]} GSM</span>
                        <span className="text-[6.5px] xs:text-[8px] sm:text-[9px] mt-1 md:mt-2 block opacity-70 font-light leading-tight">{weight.desc.split(" - ")[1] || weight.desc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {configStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2 md:space-y-4"
                >
                  <div>
                    <span className="text-[8px] sm:text-[10px] font-bold tracking-[0.2em] text-[#0D4A86] uppercase block mb-0.5">Step 03</span>
                    <h3 className="text-sm sm:text-lg font-bold text-slate-800 font-serif">Select Color Dye</h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed font-light mb-2 md:mb-4">Choose from our curated reactive organic dye collection shades.</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2 sm:gap-4">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSimColor(color.name)}
                        className={`flex flex-col items-center p-2 border transition cursor-pointer rounded-none text-center ${
                          simColor === color.name
                            ? "border-[#0D4A86] bg-[#0D4A86]/5 text-[#0D4A86]"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-400"
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-slate-250/70 shadow-sm"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="mt-1 text-[8px] font-bold uppercase tracking-wider truncate w-full">
                          {color.name.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {configStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2 md:space-y-4"
                >
                  <div>
                    <span className="text-[8px] sm:text-[10px] font-bold tracking-[0.2em] text-[#0D4A86] uppercase block mb-0.5">Step 04</span>
                    <h3 className="text-sm sm:text-lg font-bold text-slate-800 font-serif">Review Specifications</h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed font-light mb-2 md:mb-4">Confirm your parameters before adding to your shopping cart.</p>
                  </div>

                  <div className="bg-[#FAF9F6] border border-slate-200/60 p-3 md:p-4 space-y-2 md:space-y-3">
                    <div className="flex justify-between text-[10px] md:text-xs border-b border-slate-200 pb-1.5 md:pb-2">
                      <span className="text-slate-400 uppercase tracking-widest">Garment</span>
                      <span className="font-bold text-slate-800 uppercase tracking-wider">{simSilhouette}</span>
                    </div>
                    <div className="flex justify-between text-[10px] md:text-xs border-b border-slate-200 pb-1.5 md:pb-2">
                      <span className="text-slate-400 uppercase tracking-widest">Fabric Weight</span>
                      <span className="font-bold text-slate-800 uppercase tracking-wider">{simWeight}</span>
                    </div>
                    <div className="flex justify-between text-[10px] md:text-xs border-b border-slate-200 pb-1.5 md:pb-2">
                      <span className="text-slate-400 uppercase tracking-widest">Dye Shade</span>
                      <span className="font-bold text-slate-800 uppercase tracking-wider">{simColor}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] md:text-xs border-b border-slate-200 pb-1.5 md:pb-2">
                      <span className="text-slate-400 uppercase tracking-widest">Select Size</span>
                      <div className="flex gap-1.5">
                        {["S", "M", "L", "XL", "XXL"].map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedDesignerSize(size)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all cursor-pointer ${
                              selectedDesignerSize === size
                                ? "bg-slate-950 border-slate-950 text-white shadow-md shadow-slate-950/20"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 border-b border-slate-200 pb-2">
                      <div className="flex justify-between items-center text-[10px] md:text-xs">
                        <span className="text-slate-400 uppercase tracking-widest">Design Graphic</span>
                        {customDesignFile ? (
                          <button
                            onClick={() => setCustomDesignFile(null)}
                            className="text-red-500 hover:text-red-650 text-[9px] font-bold uppercase transition cursor-pointer"
                          >
                            Remove
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[9px] italic">None chosen</span>
                        )}
                      </div>
                      <div className="flex gap-3 items-center mt-1">
                        <label className="bg-slate-900 hover:bg-slate-850 text-white text-[8.5px] font-bold uppercase tracking-widest px-3 py-1.5 cursor-pointer transition">
                          Choose File
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  setModalConfig({
                                    isOpen: true,
                                    type: "error",
                                    title: "File Too Large",
                                    message: "Please choose a design graphic file under 5MB.",
                                    onConfirm: () => setModalConfig(null)
                                  });
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const img = new Image();
                                  img.src = reader.result as string;
                                  img.onload = () => {
                                    const canvas = document.createElement("canvas");
                                    const MAX_WIDTH = 200;
                                    const scale = MAX_WIDTH / img.width;
                                    canvas.width = MAX_WIDTH;
                                    canvas.height = img.height * scale;
                                    const ctx = canvas.getContext("2d");
                                    if (ctx) {
                                      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                      setCustomDesignFile(canvas.toDataURL("image/png", 0.8));
                                    }
                                  };
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        {customDesignFile && (
                          <div className="relative w-8 h-8 border border-slate-200 rounded-lg p-0.5 overflow-hidden flex items-center justify-center bg-white animate-fadeIn">
                            <img src={customDesignFile} alt="Preview" className="object-contain w-full h-full" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-slate-500 font-bold uppercase tracking-widest">Estimated Price</span>
                      <span className="font-extrabold text-[#0D4A86]">
                        {simSilhouette === "Oversized Tee" ? "₹699" : simSilhouette === "Luxury Hoodie" ? "₹1,499" : "₹899"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Wizards Footer */}
          <div className="border-t border-slate-100 pt-2.5 mt-2.5 md:pt-4 md:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-between w-full">
            {/* Back Button */}
            <button
              onClick={() => setConfigStep((prev) => Math.max(1, prev - 1))}
              disabled={configStep === 1}
              className="w-full sm:w-auto px-4 py-2 border border-slate-200 text-slate-650 hover:bg-slate-50 text-[9px] sm:text-xs font-bold uppercase tracking-widest transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none rounded-none text-center"
            >
              ← Back
            </button>

            {/* Next / Add to Cart split controls */}
            {configStep < 4 ? (
              <button
                onClick={() => setConfigStep((prev) => Math.min(4, prev + 1))}
                className="w-full sm:w-auto px-5 py-2 bg-[#0D4A86] hover:bg-[#083A6B] text-white text-[9px] sm:text-xs font-bold uppercase tracking-widest transition cursor-pointer rounded-none text-center"
              >
                Next Step →
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-1 justify-end">
                <button
                  onClick={handleAddCustomMockupToCart}
                  className="flex-1 sm:flex-initial px-5 py-2 bg-slate-950 hover:bg-slate-850 text-white text-[9px] sm:text-xs font-bold uppercase tracking-widest transition cursor-pointer rounded-none text-center"
                >
                  Add Custom Spec to Cart
                </button>
                <button
                  onClick={() => {
                    const formEl = document.getElementById("contact");
                    if (formEl) {
                      formEl.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className="flex-1 sm:flex-initial px-6 py-3 border border-slate-350 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-widest transition cursor-pointer rounded-none text-center"
                >
                  Bulk Inquiry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
      



{/* ================= TESTIMONIALS ================= */}
<Testimonials />

{/* ================= CONTACT ================= */}
<section
  className="scroll-mt-32"
>
  <Contact />
</section>



{/* ================= FLOATING WHATSAPP ================= */}
<a
  href="https://wa.me/916374998042"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Chat with FADENFAB on WhatsApp"
  className="fixed bottom-6 right-6 transition-all duration-300 z-40 bg-green-500 hover:bg-green-400 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl text-3xl floating-whatsapp"
>
  💬
</a>



      {showExpiredModal && (
        <CustomModal
          isOpen={showExpiredModal}
          type="info"
          title="Session Expired"
          message="Your session has expired due to 60 minutes of inactivity. Please login again."
          onConfirm={() => {
            setShowExpiredModal(false);
            router.replace("/");
          }}
        />
      )}

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
  );
}