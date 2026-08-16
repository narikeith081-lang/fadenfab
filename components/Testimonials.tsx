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
    <section className="relative py-10 md:py-20 px-4 md:px-6 bg-white overflow-hidden border-t border-slate-100">
      <div className="relative max-w-4xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8 md:mb-16">
          <span className="text-[#0D4A86] uppercase tracking-[0.3em] font-bold text-xs">
            Client Voices
          </span>

          <h2 className="text-2xl xs:text-3xl md:text-5xl font-extrabold text-slate-900 mt-3" style={{ fontFamily: '"American Typewriter","American Typewriter Std",serif' }}>
            Trusted by the Best
          </h2>

          <p className="text-slate-500 mt-4 max-w-xl mx-auto text-sm font-light">
            Read comments from organizers, founders, and teams who choose FADENFAB for bespoke apparel.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative flex items-center justify-between gap-4">
          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="hidden md:flex flex-shrink-0 bg-white hover:bg-slate-900 text-slate-700 hover:text-white w-12 h-12 rounded-none border border-slate-200 shadow-sm transition-all duration-300 items-center justify-center cursor-pointer hover:scale-105 z-10"
            aria-label="Previous Testimonial"
          >
            <ChevronLeftIcon className="w-5 h-5" style={{ width: "20px", height: "20px" }} />
          </button>

          {/* Slideshow Card Slot */}
          <div className="flex-grow min-w-0 max-w-2xl h-[210px] xs:h-[180px] md:h-[220px] relative overflow-hidden touch-pan-y select-none">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  if (info.offset.x < -50) {
                    handleNext();
                  } else if (info.offset.x > 50) {
                    handlePrev();
                  }
                }}
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationComplete={() => setIsAnimating(false)}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0 w-full bg-[#FAF9F6] border border-slate-100 p-4 md:p-8 flex flex-col justify-between h-full hover:border-slate-200 transition-all duration-300 rounded-none cursor-grab active:cursor-grabbing"
              >
                <div>
                  {/* Stars */}
                  <div className="text-amber-500/80 text-base tracking-wider">
                    ★★★★★
                  </div>

                  {/* Review */}
                  <p className="text-slate-600 mt-4 leading-relaxed text-sm md:text-base italic font-light font-serif">
                    "{active.review}"
                  </p>
                </div>

                {/* User Info */}
                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      {active.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-light">
                      {active.company}
                    </p>
                  </div>
                  <span className="text-lg opacity-15">“</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="hidden md:flex flex-shrink-0 bg-white hover:bg-slate-900 text-slate-700 hover:text-white w-12 h-12 rounded-none border border-slate-200 shadow-sm transition-all duration-300 items-center justify-center cursor-pointer hover:scale-105 z-10"
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
              className={`h-1.5 transition-all duration-300 cursor-pointer rounded-none ${
                activeIndex === i ? "bg-slate-900 w-6" : "bg-slate-300 hover:bg-slate-400 w-1.5"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}