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
  const [errorMessage, setErrorMessage] = useState("");

  // ✅ Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");

    // ✅ Phone validation
    if (!/^\d{10}$/.test(form.phone)) {
      setErrorMessage("Enter valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      // ✅ Save lead to database
const res = await fetch("/api/contact", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(form),
});

const data = await res.json();

if (!res.ok) {
  alert(data.error || "Something went wrong");
  setLoading(false);
  return;
}

      // ✅ Show success popup
      setSuccess(true);

     

      // ✅ Reset form
      setForm({
        name: "",
        phone: "",
        email: "",
        company: "",
        quantity: "",
        message: "",
      });

      // ✅ Auto close popup
      setTimeout(() => {
        setSuccess(false);
      }, 3500);

    } catch (err) {
      console.error(err);
      setErrorMessage("Server error occurred");
    }

    setLoading(false);
  };

  return (
    <section
      id="contact"
      className="bg-black text-white px-6 md:px-8 py-20"
    >
      {/* Heading */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold">
          Get a Quote
        </h2>

        <p className="text-gray-400 mt-4">
          Bulk T-shirt printing for startups,
          colleges & events
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto grid gap-5"
      >
        {/* Name */}
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your Name"
          required
          className="p-4 rounded-xl bg-gray-900 border border-white/10 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
        />

        {/* Phone */}
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");

            setForm((prev) => ({
              ...prev,
              phone: value,
            }));
          }}
          placeholder="Phone Number"
          required
          maxLength={10}
          className="p-4 rounded-xl bg-gray-900 border border-white/10 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email (Optional)"
          className="p-4 rounded-xl bg-gray-900 border border-white/10 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
        />

        {/* Company */}
        <input
          type="text"
          name="company"
          value={form.company}
          onChange={handleChange}
          placeholder="Company / College Name"
          required
          className="p-4 rounded-xl bg-gray-900 border border-white/10 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
        />

        {/* Quantity */}
<div>
  <input
    type="number"
    name="quantity"
    value={form.quantity}
    onChange={handleChange}
    placeholder="Minimum Order Quantity (20)"
    min="20"
    required
    className={`w-full p-4 rounded-xl bg-gray-900 border outline-none transition ${
      form.quantity && Number(form.quantity) < 20
        ? "border-red-500 focus:ring-2 focus:ring-red-500"
        : "border-white/10 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
    }`}
  />

  {form.quantity && Number(form.quantity) < 20 && (
    <p className="mt-2 text-sm text-red-400">
      Minimum order quantity is 20 pieces.
    </p>
  )}
</div>

        {/* Message */}
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Requirement"
          required
          rows={5}
          className="p-4 rounded-xl bg-gray-900 border border-white/10 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition resize-none"
        />

        {/* Error */}
        {errorMessage && (
          <p className="text-red-400 text-sm">
            {errorMessage}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-400 hover:bg-yellow-300 text-black py-4 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Submit Inquiry"}
        </button>
      </form>

      {/* Success Popup */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-6"
          >
            <motion.div
              initial={{
                scale: 0.7,
                opacity: 0,
                y: 40,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
              }}
              exit={{
                scale: 0.7,
                opacity: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 120,
              }}
              className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-xl p-10 rounded-3xl text-center shadow-2xl max-w-md w-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-6xl mb-5"
              >
                🎉
              </motion.div>

              <h2 className="text-3xl font-bold text-yellow-400">
                Inquiry Sent
              </h2>

              <p className="text-gray-300 mt-3">
                Our team will contact you shortly.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}