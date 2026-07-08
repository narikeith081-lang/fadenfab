
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-20">

      <div className="max-w-7xl mx-auto px-6 py-14">

        {/* ================= TOP ================= */}
        <div className="grid md:grid-cols-4 gap-10">

          {/* BRAND */}
          <div>

            <motion.h2
              whileHover={{ scale: 1.03 }}
              className="text-3xl font-extrabold text-[#0D4A86]"
            >
              FADENFAB
            </motion.h2>

            <p className="text-gray-400 mt-4 leading-7">
              Premium custom t-shirt printing
              for startups, colleges,
              corporate events & brands
              across Chennai.
            </p>

          </div>

          {/* QUICK LINKS */}
          <div>

            <h3 className="text-lg font-bold mb-5">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3 text-gray-400">

              <a
                href="/"
                className="hover:text-[#0D4A86] transition"
              >
                Home
              </a>

              <a
                href="#services"
                className="hover:text-[#0D4A86] transition"
              >
                Services
              </a>

              <a
                href="#contact"
                className="hover:text-[#0D4A86] transition"
              >
                Contact
              </a>

<button
  onClick={() => {
    window.location.href = "/login";
  }}
  className="text-left font-normal text-gray-400 hover:text-[#0D4A86] transition"
>
  Admin
</button>

            </div>

          </div>

          {/* SERVICES */}
          <div>

            <h3 className="text-lg font-bold mb-5">
              Services
            </h3>

            <div className="flex flex-col gap-3 text-gray-400">

              <p>Corporate T-Shirts</p>

              <p>College Fest Printing</p>

              <p>Startup Merchandise</p>

              <p>Custom Hoodie Printing</p>

            </div>

          </div>

          {/* CONTACT */}
          <div>

            <h3 className="text-lg font-bold mb-5">
              Contact
            </h3>

            <div className="flex flex-col gap-3 text-gray-400">

              <a
                href="tel:+916374998042"
                className="hover:text-[#0D4A86] transition"
              >
                📞 +91 63749 98042
              </a>

              <a
                href="mailto:fadenfab22@gmail.com"
                className="hover:text-[#0D4A86] transition"
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

  <p className="text-gray-500 text-sm">
    © 2026 FADENFAB. All rights reserved.
  </p>

  <div className="flex items-center gap-4 text-sm">

    <Link
      href="/privacy-policy"
      className="text-gray-500 hover:text-[#0D4A86] transition duration-300"
    >
      Privacy Policy
    </Link>

    <span className="text-gray-300">|</span>

    <Link
      href="/terms"
      className="text-gray-500 hover:text-[#0D4A86] transition duration-300"
    >
      Terms &amp; Conditions
    </Link>

  </div>

</div>

      </div>

    </footer>
  );
}