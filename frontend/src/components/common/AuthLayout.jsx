import React from "react";
import CommunityBackground from "@/components/ui/community-background";
import { MapPin } from "lucide-react";

export default function AuthLayout({
  titlePrefix = "Join",
  highlightTitle = "Community Desk.",
  subheading = "Your community. Your voice. Your impact.",
  description = "Create your account to report local issues, follow their progress, and help build a better community together.",
  peopleVisibilityBoost = false,
  children,
}) {
  return (
    <CommunityBackground
      peopleVisibilityBoost={peopleVisibilityBoost}
      className="min-h-dvh flex items-center justify-center p-4 sm:p-6 lg:p-10"
    >
      {/* Main Content Layout Container */}
      <div className="w-full max-w-6xl mx-auto py-2 sm:py-4 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Seamless Ambient Typography (No Box, Soft Natural Shadow) */}
          <div className="lg:col-span-5 text-left space-y-5 relative">
            
            {/* Seamless Soft Dark Backing (Zero Box Borders, Organic Vignette) */}
            <div
              className="absolute -inset-10 -z-10 pointer-events-none rounded-3xl opacity-90 blur-2xl"
              style={{
                background:
                  "radial-gradient(ellipse at 40% 40%, rgba(8, 8, 8, 0.95) 0%, rgba(8, 8, 8, 0.75) 55%, transparent 80%)",
              }}
            />

            {/* Headline with Copper Accent */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-[#F5F2ED] leading-[1.12] drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]">
                {titlePrefix}{" "}
                <span className="text-[#B87333] inline-block">{highlightTitle}</span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-[#F5F2ED]/95 font-medium mt-2.5 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                {subheading}
              </p>
            </div>

            {/* Core Description */}
            <p className="text-xs sm:text-sm text-[#A8A29E] leading-relaxed max-w-md drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {description}
            </p>

            {/* Elevated Neighborhood Statement */}
            <div className="pt-4 border-t border-[#292929]/70 flex items-start gap-3 text-xs text-[#A8A29E] max-w-md drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              <MapPin className="w-4 h-4 text-[#B87333] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-[#F5F2ED]">
                  Real Issues. Real People. Real Change.
                </p>
                <p className="text-[11px] text-[#A8A29E] leading-relaxed">
                  Connecting neighbors to track local issues, support civic initiatives, and build stronger communities.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-7 flex items-center justify-center lg:justify-end">
            {children}
          </div>

        </div>
      </div>
    </CommunityBackground>
  );
}
