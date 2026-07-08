"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Gallery from "../components/Gallery";
import Footer from "../components/Footer";
import Contact from "../components/Contact";
import Testimonials from "../components/Testimonials";
import { HiMenu, HiX } from "react-icons/hi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

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
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
<main className="min-h-screen overflow-x-hidden text-slate-900
bg-gradient-to-br
from-slate-50
via-blue-50
to-amber-50">
<div className="fixed inset-0 -z-10 overflow-hidden">

  <div className="
    absolute
    -top-40
    -left-32
    w-[550px]
    h-[550px]
    bg-blue-500/10
    rounded-full
    blur-[140px]
  " />

  <div className="
    absolute
    top-1/3
    -right-32
    w-[500px]
    h-[500px]
    bg-yellow-400/10
    rounded-full
    blur-[140px]
  " />

  <div className="
    absolute
    bottom-0
    left-1/3
    w-[450px]
    h-[450px]
    bg-indigo-500/10
    rounded-full
    blur-[140px]
  " />

</div>
  
      {/* ================= BACKGROUND ================= */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.12),transparent_60%)]" />

      {/* ================= NAVBAR ================= */}
<motion.nav
  initial={{ y: -80, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.5 }}
  className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200"
>
  <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

    {/* Logo */}

    <button
      onClick={() => (window.location.href = "/")}
      className="text-3xl md:text-4xl font-bold tracking-wide text-[#0D4A86]"
      style={{
        fontFamily:
          '"American Typewriter","American Typewriter Std",serif',
      }}
    >
      FADENFAB
    </button>

    {/* Desktop Menu */}

    <div className="hidden md:flex items-center gap-8 text-lg font-medium">

  <button
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    className="hover:text-[#0D4A86] transition"
  >
    Home
  </button>

  <button
    onClick={() =>
      document.getElementById("services")?.scrollIntoView({
        behavior: "smooth",
      })
    }
    className="hover:text-[#0D4A86] transition"
  >
    Services
  </button>

  <button
    onClick={() =>
      document.getElementById("collection")?.scrollIntoView({
        behavior: "smooth",
      })
    }
    className="hover:text-[#0D4A86] transition"
  >
    Collection
  </button>

  <button
    onClick={() =>
      document.getElementById("why")?.scrollIntoView({
        behavior: "smooth",
      })
    }
    className="hover:text-[#0D4A86] transition"
  >
    Why Us
  </button>

  <button
    onClick={() =>
      document.getElementById("contact")?.scrollIntoView({
        behavior: "smooth",
      })
    }
    className="hover:text-[#0D4A86] transition"
  >
    Contact
  </button>
 
  <button
    onClick={() => router.push("/userlogin")}
    className="bg-[#0D4A86] hover:bg-[#083A6B] text-white px-6 py-2 rounded-full font-semibold transition"
  >
    Login
  </button>


</div>

    {/* Mobile */}

    <button
      className="md:hidden text-3xl text-[#0D4A86]"
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    >
      {mobileMenuOpen ? <HiX /> : <HiMenu />}
    </button>

  </div>

  <AnimatePresence>
    {mobileMenuOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40"
        />

        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 right-0 h-screen w-72 bg-white shadow-2xl z-50"
        >
          <div className="flex items-center justify-between p-6 border-b">

            <h2 className="text-2xl font-bold text-[#0D4A86]">
              FADENFAB
            </h2>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-3xl"
            >
              ×
            </button>

          </div>

          <div className="flex flex-col mt-8">

            {[
  ["Home", "home"],
  ["Services", "services"],
  ["Collection", "collection"],
  ["Why Us", "why"],
  ["Contact", "contact"],
].map(([label, id]) => (
  <button
    key={id}
    onClick={() => {

      if (id === "home") {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
        });
      }

      setMobileMenuOpen(false);
    }}
    className="text-left px-8 py-5 hover:bg-[#0D4A86] hover:text-white transition"
  >
    {label}
  </button>
))}

            <button
              onClick={() => {
  router.push("/userlogin");
  setMobileMenuOpen(false);
}}
              className="text-left px-8 py-5 hover:bg-[#0D4A86] hover:text-white"
            >
              Login
            </button>

          </div>

          <div className="absolute bottom-8 left-0 w-full px-6">

<button
  onClick={() => {
    router.push("/userlogin");
    setMobileMenuOpen(false);
  }}
  className="w-full bg-[#0D4A86] text-white py-4 rounded-full font-bold"
>
  Login
</button>

          </div>

        </motion.div>
      </>
    )}
  </AnimatePresence>
</motion.nav>

{/* ================= HERO ================= */}
<section className="relative px-6 pt-40 pb-36 overflow-hidden">

  {/* Background Glow */}
  <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#0D4A86]/15 blur-[140px] rounded-full" />

  <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

    {/* ================= LEFT SIDE ================= */}
    <div className="text-center lg:text-left">

      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.8 }}
        className="text-3xl md:text-4xl font-extrabold leading-tight text-slate-900"
      >
        Premium Custom Apparel
        <br />

        <span className="text-[#0D4A86]">
          Crafted For Brands & Teams
        </span>
      </motion.h1>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.3 }}
        className="mt-8 text-slate-600 text-lg md:text-xl leading-9 max-w-2xl mx-auto lg:mx-0"
      >
        Custom T-Shirts • Hoodies • Corporate Wear
        <br />
        Premium Fabric | Bulk Orders | Fast Delivery Across India
      </motion.p>

      {/* Buttons */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.5 }}
        className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
      >

        <button
          onClick={() =>
            document.getElementById("contact")?.scrollIntoView({
              behavior: "smooth",
            })
          }
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
        Explore Collection
      </button>
      </motion.div>

    </div>

    {/* ================= RIGHT SIDE ================= */}
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1 }}
      className="flex justify-center"
    >
     <img
  src="/classicneverdies.png"
  alt="Custom Apparel"
  className="w-full max-w-xl drop-shadow-2xl"
/>
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