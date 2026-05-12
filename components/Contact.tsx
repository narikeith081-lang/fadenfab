"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    quantity: "",
    message: "",
  });

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ extra phone validation safety
    if (form.phone.length !== 10) {
      alert("Enter valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        alert("Something went wrong ❌");
        setLoading(false);
        return;
      }

      // ✅ show popup
      setSuccess(true);

      // ✅ WhatsApp message
      const message = `New Inquiry - THREADS

Name: ${form.name}
Phone: ${form.phone}
Email: ${form.email || "N/A"}
Company: ${form.company}
Quantity: ${form.quantity}
Requirement: ${form.message}
`;

      const whatsappURL = `https://wa.me/919080383384?text=${encodeURIComponent(
        message
      )}`;

      // ✅ open after delay (important UX fix)
      setTimeout(() => {
        window.open(whatsappURL, "_blank");
      }, 1200);

      // ✅ reset form
      setForm({
        name: "",
        phone: "",
        email: "",
        company: "",
        quantity: "",
        message: "",
      });

      // ✅ auto close popup
      setTimeout(() => setSuccess(false), 3500);

    } catch (err) {
      console.error(err);
      alert("Server error ❌");
    }

    setLoading(false);
  };

  return (
    <section id="contact" className="bg-black text-white px-8 py-20">
      {/* 🔥 IMPORTANT: id="contact" added */}

      <h2 className="text-4xl font-bold text-center mb-12">
        Get a Quote
      </h2>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto grid gap-6">

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your Name"
          required
          className="p-4 rounded-lg bg-gray-900 focus:ring-2 focus:ring-yellow-400 outline-none"
        />

        <input
          name="phone"
          value={form.phone}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setForm((prev) => ({ ...prev, phone: value }));
          }}
          placeholder="Phone Number"
          required
          maxLength={10}
          className="p-4 rounded-lg bg-gray-900 focus:ring-2 focus:ring-yellow-400 outline-none"
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email (Optional)"
          className="p-4 rounded-lg bg-gray-900 focus:ring-2 focus:ring-yellow-400 outline-none"
        />

        <input
          name="company"
          value={form.company}
          onChange={handleChange}
          placeholder="Company Name"
          required
          className="p-4 rounded-lg bg-gray-900 focus:ring-2 focus:ring-yellow-400 outline-none"
        />

        <input
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          placeholder="Quantity"
          required
          className="p-4 rounded-lg bg-gray-900 focus:ring-2 focus:ring-yellow-400 outline-none"
        />

        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Requirement"
          required
          className="p-4 rounded-lg bg-gray-900 focus:ring-2 focus:ring-yellow-400 outline-none"
        />

        <button
          disabled={loading}
          className="bg-yellow-400 text-black py-4 rounded-lg font-bold hover:bg-yellow-300 transition disabled:opacity-50"
        >
          {loading ? "Sending..." : "Submit Inquiry"}
        </button>
      </form>

      {/* 🎉 SUCCESS POPUP */}
      <AnimatePresence>
        {success && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-lg z-50">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="bg-white/10 border border-white/20 backdrop-blur-xl p-10 rounded-3xl text-center shadow-2xl"
            >
              <div className="text-6xl mb-4">🎉</div>

              <h2 className="text-2xl font-bold text-yellow-400">
                Inquiry Sent Successfully
              </h2>

              <p className="text-gray-300 mt-2">
                Opening WhatsApp...
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}