"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import Footer from "../components/Footer";
import Contact from "../components/Contact";

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {

  // ✅ FIX: always reset scroll when coming back
  useEffect(() => {
    const handleFocus = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.15),transparent_60%)]" />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center px-8 py-6 border-b border-white/10 backdrop-blur-lg bg-black/40 sticky top-0 z-50"
      >
        <h1 className="text-3xl font-bold text-yellow-400">THREADS</h1>

        {/* ✅ FIXED */}
         <a
          href="#Navbar"
          className="bg-yellow-400 text-black px-6 py-2 rounded-full font-semibold"
        >
          Home
        </a>

        <a
          href="#contact"
          className="bg-yellow-400 text-black px-6 py-2 rounded-full font-semibold"
        >
          Login
        </a>
      </motion.nav>

      {/* HERO */}
      <section className="text-center px-6 py-32">

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold leading-tight"
        >
          Premium Custom T-Shirts <br />
          <span className="text-yellow-400">Delivered Fast in Chennai</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.3 }}
          className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto"
        >
          Corporate events, college fests, startups — high-quality printing with fast delivery.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.5 }}
          className="mt-10 flex justify-center gap-6"
        >
          {/* ✅ FIXED */}
          <a
            href="#contact"
            className="bg-yellow-400 text-black px-10 py-4 rounded-full font-semibold shadow-lg"
          >
            Get Instant Quote
          </a>

          <a
            href="#services"
            className="border border-white/20 px-10 py-4 rounded-full hover:bg-white/10"
          >
            View Services
          </a>
        </motion.div>
      </section>

      {/* TRUST */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-center py-16 border-y border-white/10"
      >
        <p className="text-gray-400">
          Trusted by 100+ colleges, startups & companies in Chennai
        </p>
      </motion.section>

      {/* SERVICES */}
      <section id="services" className="px-8 py-24">
        <motion.h2 className="text-4xl font-bold text-center mb-16">
          Our Services
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            "Corporate T-Shirts",
            "College Fest Printing",
            "Startup Merchandise"
          ].map((title, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 border border-white/10 p-8 rounded-2xl"
            >
              <h3 className="text-xl font-bold text-yellow-400">
                {title}
              </h3>
              <p className="mt-4 text-gray-400">
                High-quality fabric, modern printing, fast delivery.
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-24">
        <h2 className="text-4xl font-bold">
          Ready to Print Your T-Shirts?
        </h2>

        <p className="mt-4 text-gray-400">
          Fill the form below to get instant quote
        </p>
      </section>

      {/* CONTACT */}
      <Contact />

      

      <Footer />
    </main>
  );
}