"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function TermsPage() {
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
              className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer text-slate-655 hover:text-slate-900 shadow-sm shrink-0"
              title="Go Back"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0D4A86] font-serif">
              Terms & Conditions
            </h1>
          </div>

          <p className="text-slate-500 mb-10 text-sm">
            Last Updated: July 2026
          </p>

          <div className="space-y-10 text-slate-700 leading-8 text-sm md:text-base">

          <section>
            <h2 className="text-2xl font-semibold text-black mb-3">
              1. Orders
            </h2>

            <p>
              All custom apparel orders are confirmed only after design
              approval and payment confirmation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-black mb-3">
              2. Payments
            </h2>

            <p>
              Advance payment may be required before production begins.
              Remaining payment should be completed before dispatch unless
              otherwise agreed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-black mb-3">
              3. Custom Designs
            </h2>

            <p>
              Customers are responsible for ensuring they have permission
              to use logos, trademarks, artwork, or copyrighted content
              submitted for printing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-black mb-3">
              4. Returns & Refunds
            </h2>

            <p>
              Since most of our products are custom-made, returns or
              refunds are accepted only for manufacturing defects or
              incorrect products supplied by FADENFAB.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-black mb-3">
              5. Delivery
            </h2>

            <p>
              Estimated delivery dates are provided for convenience.
              Delays caused by logistics partners or unforeseen events are
              beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-black mb-3">
              6. Intellectual Property
            </h2>

            <p>
              All FADENFAB logos, branding, website content, and original
              designs remain the intellectual property of FADENFAB.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-black mb-3">
              7. Contact
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