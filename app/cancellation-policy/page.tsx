"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function CancellationPolicyPage() {
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
              Cancellation Policy
            </h1>
          </div>

          <p className="text-slate-500 mb-10 text-sm">
            Last Updated: August 2026
          </p>

          <div className="space-y-10 text-slate-700 leading-8 text-sm md:text-base">
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                1. Order Cancellation Grace Window
              </h2>
              <p>
                Standard product catalog orders or custom design orders may be cancelled within <strong>12 hours</strong> of order placement or payment confirmation. 
                Please contact our customer support immediately at <strong>+91 63749 98042</strong> or email <strong>fadenfab22@gmail.com</strong> during this window.
              </p>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                2. Post-Grace Window & Custom Orders
              </h2>
              <p>
                Once an order has passed the 12-hour grace period, or once the **pre-production mockup/tech pack has been approved** by the customer:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Production materials (fabric lots, zippers, printing dyes) are custom-procured and scheduled for cutting and printing.</li>
                <li><strong>No cancellations or changes can be accepted</strong> after this point, as the custom items cannot be resold or re-stocked.</li>
              </ul>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                3. Cancellation Process & Refunds
              </h2>
              <p>
                If a valid cancellation request is received and approved within the grace window, we will cancel the order immediately. 
                Any advance payments made will be refunded to your original payment method within <strong>3 to 5 business days</strong> from the cancellation approval.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
