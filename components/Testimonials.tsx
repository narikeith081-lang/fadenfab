"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Arun Kumar",
    company: "Startup Founder",
    review:
      "FADENFAB delivered premium quality oversized t-shirts for our startup launch. Excellent fabric quality, premium printing and timely delivery.",
  },

  {
    name: "Priya Sharma",
    company: "College Coordinator",
    review:
      "Our college ordered more than 300 t-shirts. Everyone loved the quality, fitting and vibrant print. Highly recommended.",
  },

  {
    name: "Rahul Verma",
    company: "Corporate HR",
    review:
      "Professional service, premium materials and competitive pricing. FADENFAB is our preferred apparel partner.",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-28 px-6 bg-gradient-to-b from-white via-blue-50 to-slate-50 overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300/10 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-20">

          <span className="text-[#0D4A86] uppercase tracking-[4px] font-semibold">
            Testimonials
          </span>

          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-4">
            What Our
            <span className="text-[#0D4A86]">
              {" "}Customers Say
            </span>
          </h2>

          <p className="text-slate-600 mt-6 max-w-2xl mx-auto text-lg leading-8">
            Trusted by startups, corporates, colleges and businesses across India.
          </p>

        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">

          {testimonials.map((item, i) => (

            <motion.div
              key={i}
              initial={{
                opacity: 0,
                y: 40,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: i * 0.15,
                duration: 0.5,
              }}
              whileHover={{
                y: -10,
              }}
              className="group bg-white rounded-3xl border border-slate-200 p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
            >

              {/* Stars */}
              <div className="text-yellow-400 text-2xl">
                ★★★★★
              </div>

              {/* Review */}
              <p className="text-slate-600 mt-6 leading-8 italic">
                "{item.review}"
              </p>

              {/* User */}
              <div className="mt-8 pt-6 border-t border-slate-200">

                <h3 className="text-xl font-bold text-[#0D4A86] group-hover:text-[#083A6B] transition-colors duration-300">
                  {item.name}
                </h3>

                <p className="text-slate-500 mt-1">
                  {item.company}
                </p>

              </div>

            </motion.div>

          ))}

        </div>

      </div>

    </section>
  );
}