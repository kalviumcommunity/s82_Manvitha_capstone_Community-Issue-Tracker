import React from "react";

export default function AuthHero({
  heading = "Make your community heard.",
  subheading = "Real Issues. Real People. Real Change.",
  description = "A dedicated civic platform to report local issues, follow verified progress, and stay connected with your neighborhood.",
}) {
  return (
    <div className="relative w-full h-full min-h-[460px] lg:min-h-screen flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden select-none">
      {/* Immersive Full-Bleed Atmospheric Background */}
      <img
        src="/assets/civic-hero.jpg"
        alt="Community Desk Neighborhood Atmosphere"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Subtle Cinematic Dark Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/65 to-[#080808]/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#080808]/30 to-[#080808]" />

      {/* Top spacer */}
      <div className="relative z-10" />

      {/* Main Civic Typography: Clean, Mature, Authentic (No Clumsy Box / No Childish Glow) */}
      <div className="relative z-10 max-w-lg space-y-4">
        <h1 className="text-4xl sm:text-5xl lg:text-[50px] font-bold tracking-tight text-[#F5F2ED] leading-[1.12]">
          {heading}
        </h1>

        <p className="text-base sm:text-lg font-medium text-[#C98545] tracking-wide">
          {subheading}
        </p>

        <p className="text-sm text-[#A8A29E] leading-relaxed max-w-md pt-1">
          {description}
        </p>

        {/* Minimalist, Professional Civic Indicators */}
        <div className="pt-6 mt-6 border-t border-[#292929] flex items-center gap-8">
          <div>
            <div className="text-xl font-semibold text-[#F5F2ED] font-mono tracking-tight">
              Verified
            </div>
            <div className="text-xs text-[#A8A29E] mt-0.5">
              Civic Reports
            </div>
          </div>
          <div className="w-[1px] h-8 bg-[#292929]" />
          <div>
            <div className="text-xl font-semibold text-[#B87333] font-mono tracking-tight">
              Direct
            </div>
            <div className="text-xs text-[#A8A29E] mt-0.5">
              Community Action
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Subtle Brand Motto */}
      <div className="relative z-10 pt-4">
        <p className="text-xs text-[#66615D] tracking-wider uppercase font-medium">
          Real Issues. Real People. Real Change.
        </p>
      </div>
    </div>
  );
}
