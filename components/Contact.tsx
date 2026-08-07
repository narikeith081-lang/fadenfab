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
  setErrorMessage(data.error || "Something went wrong");
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
      className="bg-slate-950 text-white px-6 md:px-8 py-20 border-t border-slate-900"
    >
      {/* Heading */}
      <div id="contact" className="text-center mb-16 scroll-mt-24">
        <span className="text-slate-400 text-xs font-bold tracking-[0.3em] uppercase block mb-3">
          Commissions
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold text-white" style={{ fontFamily: '"American Typewriter","American Typewriter Std",serif' }}>
          Request a Custom Quote
        </h2>

        <p className="text-slate-400 text-sm mt-4 max-w-xl mx-auto leading-relaxed font-light">
          Fill out the brief below to receive bespoke pricing and fabric recommendations for your custom program.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto grid gap-6"
      >
        {/* Name */}
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          required
          className="p-4 rounded-none bg-slate-900/60 border border-slate-800 focus:border-white outline-none transition text-sm placeholder-slate-500 font-light"
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
          className="p-4 rounded-none bg-slate-900/60 border border-slate-800 focus:border-white outline-none transition text-sm placeholder-slate-500 font-light"
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email Address (Optional)"
          className="p-4 rounded-none bg-slate-900/60 border border-slate-800 focus:border-white outline-none transition text-sm placeholder-slate-500 font-light"
        />

        {/* Company */}
        <input
          type="text"
          name="company"
          value={form.company}
          onChange={handleChange}
          placeholder="Company or Organization Name"
          required
          className="p-4 rounded-none bg-slate-900/60 border border-slate-800 focus:border-white outline-none transition text-sm placeholder-slate-500 font-light"
        />

        {/* Quantity */}
        <div>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Estimated Quantity (Minimum 20)"
            min="20"
            required
            className={`w-full p-4 rounded-none bg-slate-900/60 border outline-none transition text-sm placeholder-slate-500 font-light ${
              form.quantity && Number(form.quantity) < 20
                ? "border-red-500"
                : "border-slate-800 focus:border-white"
            }`}
          />

          {form.quantity && Number(form.quantity) < 20 && (
            <p className="mt-2 text-xs text-red-400 font-light">
              Minimum order quantity is 20 pieces.
            </p>
          )}
        </div>

        {/* Message */}
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Describe your design concepts, fabric preferences, or deadline..."
          required
          rows={5}
          className="p-4 rounded-none bg-slate-900/60 border border-slate-800 focus:border-white outline-none transition text-sm placeholder-slate-500 font-light resize-none"
        />

        {/* Error */}
        {errorMessage && (
          <p className="text-red-400 text-xs font-light">
            {errorMessage}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-white hover:bg-slate-100 text-slate-950 py-4 rounded-none font-bold uppercase tracking-widest transition disabled:opacity-50 disabled:cursor-not-allowed text-xs cursor-pointer"
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

              {/* Close Button */}
              <button
                onClick={() => setSuccess(false)}
                className="mt-6 bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2.5 rounded-full font-bold transition cursor-pointer text-sm"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[9999] bg-white/70 backdrop-blur-md flex flex-col items-center justify-center gap-6">
          <div className="relative flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-[3px] border-slate-100 border-t-[#0D4A86] animate-spin mb-4" />
            <motion.h2 
              initial={{ opacity: 0.3, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1.5,
                ease: "easeInOut"
              }}
              className="text-2xl sm:text-3xl font-extrabold tracking-widest text-[#0D4A86]" 
              style={{ fontFamily: '"American Typewriter","American Typewriter Std",serif' }}
            >
              FADENFAB
            </motion.h2>
          </div>
        </div>
      )}
    </section>
  );
}