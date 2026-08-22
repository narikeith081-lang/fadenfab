"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function ShippingPolicyPage() {
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
              Shipping Policy
            </h1>
          </div>

          <p className="text-slate-500 mb-10 text-sm">
            Last Updated: August 2026
          </p>

          <div className="space-y-10 text-slate-700 leading-8 text-sm md:text-base">
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                1. Order Dispatch & Processing
              </h2>
              <p>
                Since FADENFAB specializes in high-volume custom corporate, collegiate, and brand apparel collections, each garment is customized and quality-inspected individually. 
                Standard production and dispatch timeline is <strong>7 to 10 business days</strong> from the date of advance payment and final mockup/sizing approval.
              </p>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                2. Delivery Timelines
              </h2>
              <p>
                Once dispatched from our facility, delivery times vary by destination across India:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li><strong>Metro Cities (Chennai, Bangalore, Mumbai, Delhi, etc.):</strong> 2 to 3 business days.</li>
                <li><strong>Rest of India:</strong> 4 to 6 business days.</li>
                <li><strong>Remote Locations:</strong> Up to 7 to 9 business days.</li>
              </ul>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                3. Shipping Charges
              </h2>
              <p>
                We offer <strong>Complimentary Free Shipping</strong> on all custom orders over <strong>₹5,000</strong>. 
                For orders below this value, a flat shipping and handling fee of <strong>₹150</strong> will be charged at checkout.
              </p>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                4. Courier & Tracking Partners
              </h2>
              <p>
                We partner with leading national courier networks (Blue Dart, Delhivery, DTDC, and Express Cargo) to ensure safe transit of your apparel crates. 
                Tracking links and details will be populated in your Customer Portal and sent via email/SMS as soon as dispatch occurs.
              </p>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                5. Transit Damage & Issues
              </h2>
              <p>
                All consignments are packed in robust, waterproof cargo containers. If you receive crates that appear visibly damaged or tampered with during transit, please take photographs immediately and report it to our support team within <strong>24 hours</strong> of receipt.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
