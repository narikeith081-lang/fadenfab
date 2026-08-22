"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function RefundPolicyPage() {
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
              Return & Refund Policy
            </h1>
          </div>

          <p className="text-slate-500 mb-10 text-sm">
            Last Updated: August 2026
          </p>

          <div className="space-y-10 text-slate-700 leading-8 text-sm md:text-base">
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                1. Custom Manufactured Apparel Return Clause
              </h2>
              <p>
                Since FADENFAB manufactures custom, made-to-order apparel customized with client logos, specific print runs, coordinates, and custom fitting specifications, <strong>we do not accept returns or exchanges for change of mind or subjective preferences.</strong>
              </p>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                2. Manufacturing Defects & Printing Errors
              </h2>
              <p>
                We do accept full returns, exchanges, or refunds in the following scenarios:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Material fabric defects (e.g. tears, stains, weave stitching errors).</li>
                <li>Incorrect print execution or color mismatch deviating from the approved mockup layout.</li>
                <li>Incorrect sizes or silhouettes sent compared to the order sheet coordinates.</li>
              </ul>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                3. Reporting Timeframe
              </h2>
              <p>
                Any issues, quantity mismatches, or defects must be reported to FADENFAB within <strong>48 hours of delivery receipt</strong>. 
                Please email us at <strong>fadenfab22@gmail.com</strong> with your order invoice number, description of the issue, and photos/videos showing the defect.
              </p>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                4. Resolution Options
              </h2>
              <p>
                Upon verification of the defect, FADENFAB will offer one of the following options:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li><strong>Replacement:</strong> Free production and express shipping of replacements for the defective items.</li>
                <li><strong>Refund:</strong> A refund processed directly back to your original source payment method (bank account, card, or wallet) within <strong>5 to 7 business days</strong>.</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
