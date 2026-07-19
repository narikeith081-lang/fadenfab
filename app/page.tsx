"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Gallery from "../components/Gallery";
import Footer from "../components/Footer";
import Contact from "../components/Contact";
import Testimonials from "../components/Testimonials";
import { HiMenu, HiX } from "react-icons/hi";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Navbar from "@/components/Navbar";
import { getCatalog } from "@/lib/products";
import { supabase } from "@/lib/supabase";

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

  const router = useRouter();   // <-- HERE

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const targetId = hash.replace("#", "");
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Slideshow images matching catalog designs
  const slides = useMemo(() => [
    "/classicneverdies.png",
    "/findyourcanvas2.png",
    "/FutureVision_1.png"
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

  return (
<main className="min-h-screen overflow-x-hidden text-slate-900
bg-gradient-to-br
from-slate-50
via-blue-50
to-amber-50">
<div className="fixed inset-0 -z-10 overflow-hidden">

  <motion.div
    style={{ y: bgGlowY1 }}
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
    style={{ y: bgGlowY2 }}
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
    style={{ y: bgGlowY3 }}
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

      {/* ================= NAVBAR ================= */}
      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

{/* ================= HERO ================= */}
<section className="relative px-6 pt-40 pb-36 overflow-hidden">

  {/* Background Glow */}
  <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#0D4A86]/15 blur-[140px] rounded-full" />

  <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

    {/* ================= LEFT SIDE (STATIC) ================= */}
    <motion.div
      style={{ y: heroTextY }}
      className="text-center lg:text-left animate-fadeIn"
    >
      <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-slate-900">
        Premium Custom Apparel
        <br />
        <span className="text-[#0D4A86]">
          Crafted For Brands & Teams
        </span>
      </h1>

      <p className="mt-8 text-slate-600 text-lg md:text-xl leading-9 max-w-2xl mx-auto lg:mx-0">
        Custom T-Shirts • Hoodies • Corporate Wear
        <br />
        Premium Fabric | Bulk Orders | Fast Delivery Across India
      </p>

      {/* Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
        <button
          onClick={() =>
            document.getElementById("contact")?.scrollIntoView({
              behavior: "smooth",
            })
          }
          className="bg-[#0D4A86] hover:bg-[#083A6B] text-white px-10 py-4 rounded-full font-bold shadow-xl transition cursor-pointer"
        >
          Get Instant Quote
        </button>

        <button
          onClick={() => {
            document
              .getElementById("collection")
              ?.scrollIntoView({
                behavior: "smooth",
              });
          }}
          className="border border-slate-300 hover:bg-slate-100 bg-white px-10 py-4 rounded-full font-semibold transition cursor-pointer"
        >
          Explore Collection
        </button>
      </div>
    </motion.div>

    {/* ================= RIGHT SIDE (IMAGE SLIDESHOW) ================= */}
    <motion.div
      style={{ y: heroImageY }}
      className="flex flex-col items-center justify-center relative w-full group/slider"
    >
      {/* Left Navigation Arrow */}
      <button
        onClick={handlePrevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white text-slate-800 p-2.5 rounded-full border border-slate-200 shadow-md transition cursor-pointer opacity-0 group-hover/slider:opacity-100 flex items-center justify-center"
        aria-label="Previous Slide"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Right Navigation Arrow */}
      <button
        onClick={handleNextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/70 hover:bg-white text-slate-800 p-2.5 rounded-full border border-slate-200 shadow-md transition cursor-pointer opacity-0 group-hover/slider:opacity-100 flex items-center justify-center"
        aria-label="Next Slide"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="relative w-full max-w-xl h-[450px] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={slides[currentSlide]}
            alt="Custom Apparel Slide"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </AnimatePresence>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-6 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
              currentSlide === index ? "bg-[#0D4A86] w-5" : "bg-slate-300 hover:bg-slate-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </motion.div>

  </div>

</section>

      {/* ================= SERVICES ================= */}
<section
  id="services"
  className="relative px-6 py-28 scroll-mt-32 bg-gradient-to-b from-slate-50 via-blue-50 to-white overflow-hidden"
>
  {/* Background Glow */}
  <div className="absolute left-0 top-0 w-80 h-80 bg-[#0D4A86]/5 blur-[140px] rounded-full" />
  <div className="absolute right-0 bottom-0 w-80 h-80 bg-yellow-400/10 blur-[140px] rounded-full" />

  {/* Heading */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="text-center max-w-3xl mx-auto mb-20"
  >
    <span className="text-[#0D4A86] font-semibold tracking-[4px] uppercase">
      What We Offer
    </span>

    <h2 className="text-4xl md:text-6xl font-extrabold mt-4 text-slate-900">
      Premium Apparel
      <span className="text-[#0D4A86]"> Solutions</span>
    </h2>

    <p className="mt-6 text-lg text-slate-600 leading-8">
      From corporate branding to event merchandise,
      we deliver premium-quality custom apparel tailored
      for businesses, institutions, startups and teams.
    </p>
  </motion.div>

  {/* Cards */}
  <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">

    {[
      {
        title: "Corporate Uniforms",
        desc: "Professional branded apparel designed to elevate your company identity and team presence.",
        icon: "🏢",
      },
      {
        title: "College & Event Wear",
        desc: "Custom t-shirts and apparel for college fests, cultural events, sports meets and celebrations.",
        icon: "🎓",
      },
      {
        title: "Startup Merchandise",
        desc: "Premium branded merchandise that helps startups build recognition and create lasting impressions.",
        icon: "🚀",
      },
    ].map((service, i) => (
      <motion.div
        key={i}
        initial={{
          opacity: 0,
          y: 50,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{ once: true }}
        transition={{
          delay: i * 0.15,
          duration: 0.5,
        }}
        whileHover={{
          y: -10,
        }}
        className="group bg-white border border-slate-200 rounded-[32px] p-10 shadow-lg hover:shadow-2xl transition-all duration-500"
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-[#0D4A86]/10 flex items-center justify-center text-4xl group-hover:scale-110 transition">
          {service.icon}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-slate-900 mt-8">
          {service.title}
        </h3>

        {/* Desc */}
        <p className="text-slate-600 mt-5 leading-8">
          {service.desc}
        </p>

        {/* Bottom Line */}
        <div className="mt-8 h-[3px] w-12 bg-[#0D4A86] rounded-full group-hover:w-24 transition-all duration-500" />
      </motion.div>
    ))}
  </div>
</section>

{/* ================= COLLECTION ================= */}
<section
  id="collection"
  className="relative py-28 scroll-mt-32 bg-gradient-to-b from-slate-100 via-white to-slate-50 overflow-hidden"
>

  {/* Background Glow */}
  <div className="absolute top-0 right-0 w-96 h-96 bg-[#0D4A86]/2 blur-[160px] rounded-full" />
  <div className="absolute top-0 left-0 w-96 h-96 bg-[#0D4A86]/2 blur-[160px] rounded-full" />

  <div className="max-w-7xl mx-auto px-6">

    {/* Section Heading */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center max-w-3xl mx-auto mb-20"
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
        designed for corporates, colleges, startups,
        events and growing brands.
      </p>
    </motion.div>

    {/* Gallery Component */}
    <Gallery />

  </div>

</section>
      
  {/* ================= WHY US ================= */}
<section
  id="why"
  className="relative px-6 py-28 scroll-mt-32 overflow-hidden bg-gradient-to-b from-white to-slate-50"
>

  {/* Background Glow */}
  <div className="absolute left-0 top-20 w-80 h-80 bg-[#0D4A86]/5 blur-[140px] rounded-full" />
  <div className="absolute right-0 bottom-0 w-80 h-80 bg-yellow-400/10 blur-[140px] rounded-full" />

  <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

    {/* ================= LEFT CONTENT ================= */}
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >

      <span className="inline-block bg-[#0D4A86]/10 text-[#0D4A86] px-4 py-2 rounded-full text-sm font-semibold mb-6">
        WHY FADENFAB
      </span>

      <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
        Why Choose
        <span className="text-[#0D4A86]">
          {" "}FADENFAB?
        </span>
      </h2>

      <p className="text-slate-600 mt-8 leading-8 text-lg">
        We deliver premium-quality custom apparel with
        modern printing technology, superior fabrics,
        affordable bulk pricing, and fast delivery
        across India.
      </p>

      <div className="mt-10 grid gap-5">

        {[
          "Premium Quality Fabric",
          "Fast Delivery Across India",
          "Affordable Bulk Pricing",
          "DTF, Screen & Embroidery Printing",
          "Dedicated Customer Support",
          "Custom Branding Solutions",
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ x: 5 }}
            className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all"
          >

            <div className="w-10 h-10 rounded-full bg-[#0D4A86]/10 flex items-center justify-center text-[#0D4A86] font-bold">
              ✓
            </div>

            <p className="text-slate-700 font-medium">
              {item}
            </p>

          </motion.div>
        ))}

      </div>

    </motion.div>

    {/* ================= RIGHT CARD ================= */}
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{
        y: -10,
      }}
      className="relative"
    >

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl p-12 text-center">

        <div className="text-8xl">
          👕
        </div>

        <h3 className="text-3xl font-bold mt-8 text-[#0D4A86]">
          Premium Printing Solutions
        </h3>

        <p className="text-slate-600 mt-6 leading-8">
          From corporate uniforms and event
          merchandise to startup branding and
          college apparel, we bring your designs
          to life with precision and quality.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-10">

          <div>
            <h4 className="text-3xl font-bold text-[#0D4A86]">
              100%
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              Quality
            </p>
          </div>

          <div>
            <h4 className="text-3xl font-bold text-[#0D4A86]">
              Fast
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              Delivery
            </p>
          </div>

          <div>
            <h4 className="text-3xl font-bold text-[#0D4A86]">
              Bulk
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              Orders
            </p>
          </div>

        </div>

      </div>

    </motion.div>

  </div>

</section>
{/* ================= CTA ================= */}
<section className="relative px-6 py-32 overflow-hidden bg-gradient-to-b from-slate-50 to-white">

  {/* Background Glow */}
  <div className="absolute left-0 top-0 w-96 h-96 bg-[#0D4A86]/10 blur-[150px] rounded-full" />
  <div className="absolute right-0 bottom-0 w-96 h-96 bg-yellow-400/10 blur-[150px] rounded-full" />

  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    whileHover={{ y: -5 }}
    className="relative max-w-5xl mx-auto bg-white rounded-[40px] border border-slate-200 shadow-2xl p-12 md:p-16 text-center"
  >

    <span className="inline-block px-5 py-2 rounded-full bg-[#0D4A86]/10 text-[#0D4A86] font-semibold text-sm mb-6">
      BULK ORDERS • CORPORATE • EVENTS
    </span>

    <h2 className="text-4xl md:text-6xl font-extrabold leading-tight text-slate-900">
      Ready to Create Your
      <span className="text-[#0D4A86]">
        {" "}Custom Apparel?
      </span>
    </h2>

    <p className="text-slate-600 text-lg mt-8 max-w-3xl mx-auto leading-8">
      Premium T-Shirts, Hoodies, Polo Shirts and
      Custom Merchandise tailored for your brand,
      team, startup, college fest or corporate event.
    </p>

    {/* Quick Stats */}
    <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto mt-10">

      <div>
        <h3 className="text-3xl font-bold text-[#0D4A86]">
          20+
        </h3>
        <p className="text-sm text-slate-500">
          Minimum Order
        </p>
      </div>

      <div>
        <h3 className="text-3xl font-bold text-[#0D4A86]">
          Fast
        </h3>
        <p className="text-sm text-slate-500">
          Delivery
        </p>
      </div>

      <div>
        <h3 className="text-3xl font-bold text-[#0D4A86]">
          Premium
        </h3>
        <p className="text-sm text-slate-500">
          Quality
        </p>
      </div>

    </div>

    {/* CTA Buttons */}
    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">

      <button
        onClick={() => {
          document
            .getElementById("contact")
            ?.scrollIntoView({
              behavior: "smooth",
            });
        }}
        className="bg-[#0D4A86] hover:bg-[#083A6B] text-white px-10 py-4 rounded-full font-bold shadow-xl transition"
      >
        Get Instant Quote
      </button>

      <button
        onClick={() => {
          document
            .getElementById("collection")
            ?.scrollIntoView({
              behavior: "smooth",
            });
        }}
        className="border border-slate-300 hover:bg-slate-100 px-10 py-4 rounded-full font-semibold transition"
      >
        View Collection
      </button>

    </div>

    <p className="mt-8 text-sm text-slate-500">
      Trusted for Corporate Teams • Startups • Colleges • Events
    </p>

  </motion.div>

</section>

{/* ================= TESTIMONIALS ================= */}
<Testimonials />

{/* ================= CONTACT ================= */}
<section
  id="contact"
  className="scroll-mt-32"
>
  <Contact />
</section>

{/* ================= BRAND SIGNATURE ================= */}
<section className="bg-slate-50 py-20 px-6 border-t border-slate-200">

  <div className="max-w-4xl mx-auto text-center">

    <p className="text-[#0D4A86] font-semibold tracking-[0.25em] uppercase">
      FADENFAB
    </p>

    <h2 className="mt-4 text-4xl md:text-5xl font-bold text-slate-900">
      Crafted for Brands.
      Designed for Impact.
    </h2>

    <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-8">
      Premium custom apparel solutions for startups,
      corporates, colleges and events across India.
    </p>

    <div className="flex flex-wrap justify-center gap-8 mt-10">

      <div>
        <h3 className="text-2xl font-bold text-[#0D4A86]">
          Premium
        </h3>
        <p className="text-slate-500">
          Fabric Quality
        </p>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-[#0D4A86]">
          Fast
        </h3>
        <p className="text-slate-500">
          Delivery
        </p>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-[#0D4A86]">
          20+
        </h3>
        <p className="text-slate-500">
          Minimum Order
        </p>
      </div>

    </div>

    <p className="mt-12 text-sm text-slate-400 italic">
      Crafted with Vision by FADENFAB
    </p>

  </div>

</section>

{/* ================= FLOATING WHATSAPP ================= */}
<a
  href="https://wa.me/916374998042"
  target="_blank"
  rel="noopener noreferrer"
  className={`fixed bottom-6 right-6 transition-all duration-300 ${
    mobileMenuOpen
      ? "opacity-0 pointer-events-none"
      : "opacity-100"
  } z-40 bg-green-500 hover:bg-green-400 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl text-3xl`}
>
  💬
</a>

{/* ================= FOOTER ================= */}
<Footer />

    </main>
  );
}