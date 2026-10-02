import React, { useState } from "react";
import CommunityBackground from "./community-background";
import { Link } from "react-router-dom";
import {
  MousePointer,
  Users,
  Sun,
  ShieldCheck,
  ArrowRight,
  Info
} from "lucide-react";

export default function Demo() {
  const [intensity, setIntensity] = useState<number>(1);
  const [cursorRadius, setCursorRadius] = useState<number>(110);
  const [isInteractive, setIsInteractive] = useState<boolean>(true);
  const [peopleBoost, setPeopleBoost] = useState<boolean>(false);

  return (
    <CommunityBackground
      cursorGlowIntensity={intensity}
      cursorRadius={cursorRadius}
      interactive={isInteractive}
      peopleVisibilityBoost={peopleBoost}
      className="min-h-screen flex items-center justify-center p-4 sm:p-8"
    >
      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Living Neighborhood Interactive Card */}
        <div className="bg-[#121212]/95 border border-[#292929] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#292929] pb-4 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#292929] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[#B87333]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#F5F2ED] tracking-tight">
                  Community Desk
                </h1>
                <p className="text-[11px] text-[#A8A29E]">
                  Living Neighborhood Interactive Scene
                </p>
              </div>
            </div>

            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-[#B87333]/15 text-[#B87333] border border-[#B87333]/30">
              Black + Copper
            </span>
          </div>

          {/* Value Proposition */}
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-extrabold text-[#F5F2ED] tracking-tight">
              Real Issues. Real People. Real Change.
            </h2>
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              The animated background represents a living community at night. The scene features authentic homes, neighbors, trees, and streetlights that illuminate subtly in response to your presence.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#292929] flex items-start gap-2.5">
              <MousePointer className="w-4 h-4 text-[#B87333] mt-0.5 shrink-0" />
              <div>
                <h3 className="text-xs font-semibold text-[#F5F2ED]">
                  Tight Localized Cursor Glow
                </h3>
                <p className="text-[11px] text-[#A8A29E] mt-0.5">
                  Subtle, intimate warm copper illumination focused around your cursor ({cursorRadius}px radius).
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#1A1A1A] border border-[#292929] flex items-start gap-2.5">
              <Users className="w-4 h-4 text-[#B87333] mt-0.5 shrink-0" />
              <div>
                <h3 className="text-xs font-semibold text-[#F5F2ED]">
                  Community Residents
                </h3>
                <p className="text-[11px] text-[#A8A29E] mt-0.5">
                  Clear silhouettes of neighbors talking, walking, and walking dogs along the sidewalk.
                </p>
              </div>
            </div>
          </div>

          {/* Scene Controls */}
          <div className="bg-[#1A1A1A] border border-[#292929] rounded-xl p-4 space-y-3 mb-6">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A8A29E] flex items-center gap-1.5 font-medium">
                <Sun className="w-3.5 h-3.5 text-[#B87333]" />
                Cursor Light Radius
              </span>
              <span className="text-[#B87333] font-mono font-bold">
                {cursorRadius}px
              </span>
            </div>
            <input
              type="range"
              min="70"
              max="200"
              step="10"
              value={cursorRadius}
              onChange={(e) => setCursorRadius(parseInt(e.target.value))}
              aria-label="Cursor Light Radius"
              className="w-full accent-[#B87333] cursor-pointer"
            />

            <div className="pt-2 flex items-center justify-between border-t border-[#292929] text-xs">
              <span className="text-[#A8A29E]">Residents Visibility Boost (Sign Up mode)</span>
              <button
                type="button"
                onClick={() => setPeopleBoost(!peopleBoost)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  peopleBoost
                    ? "bg-[#B87333] text-[#080808]"
                    : "bg-[#292929] text-[#A8A29E]"
                }`}
              >
                {peopleBoost ? "Boosted" : "Normal"}
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#292929] text-xs">
              <span className="text-[#A8A29E]">Interactive Cursor Tracking</span>
              <button
                type="button"
                onClick={() => setIsInteractive(!isInteractive)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                  isInteractive
                    ? "bg-[#B87333] text-[#080808]"
                    : "bg-[#292929] text-[#A8A29E]"
                }`}
              >
                {isInteractive ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>

          {/* Direct Navigation to Auth Pages */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/"
              className="flex-1 bg-[#B87333] hover:bg-[#C98545] text-[#080808] font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-md"
            >
              <span>View Login Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/signup"
              className="flex-1 bg-[#1A1A1A] hover:bg-[#292929] border border-[#292929] hover:border-[#B87333] text-[#F5F2ED] font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs"
            >
              <span>View Sign Up Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Micro Footer Notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#66615D]">
          <Info className="w-3.5 h-3.5 text-[#B87333]" />
          <span>All Login & Sign Up form fields remain 100% preserved.</span>
        </div>
      </div>
    </CommunityBackground>
  );
}
