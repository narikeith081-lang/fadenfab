
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-slate-950 text-white border-t border-white/10 mt-20">

      <div className="max-w-7xl mx-auto px-6 py-14">

        {/* ================= TOP ================= */}
        <div className="grid md:grid-cols-4 gap-10">

          {/* BRAND */}
          <div>
            <motion.h2
              whileHover={{ scale: 1.02 }}
              className="text-2xl font-extrabold text-white tracking-widest font-serif"
            >
              FADENFAB
            </motion.h2>

            <p className="text-gray-400 mt-4 leading-7 text-sm font-light">
              Premium custom apparel for startups, corporate commissions, and academic institutions across India.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase mb-5 text-white">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3 text-sm text-gray-400 font-light">
              <a
                href="/"
                className="hover:text-white transition"
              >
                Home
              </a>

              <a
                href="#services"
                className="hover:text-white transition"
              >
                Custom Design
              </a>

              <a
                href="#contact"
                className="hover:text-white transition"
              >
                Contact
              </a>

              <button
                onClick={() => {
                  window.location.href = "/login";
                }}
                className="text-left font-light text-gray-400 hover:text-white transition cursor-pointer"
              >
                Admin
              </button>
            </div>
          </div>

          {/* SERVICES */}
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase mb-5 text-white">
              Custom Products
            </h3>

            <div className="flex flex-col gap-3 text-sm text-gray-400 font-light">
              <p>Oversized T-Shirts</p>
              <p>Premium Hoodies</p>
              <p>Corporate Uniforms</p>
              <p>Event Coordinate Wear</p>
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-sm font-bold tracking-widest uppercase mb-5 text-white">
              Inquiries
            </h3>

            <div className="flex flex-col gap-3 text-sm text-gray-400 font-light">
              <a
                href="tel:+916374998042"
                className="hover:text-white transition"
              >
                📞 +91 63749 98042
              </a>

              <a
                href="mailto:fadenfab22@gmail.com"
                className="hover:text-white transition"
              >
                ✉️ fadenfab22@gmail.com
              </a>

              <a
                href="https://wa.me/916374998042"
                target="_blank"
                className="hover:text-green-400 transition"
              >
                💬 WhatsApp Chat
              </a>

              <p>
                📍 Chennai, Tamil Nadu
              </p>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM ================= */}
{/* ================= BOTTOM ================= */}
<div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
  <p className="text-gray-500 text-sm font-light">
    © 2026 FADENFAB. All rights reserved.
  </p>

  <div className="flex items-center gap-4 text-sm font-light">
    <Link
      href="/privacy-policy"
      className="text-gray-500 hover:text-white transition duration-300"
    >
      Privacy Policy
    </Link>
    <span className="text-gray-700">|</span>
    <Link
      href="/terms"
      className="text-gray-500 hover:text-white transition duration-300"
    >
      Terms &amp; Conditions
    </Link>
  </div>
</div>

      </div>

    </footer>
  );
}