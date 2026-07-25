"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleDotClick = (index: number) => {
    if (isAnimating || index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  // Bind active slide timer
  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeIndex]);

  const active = testimonials[activeIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <section className="relative py-16 md:py-20 px-6 bg-gradient-to-b from-white via-blue-50/50 to-slate-50 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <span className="text-[#0D4A86] uppercase tracking-[4px] font-bold text-xs">
            Testimonials
          </span>

          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-3">
            What Our
            <span className="text-[#0D4A86]"> Customers Say</span>
          </h2>

          <p className="text-slate-500 mt-4 max-w-xl mx-auto text-sm md:text-base">
            Trusted by startups, corporates, colleges and businesses across India.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative flex items-center justify-between gap-4">
          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="flex-shrink-0 bg-white hover:bg-[#0D4A86] text-slate-700 hover:text-white w-10 h-10 md:w-12 md:h-12 rounded-full border border-slate-200 shadow-md transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-105 z-10"
            aria-label="Previous Testimonial"
          >
            <ChevronLeftIcon className="w-5 h-5" style={{ width: "20px", height: "20px" }} />
          </button>

          {/* Slideshow Card Slot */}
          <div className="flex-grow min-w-0 max-w-2xl h-[280px] md:h-[220px] relative overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationComplete={() => setIsAnimating(false)}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0 w-full bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl flex flex-col justify-between h-full hover:shadow-2xl transition-all duration-300"
              >
                <div>
                  {/* Stars */}
                  <div className="text-yellow-400 text-xl">
                    ★★★★★
                  </div>

                  {/* Review */}
                  <p className="text-slate-600 mt-4 leading-relaxed text-sm md:text-base italic font-medium">
                    "{active.review}"
                  </p>
                </div>

                {/* User Info */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#0D4A86]">
                      {active.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {active.company}
                    </p>
                  </div>
                  <span className="text-2xl opacity-25">💬</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="flex-shrink-0 bg-white hover:bg-[#0D4A86] text-slate-700 hover:text-white w-10 h-10 md:w-12 md:h-12 rounded-full border border-slate-200 shadow-md transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-105 z-10"
            aria-label="Next Testimonial"
          >
            <ChevronRightIcon className="w-5 h-5" style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* Indicators Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === i ? "bg-[#0D4A86] w-6" : "bg-slate-300 hover:bg-slate-400 w-2.5"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}