import React, { useState, useEffect } from "react";
import { ShieldCheck, ChevronLeft, ChevronRight, Activity, CheckCircle, Bell } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    tag: "CIVIC ACTION",
    icon: Activity,
    title: "Report Local Issues",
    caption: "Speak up about streetlights, roads, and community maintenance.",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    tag: "LIVE TRACKING",
    icon: CheckCircle,
    title: "Verified Resolution",
    caption: "Follow progress from initial verification to completed work.",
    image: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    tag: "NEIGHBORHOOD PULSE",
    icon: Bell,
    title: "Stay Informed",
    caption: "Receive official announcements and updates from community leaders.",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=900&q=80",
  },
];

export default function AuthCarousel({
  heading = "Make your community heard.",
  highlightWord = "heard.",
  subheading = "Real Issues. Real People. Real Change.",
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  const activeSlide = SLIDES[current];
  const Icon = activeSlide.icon;

  return (
    <div className="w-full flex flex-col justify-center max-w-lg mx-auto lg:mx-0 space-y-4">
      {/* Brand & Clean Minimalist Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121212] border border-[#292929] mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-[#B87333]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A29E]">
            Community Desk
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F5F2ED] leading-tight">
          {heading.includes(highlightWord) ? (
            <>
              {heading.replace(highlightWord, "")}
              <span className="text-[#B87333]">{highlightWord}</span>
            </>
          ) : (
            heading
          )}
        </h1>

        <p className="mt-1.5 text-sm font-medium text-[#A8A29E]">
          {subheading}
        </p>
      </div>

      {/* Visual Carousel Card */}
      <div className="relative rounded-2xl overflow-hidden border border-[#292929] bg-[#121212] shadow-2xl group h-56 sm:h-64">
        {/* Background Image with Dark Vignette */}
        <img
          src={activeSlide.image}
          alt={activeSlide.title}
          className="absolute inset-0 w-full h-full object-cover opacity-35 transition-opacity duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#121212]/70 to-transparent" />

        {/* Content Overlay */}
        <div className="relative z-10 h-full p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#080808]/80 backdrop-blur-sm border border-[#292929] text-[10px] font-bold tracking-wider text-[#B87333] uppercase">
              <Icon className="w-3 h-3 text-[#B87333]" />
              {activeSlide.tag}
            </span>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous slide"
                className="w-7 h-7 rounded-full bg-[#1A1A1A]/80 border border-[#292929] text-[#F5F2ED] flex items-center justify-center hover:border-[#B87333] hover:text-[#C98545] transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next slide"
                className="w-7 h-7 rounded-full bg-[#1A1A1A]/80 border border-[#292929] text-[#F5F2ED] flex items-center justify-center hover:border-[#B87333] hover:text-[#C98545] transition cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#F5F2ED] tracking-tight">
              {activeSlide.title}
            </h2>
            <p className="mt-1 text-xs text-[#A8A29E] leading-relaxed max-w-sm">
              {activeSlide.caption}
            </p>

            {/* Indicator Dots */}
            <div className="flex items-center gap-1.5 mt-3">
              {SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrent(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    current === idx
                      ? "w-6 bg-[#B87333]"
                      : "w-1.5 bg-[#292929] hover:bg-[#66615D]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
