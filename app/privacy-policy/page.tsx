"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow pt-28 md:pt-32 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/");
                }
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer text-slate-650 hover:text-slate-900 shadow-sm shrink-0"
              title="Go Back"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0D4A86] font-serif">
              Privacy Policy
            </h1>
          </div>

          <p className="text-slate-500 mb-10 text-sm">
            Last Updated: June 2026
          </p>

          <div className="space-y-10 text-slate-700 leading-8 text-sm md:text-base">

          <section>
            <h2 className="text-2xl font-semibold text-black mb-3">
              1. Introduction
            </h2>

            <p>
              FADENFAB values your privacy. This Privacy Policy explains
              how we collect, use, and protect your personal information
              when you interact with our website or contact us regarding
              our products and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-black mb-3">
              2. Information We Collect
            </h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>Name</li>
              <li>Email Address</li>
              <li>Phone Number</li>
              <li>Company Name (if applicable)</li>
              <li>Shipping Information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-black mb-3">
              3. How We Use Your Information
            </h2>

            <ul className="list-disc pl-6 space-y-2">
              <li>Respond to enquiries</li>
              <li>Provide quotations</li>
              <li>Process custom apparel orders</li>
              <li>Customer support</li>
              <li>Improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-black mb-3">
              4. Data Protection
            </h2>

            <p>
              We take appropriate technical and organizational measures to
              safeguard your personal information against unauthorized
              access, disclosure, or misuse.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-black mb-3">
              5. Third-Party Services
            </h2>

            <p>
              We may use trusted third-party services such as payment
              gateways, WhatsApp Business, Google Analytics, or courier
              partners to deliver our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-black mb-3">
              6. Contact Us
            </h2>

            <p>Email: fadenfab22@gmail.com</p>
            <p>Phone: +91 63749 98042</p>
            <p>Location: Chennai, Tamil Nadu, India</p>
          </section>

        </div>
      </div>
    </main>
    <Footer />
  </div>
  );
}