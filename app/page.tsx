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
      router.replace("/");
    }
  }, [router]);   // <-- HERE

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

      const currentCart = JSON.parse(localStorage.getItem("fadenfab_cart") || "[]");
      const prod1 = getCatalog()["oversized-tshirts"]?.products?.[0];
      const prod2 = getCatalog()["premium-hoodies"]?.products?.[0];

      if (!prod1 || !prod2) return;

      // Add T-Shirt
      const idx1 = currentCart.findIndex((item: any) => item.id === prod1.id && item.slug === "oversized-tshirts");
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
          slug: "oversized-tshirts",
          price: 699
        });
      }

      // Add Hoodie
      const idx2 = currentCart.findIndex((item: any) => item.id === prod2.id && item.slug === "premium-hoodies");
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
          slug: "premium-hoodies",
          price: 1499
        });
      }

      localStorage.setItem("fadenfab_cart", JSON.stringify(currentCart));
      window.dispatchEvent(new Event("cart-updated"));

      setModalConfig({
        isOpen: true,
        type: "success",
        title: "Combo Added!",
        message: "The premium coordinate combo look has been added to your cart with a 15% discount applied!",
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

      const currentCart = JSON.parse(localStorage.getItem("fadenfab_cart") || "[]");
      const mockId = Date.now();

      currentCart.push({
        id: mockId,
        name: `Custom ${simSilhouette}`,
        image: "",
        color: simColor,
        fabric: simWeight,
        gsm: simWeight.split(" ")[0] || "220",
        quantity: 1,
        slug: simSilhouette === "Oversized Tee" ? "oversized-tshirts" : "premium-hoodies",
        price: simSilhouette === "Oversized Tee" ? 699 : simSilhouette === "Luxury Hoodie" ? 1499 : 899
      });

      localStorage.setItem("fadenfab_cart", JSON.stringify(currentCart));
      window.dispatchEvent(new Event("cart-updated"));

      setModalConfig({
        isOpen: true,
        type: "success",
        title: "Spec Added to Cart!",
        message: `Success! Added your custom-configured ${simSilhouette} (${simColor}, ${simWeight}) to your cart.`,
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
<section className="relative px-6 pt-28 md:pt-32 pb-8 overflow-hidden">
  <div className="relative max-w-7xl mx-auto h-[550px] md:h-[700px] overflow-hidden bg-slate-950 flex items-end">
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
    <div className="relative z-10 p-8 sm:p-12 md:p-16 max-w-2xl text-left text-white">
      <span 
        className="text-xs font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-slate-350 block mb-3"
        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
      >
        The Autumn Edit
      </span>
      <h1 
        className="text-3xl md:text-5xl font-extrabold leading-tight text-white mb-6" 
        style={{ 
          fontFamily: '"American Typewriter","American Typewriter Std",serif',
          textShadow: '0 3px 12px rgba(0,0,0,0.6)'
        }}
      >
        Premium Custom Apparel.<br />Refined Craftsmanship.
      </h1>
      <p 
        className="text-slate-200 text-sm md:text-base leading-relaxed mb-8 max-w-lg font-light"
        style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
      >
        Elevate your team’s presence with luxury heavyweight coordinates. Engineered with organic combed cotton, durable precision stitching, and high-fidelity dye prints.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
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
  <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
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
        className="group bg-[#FAF9F6] border border-slate-100 p-8 sm:p-10 transition-all duration-300 rounded-none flex flex-col justify-between"
      >
        <div>
          {/* Icon */}
          <div className="w-14 h-14 bg-white border border-slate-100 flex items-center justify-center mb-8 transition-colors group-hover:bg-slate-900 group-hover:text-white">
            <div className="transition-transform duration-500 group-hover:scale-110 group-hover:invert">
              {service.icon}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: '"American Typewriter","American Typewriter Std",serif' }}>
            {service.title}
          </h3>

          {/* Desc */}
          <p className="text-slate-500 mt-4 text-sm leading-relaxed font-light">
            {service.desc}
          </p>
        </div>

        {/* Bottom Underline */}
        <div className="mt-8 h-[1px] w-8 bg-[#0D4A86] group-hover:w-full transition-all duration-500 ease-out" />
      </motion.div>
    ))}
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
        <span className="text-[#0D4A86]">
          {" "}Occasion
        </span>
      </h2>

      <p className="mt-6 text-lg text-slate-600 leading-8">
        Explore our premium collection of custom apparel
        designed for corporations, universities, startups,
        events, and growing brands.
      </p>
    </motion.div>

    {/* Gallery Component */}
    <Gallery />

    {/* ================= FEATURED COMBO SETS ================= */}
    {/* <div className="mt-28 border-t border-slate-100 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <span className="text-[#0D4A86] text-xs font-bold tracking-[0.3em] uppercase block">
          Featured Combo Sets
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold mt-4 text-slate-900" style={{ fontFamily: '"American Typewriter","American Typewriter Std",serif' }}>
          Coordinate Sets
        </h2>
        <p className="mt-4 text-slate-500 text-sm leading-relaxed font-light">
          Get a matching T-Shirt + Hoodie combo set and automatically save 15% on your custom coordinates.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {[
          {
            image: "/luxury_hoodies.jpg",
            title: "01 / The Premium Coordinates Set",
            details: "Featuring the 350 GSM Loopback Cotton Hoodie paired with structured knit trousers. Colored in Muted Beige.",
          },
          {
            image: "/classicneverdies.webp",
            title: "02 / The Heavyweight Oversized Tee Look",
            details: "Featuring the 220 GSM Combed Cotton Drop-Shoulder Silhouette. Finished with precise flat-lock seams in Off-White.",
          }
        ].map((look, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="group flex flex-col text-left"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 border border-slate-100">
              <img
                src={look.image}
                alt={look.title}
                className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
              />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mt-5 font-serif">
              {look.title}
            </h4>
            <p className="text-slate-500 text-sm mt-2 font-light leading-relaxed">
              {look.details}
            </p>
            <div className="mt-5">
              <button
                onClick={handleAddLookToCart}
                className="bg-slate-950 hover:bg-slate-850 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 transition cursor-pointer rounded-none"
              >
                Add Combo Set to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div> */}

    {/* ================= BESPOKE FITTING ROOM SIMULATOR ================= */}
    <div id="designer" className="mt-28 border-t border-slate-100 pt-20 scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <span className="text-[#0D4A86] text-xs font-bold tracking-[0.3em] uppercase block">
          Design Studio
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold mt-4 text-slate-900" style={{ fontFamily: '"American Typewriter","American Typewriter Std",serif' }}>
          Interactive Mockup Designer
        </h2>
        <p className="mt-4 text-slate-500 text-sm leading-relaxed font-light">
          Build a custom preview of your corporate, team, or college apparel. Select parameters to simulate color, weight, and layout combinations instantly.
        </p>
      </motion.div>

      <div className="bg-[#FAF9F6] border border-slate-100 p-6 md:p-12 grid lg:grid-cols-12 gap-10 items-stretch">
        {/* Left Side: Mockup Live Canvas Preview */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between p-8 bg-white border border-slate-100 relative min-h-[380px] md:min-h-[440px]">
          <span className="text-[9px] font-bold tracking-[0.25em] text-[#0D4A86] uppercase bg-blue-50 px-3 py-1 self-start">
            Live Design Preview
          </span>

          {/* T-Shirt or Hoodie Outline with Spring-Loaded Parallax Feel */}
          <motion.div
            key={simSilhouette + simColor + configStep}
            initial={{ opacity: 0.85, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="relative w-full h-[240px] md:h-[280px] flex items-center justify-center transition-all duration-300 my-6"
          >
            {simSilhouette === "Oversized Tee" && (
              <svg className="w-44 h-44 md:w-52 md:h-52 transition-all duration-300 drop-shadow-lg" viewBox="0 0 100 100" fill="none">
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
                {/* Main Shirt Body */}
                <path
                  d="M 30,15 C 38,18 62,18 70,15 L 86,26 C 88,27.5 84,36 80,36 C 76,36 75,32 75,32 L 75,88 C 75,91 25,91 25,88 L 25,32 C 25,32 24,36 20,36 C 16,36 12,27.5 14,26 Z"
                  fill={colors.find(c => c.name === simColor)?.hex}
                  filter="url(#tee-fabric-bump)"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Fabric Shading Overlay */}
                <path
                  d="M 30,15 C 38,18 62,18 70,15 L 86,26 C 88,27.5 84,36 80,36 C 76,36 75,32 75,32 L 75,88 C 75,91 25,91 25,88 L 25,32 C 25,32 24,36 20,36 C 16,36 12,27.5 14,26 Z"
                  fill="url(#tee-shading)"
                  stroke="none"
                />
                {/* Collar Ribbing */}
                <path
                  d="M 36,15.5 C 40,19 60,19 64,15.5"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                />
                <path
                  d="M 37,16 C 41,19.2 59,19.2 63,16"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="0.8"
                  opacity="0.5"
                />
                {/* Sleeve Seams */}
                <path d="M 25,32 L 15,25.5" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="1,1" />
                <path d="M 75,32 L 85,25.5" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="1,1" />
                {/* Crease lines for realistic folds */}
                <path d="M 28,34 C 33,40 31,45 34,50" fill="none" stroke="#000" strokeWidth="0.8" opacity="0.15" />
                <path d="M 72,34 C 67,40 69,45 66,50" fill="none" stroke="#000" strokeWidth="0.8" opacity="0.15" />
                <path d="M 32,80 C 45,82 55,82 68,80" fill="none" stroke="#000" strokeWidth="0.8" opacity="0.1" />
              </svg>
            )}
            {simSilhouette === "Luxury Hoodie" && (
              <svg className="w-44 h-44 md:w-52 md:h-52 transition-all duration-300 drop-shadow-lg" viewBox="0 0 100 100" fill="none">
                <defs>
                  {/* Textile grain weave filter simulation */}
                  <filter id="hoodie-fabric-bump" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.08 0" result="coloredNoise" />
                    <feComposite operator="in" in2="SourceGraphic" result="texture" />
                    <feBlend mode="multiply" in="SourceGraphic" in2="texture" />
                  </filter>
                  <linearGradient id="hoodie-shading" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                    <stop offset="50%" stopColor="#000000" stopOpacity="0.0" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
                  </linearGradient>
                </defs>
                {/* Main Hoodie Body */}
                <path
                  d="M 26,24 C 34,26.5 66,26.5 74,24 L 88,36 C 90,38 86,45 81,45 C 77,45 76,41 76,41 L 76,86 C 76,89 24,89 24,86 L 24,41 C 24,41 23,45 19,45 C 14,45 10,38 12,36 Z"
                  fill={colors.find(c => c.name === simColor)?.hex}
                  filter="url(#hoodie-fabric-bump)"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Shading */}
                <path
                  d="M 26,24 C 34,26.5 66,26.5 74,24 L 88,36 C 90,38 86,45 81,45 C 77,45 76,41 76,41 L 76,86 C 76,89 24,89 24,86 L 24,41 C 24,41 23,45 19,45 C 14,45 10,38 12,36 Z"
                  fill="url(#hoodie-shading)"
                  stroke="none"
                />
                {/* Hood Outline */}
                <path
                  d="M 26,24 C 20,8 35,2 50,2 C 65,2 80,8 74,24 C 68,27.5 32,27.5 26,24 Z"
                  fill={colors.find(c => c.name === simColor)?.hex}
                  filter="url(#hoodie-fabric-bump)"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Hood Inner Shadow */}
                <path
                  d="M 33,23 C 31,13 42,6 50,6 C 58,6 69,13 67,23 Z"
                  fill="#000000"
                  opacity="0.12"
                />
                {/* Drawstrings */}
                <path d="M 46,24 L 46,38 M 46,38 C 46,39.5 44.5,41 43,41" fill="none" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M 54,24 L 54,41 M 54,41 C 54,42.5 55.5,44 57,44" fill="none" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
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
              <svg className="w-44 h-44 md:w-52 md:h-52 transition-all duration-300 drop-shadow-lg" viewBox="0 0 100 100" fill="none">
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

          <div className="w-full border-t border-slate-100 pt-5 flex items-center justify-between text-left">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Fabric Weight</p>
              <p className="text-xs font-bold text-slate-700 mt-0.5">{simWeight.split(" ")[0]} GSM</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Estimated Value</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5 font-serif">
                {simSilhouette === "Oversized Tee" ? "₹699" : simSilhouette === "Luxury Hoodie" ? "₹1,499" : "₹899"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Step Configurator Panel */}
        <div className="lg:col-span-7 bg-white border border-slate-200/50 p-6 md:p-8 flex flex-col justify-between text-left relative min-h-[440px]">
          <div>
            {/* Step Indicators */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
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
                  className="space-y-4"
                >
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#0D4A86] uppercase block mb-1">Step 01</span>
                    <h3 className="text-lg font-bold text-slate-800 font-serif">Choose Garment Silhouette</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-light mb-4">Select the design cut format for your custom project.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { name: "Oversized Tee", sub: "220 GSM Relaxed Fit" },
                      { name: "Luxury Hoodie", sub: "350 GSM Loopback Terry" },
                      { name: "Classic Polo", sub: "240 GSM Refined Knit" }
                    ].map((item) => (
                      <button
                        key={item.name}
                        onClick={() => setSimSilhouette(item.name)}
                        className={`p-4 border transition cursor-pointer text-left rounded-none flex flex-col justify-between min-h-[85px] ${
                          simSilhouette === item.name
                            ? "border-[#0D4A86] bg-[#0D4A86]/5 text-[#0D4A86]"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-wider">{item.name}</span>
                        <span className="text-[9px] mt-2 block opacity-70 font-light">{item.sub}</span>
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
                  className="space-y-4"
                >
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#0D4A86] uppercase block mb-1">Step 02</span>
                    <h3 className="text-lg font-bold text-slate-800 font-serif">Choose Fabric Weight</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-light mb-4">Select the fabric weight (GSM) and coordinate material knit profile.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { name: "220 GSM Combed Cotton", desc: "Organic Combed Cotton - Light & Soft" },
                      { name: "350 GSM Loopback Terry", desc: "French Terry Knit - Heavy & Premium" }
                    ].map((weight) => (
                      <button
                        key={weight.name}
                        onClick={() => setSimWeight(weight.name)}
                        className={`p-4 border transition cursor-pointer text-left rounded-none flex flex-col justify-between min-h-[85px] ${
                          simWeight === weight.name
                            ? "border-[#0D4A86] bg-[#0D4A86]/5 text-[#0D4A86]"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-wider">{weight.name.split(" ")[0]} {weight.name.split(" ")[1]}</span>
                        <span className="text-[9px] mt-2 block opacity-70 font-light">{weight.desc}</span>
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
                  className="space-y-4"
                >
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#0D4A86] uppercase block mb-1">Step 03</span>
                    <h3 className="text-lg font-bold text-slate-800 font-serif">Select Color Dye</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-light mb-4">Choose from our curated reactive organic dye collection shades.</p>
                  </div>
                  <div className="grid grid-cols-4 gap-3 sm:gap-4">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSimColor(color.name)}
                        className={`flex flex-col items-center p-3.5 border transition cursor-pointer rounded-none text-center ${
                          simColor === color.name
                            ? "border-[#0D4A86] bg-[#0D4A86]/5 text-[#0D4A86]"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-400"
                        }`}
                      >
                        <span
                          className="w-7 h-7 rounded-full border border-slate-250/70 shadow-sm"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="mt-2 text-[9px] font-bold uppercase tracking-wider truncate w-full">
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
                  className="space-y-4"
                >
                  <div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#0D4A86] uppercase block mb-1">Step 04</span>
                    <h3 className="text-lg font-bold text-slate-800 font-serif">Review Specifications</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-light mb-4">Confirm your parameters before adding to your shopping cart.</p>
                  </div>

                  <div className="bg-[#FAF9F6] border border-slate-200/60 p-4 space-y-3">
                    <div className="flex justify-between text-xs border-b border-slate-200 pb-2">
                      <span className="text-slate-400 uppercase tracking-widest">Garment</span>
                      <span className="font-bold text-slate-800 uppercase tracking-wider">{simSilhouette}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-slate-200 pb-2">
                      <span className="text-slate-400 uppercase tracking-widest">Fabric Weight</span>
                      <span className="font-bold text-slate-800 uppercase tracking-wider">{simWeight}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-slate-200 pb-2">
                      <span className="text-slate-400 uppercase tracking-widest">Dye Shade</span>
                      <span className="font-bold text-slate-800 uppercase tracking-wider">{simColor}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-1">
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
          <div className="border-t border-slate-100 pt-6 mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
            {/* Back Button */}
            <button
              onClick={() => setConfigStep((prev) => Math.max(1, prev - 1))}
              disabled={configStep === 1}
              className="w-full sm:w-auto px-5 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold uppercase tracking-widest transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none rounded-none text-center"
            >
              ← Back
            </button>

            {/* Next / Add to Cart split controls */}
            {configStep < 4 ? (
              <button
                onClick={() => setConfigStep((prev) => Math.min(4, prev + 1))}
                className="w-full sm:w-auto px-6 py-3 bg-[#0D4A86] hover:bg-[#083A6B] text-white text-xs font-bold uppercase tracking-widest transition cursor-pointer rounded-none text-center"
              >
                Next Step →
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1 justify-end">
                <button
                  onClick={handleAddCustomMockupToCart}
                  className="flex-1 sm:flex-initial px-6 py-3 bg-slate-950 hover:bg-slate-850 text-white text-xs font-bold uppercase tracking-widest transition cursor-pointer rounded-none text-center"
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
  </div>
</section>
      



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
          message="Your session has expired due to 30 minutes of inactivity. Please login again."
          onConfirm={() => setShowExpiredModal(false)}
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