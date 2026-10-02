import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface CommunityBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  /** Intensity of the warm copper cursor light (0 to 1) */
  cursorGlowIntensity?: number;
  /** Radius of the localized warm cursor light (default: 110px) */
  cursorRadius?: number;
  /** Whether the neighborhood reacts to mouse movement */
  interactive?: boolean;
  /** Increases visibility and warm definition of community residents */
  peopleVisibilityBoost?: boolean;
}

interface WindowData {
  relX: number; // 0..1 relative to building width
  relY: number; // 0..1 relative to building height
  width: number;
  height: number;
  baseLit: boolean;
  baseWarmth: number; // 0..1
  currentWarmth: number;
  arched?: boolean;
}

interface BuildingData {
  x: number;
  width: number;
  height: number;
  type: "gabled" | "townhouse" | "apartment" | "civic" | "duplex";
  roofHeight: number;
  chimney?: { x: number; width: number; height: number };
  windows: WindowData[];
  door: { x: number; width: number; height: number; arched?: boolean };
  hasBalcony?: boolean;
  depthLayer: number; // 1: midground, 2: foreground
}

interface StreetlightData {
  x: number;
  height: number;
  lanternGlow: number;
}

interface TreeData {
  x: number;
  height: number;
  canopyRadius: number;
  swayOffset: number;
}

interface PersonData {
  x: number;
  type: "walking" | "chatting_pair" | "dog_walker" | "bench_sitting";
  scale: number;
  glow: number;
}

interface EmberParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  color: string;
}

export const CommunityBackground: React.FC<CommunityBackgroundProps> = ({
  children,
  className,
  cursorGlowIntensity = 1,
  cursorRadius = 110,
  interactive = true,
  peopleVisibilityBoost = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Smooth mouse coordinates (interpolated via lerp)
  const mouseRef = useRef({
    targetX: -1000,
    targetY: -1000,
    currentX: -1000,
    currentY: -1000,
    active: false,
  });

  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    // Responsive dimensions
    let width = 0;
    let height = 0;
    let groundY = 0;
    let dpr = window.devicePixelRatio || 1;

    // Procedural Neighborhood Elements
    let buildings: BuildingData[] = [];
    let streetlights: StreetlightData[] = [];
    let trees: TreeData[] = [];
    let people: PersonData[] = [];
    let ambientEmbers: EmberParticle[] = [];

    // Initialize/Rebuild the Scene based on current viewport
    const buildScene = (w: number, h: number) => {
      groundY = Math.max(h * 0.85, h - 110);

      // 1. Buildings (scaled to lower portion of screen)
      buildings = [];
      const buildingTemplates: Array<{
        type: BuildingData["type"];
        widthRatio: number;
        heightRatio: number;
        roofHeight: number;
        hasChimney: boolean;
        windowCols: number;
        windowRows: number;
        hasBalcony?: boolean;
        depthLayer: number;
      }> = [
        { type: "gabled", widthRatio: 0.11, heightRatio: 0.18, roofHeight: 26, hasChimney: true, windowCols: 3, windowRows: 2, depthLayer: 1 },
        { type: "townhouse", widthRatio: 0.10, heightRatio: 0.23, roofHeight: 12, hasChimney: false, windowCols: 2, windowRows: 3, hasBalcony: true, depthLayer: 2 },
        { type: "civic", widthRatio: 0.13, heightRatio: 0.21, roofHeight: 30, hasChimney: false, windowCols: 4, windowRows: 2, depthLayer: 1 },
        { type: "apartment", widthRatio: 0.12, heightRatio: 0.25, roofHeight: 10, hasChimney: false, windowCols: 3, windowRows: 3, depthLayer: 2 },
        { type: "duplex", widthRatio: 0.11, heightRatio: 0.19, roofHeight: 24, hasChimney: true, windowCols: 4, windowRows: 2, depthLayer: 1 },
        { type: "townhouse", widthRatio: 0.10, heightRatio: 0.22, roofHeight: 12, hasChimney: false, windowCols: 2, windowRows: 3, depthLayer: 2 },
        { type: "gabled", widthRatio: 0.11, heightRatio: 0.20, roofHeight: 25, hasChimney: true, windowCols: 3, windowRows: 2, depthLayer: 1 },
        { type: "apartment", widthRatio: 0.12, heightRatio: 0.24, roofHeight: 10, hasChimney: false, windowCols: 3, windowRows: 3, depthLayer: 2 },
      ];

      let currentX = w * 0.02;
      for (let i = 0; i < buildingTemplates.length && currentX < w * 1.05; i++) {
        const tmpl = buildingTemplates[i % buildingTemplates.length];
        const bWidth = Math.min(155, Math.max(80, tmpl.widthRatio * w));
        const bHeight = Math.min(175, Math.max(85, tmpl.heightRatio * h));

        const windows: WindowData[] = [];
        const padX = bWidth * 0.14;
        const padY = bHeight * 0.18;
        const colWidth = (bWidth - padX * 2) / tmpl.windowCols;
        const rowHeight = (bHeight - padY * 2 - 20) / tmpl.windowRows;

        for (let r = 0; r < tmpl.windowRows; r++) {
          for (let c = 0; c < tmpl.windowCols; c++) {
            const isLit = (i * 3 + r * 2 + c) % 3 !== 0;
            windows.push({
              relX: padX + c * colWidth + colWidth * 0.2,
              relY: padY + r * rowHeight + rowHeight * 0.15,
              width: colWidth * 0.6,
              height: rowHeight * 0.65,
              baseLit: isLit,
              baseWarmth: isLit ? 0.28 + ((i + r + c) % 3) * 0.12 : 0.04,
              currentWarmth: isLit ? 0.28 : 0.04,
              arched: r === 0 && tmpl.type === "civic",
            });
          }
        }

        buildings.push({
          x: currentX,
          width: bWidth,
          height: bHeight,
          type: tmpl.type,
          roofHeight: tmpl.roofHeight,
          chimney: tmpl.hasChimney
            ? { x: bWidth * 0.75, width: 14, height: 28 }
            : undefined,
          windows,
          door: {
            x: bWidth * 0.4,
            width: bWidth * 0.2,
            height: 32,
            arched: tmpl.type === "civic",
          },
          hasBalcony: tmpl.hasBalcony,
          depthLayer: tmpl.depthLayer,
        });

        currentX += bWidth + Math.max(12, w * 0.015);
      }

      // 2. Streetlights at regular intervals
      streetlights = [];
      const lightSpacing = Math.max(160, w / 6);
      for (let lx = 50; lx < w; lx += lightSpacing) {
        streetlights.push({
          x: lx + Math.sin(lx) * 20,
          height: 62,
          lanternGlow: 0.5,
        });
      }

      // 3. Trees in front yards and sidewalk edges
      trees = [];
      const treeCount = Math.max(4, Math.floor(w / 220));
      for (let t = 0; t < treeCount; t++) {
        trees.push({
          x: (w / treeCount) * t + 60 + Math.sin(t * 7) * 30,
          height: 72 + (t % 3) * 16,
          canopyRadius: 22 + (t % 3) * 6,
          swayOffset: t * 1.5,
        });
      }

      // 4. Subtle Human Silhouettes on Sidewalk
      people = [];
      const personTypes: PersonData["type"][] = [
        "walking",
        "chatting_pair",
        "dog_walker",
        "bench_sitting",
        "walking",
      ];
      const peopleSpacing = w / (personTypes.length + 1);
      personTypes.forEach((pType, idx) => {
        people.push({
          x: peopleSpacing * (idx + 0.8) + (idx % 2 === 0 ? 25 : -20),
          type: pType,
          scale: 0.9 + (idx % 3) * 0.08,
          glow: 0.1,
        });
      });

      // 5. Ambient drifting night particles (gentle embers / dust motes)
      ambientEmbers = [];
      const emberCount = Math.floor(Math.min(28, w / 48));
      for (let e = 0; e < emberCount; e++) {
        ambientEmbers.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 10,
          vy: -6 - Math.random() * 12,
          size: 1.1 + Math.random() * 1.6,
          alpha: 0.12 + Math.random() * 0.28,
          maxAlpha: 0.4,
          life: Math.random() * 5,
          maxLife: 4 + Math.random() * 4,
          color: Math.random() > 0.5 ? "#B87333" : "#C98545",
        });
      }
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      buildScene(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    // Mouse Tracking across Container or Window
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handlePointerLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    // RENDER LOOP
    const render = (time: number) => {
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      // Mouse Interpolation (smooth easing)
      if (interactive && mouseRef.current.active) {
        mouseRef.current.currentX += (mouseRef.current.targetX - mouseRef.current.currentX) * 0.09;
        mouseRef.current.currentY += (mouseRef.current.targetY - mouseRef.current.currentY) * 0.09;
      } else {
        mouseRef.current.currentX += (-1000 - mouseRef.current.currentX) * 0.05;
        mouseRef.current.currentY += (-1000 - mouseRef.current.currentY) * 0.05;
      }

      const curX = mouseRef.current.currentX;
      const curY = mouseRef.current.currentY;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // --- 1. Deep Midnight Sky ---
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, "#080808");
      skyGrad.addColorStop(0.65, "#0b0b0e");
      skyGrad.addColorStop(1, "#121217");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, groundY);

      // Distant stars / night sky atmosphere
      ctx.fillStyle = "rgba(245, 242, 237, 0.22)";
      for (let s = 0; s < 25; s++) {
        const starX = (width * 0.04 * s * 1.3) % width;
        const starY = (height * 0.02 * s * 2.1) % (groundY * 0.5);
        const twinkle = reducedMotion ? 0.3 : 0.2 + Math.sin(time * 0.002 + s) * 0.15;
        ctx.globalAlpha = twinkle;
        ctx.beginPath();
        ctx.arc(starX, starY, 0.75, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // --- 2. Distant Horizon Silhouette ---
      const parallaxFar = reducedMotion ? 0 : (curX - width / 2) * 0.006;
      ctx.save();
      ctx.translate(parallaxFar, 0);
      ctx.fillStyle = "#0e0e13";
      for (let i = 0; i < 14; i++) {
        const sx = i * (width / 12) - 30;
        const sW = width / 12 + 20;
        const sH = 60 + ((i * 37) % 55);
        ctx.fillRect(sx, groundY - sH, sW, sH);

        if (i % 3 === 0) {
          ctx.strokeStyle = "#16161f";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(sx + sW * 0.5, groundY - sH);
          ctx.lineTo(sx + sW * 0.5, groundY - sH - 18);
          ctx.stroke();
        }
      }
      ctx.restore();

      // --- 3. Midground Residential Buildings ---
      const parallaxMid = reducedMotion ? 0 : (curX - width / 2) * 0.016;

      buildings.forEach((b) => {
        const bX = b.x + parallaxMid;
        const bY = groundY - b.height;

        // Proximity calculation between cursor and building (tighter radius: 150px)
        const bCenterX = bX + b.width / 2;
        const bCenterY = bY + b.height / 2;
        const distToCursor = Math.hypot(curX - bCenterX, curY - bCenterY);
        const proximity = Math.max(0, 1 - distToCursor / 150);
        const smoothProx = proximity * proximity * (3 - 2 * proximity);

        // Chimney
        if (b.chimney) {
          ctx.fillStyle = "#141419";
          ctx.fillRect(bX + b.chimney.x, bY - b.chimney.height, b.chimney.width, b.chimney.height);
          ctx.fillStyle = "#1e1e26";
          ctx.fillRect(bX + b.chimney.x - 2, bY - b.chimney.height, b.chimney.width + 4, 4);
        }

        // Roof
        ctx.fillStyle = "#16161d";
        ctx.beginPath();
        if (b.type === "gabled" || b.type === "duplex") {
          ctx.moveTo(bX - 6, bY);
          ctx.lineTo(bX + b.width / 2, bY - b.roofHeight);
          ctx.lineTo(bX + b.width + 6, bY);
          ctx.closePath();
          ctx.fill();

          if (smoothProx > 0.08) {
            ctx.strokeStyle = `rgba(184, 115, 51, ${0.4 * smoothProx * cursorGlowIntensity})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        } else if (b.type === "civic") {
          ctx.moveTo(bX - 4, bY);
          ctx.lineTo(bX + b.width / 2, bY - b.roofHeight);
          ctx.lineTo(bX + b.width + 4, bY);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#1e1e26";
          ctx.fillRect(bX + b.width / 2 - 8, bY - b.roofHeight - 16, 16, 16);
          ctx.beginPath();
          ctx.arc(bX + b.width / 2, bY - b.roofHeight - 16, 8, Math.PI, 0);
          ctx.fill();
        } else {
          ctx.fillRect(bX - 3, bY - b.roofHeight, b.width + 6, b.roofHeight);
          ctx.fillStyle = "#1f1f28";
          ctx.fillRect(bX - 5, bY - b.roofHeight - 3, b.width + 10, 4);
        }

        // Facade
        const bGrad = ctx.createLinearGradient(bX, bY, bX, groundY);
        bGrad.addColorStop(0, b.depthLayer === 2 ? "#141419" : "#111116");
        bGrad.addColorStop(1, b.depthLayer === 2 ? "#181820" : "#14141a");
        ctx.fillStyle = bGrad;
        ctx.fillRect(bX, bY, b.width, b.height);

        ctx.strokeStyle = "#23232c";
        ctx.lineWidth = 1;
        ctx.strokeRect(bX, bY, b.width, b.height);

        // Door
        ctx.fillStyle = "#0c0c0f";
        if (b.door.arched) {
          ctx.beginPath();
          ctx.arc(bX + b.door.x + b.door.width / 2, groundY - b.door.height + b.door.width / 2, b.door.width / 2, Math.PI, 0);
          ctx.rect(bX + b.door.x, groundY - b.door.height + b.door.width / 2, b.door.width, b.door.height - b.door.width / 2);
          ctx.fill();
        } else {
          ctx.fillRect(bX + b.door.x, groundY - b.door.height, b.door.width, b.door.height);
        }

        // Balcony
        if (b.hasBalcony) {
          ctx.fillStyle = "#22222b";
          ctx.fillRect(bX + b.width * 0.15, bY + b.height * 0.48, b.width * 0.7, 4);
          ctx.strokeStyle = "#292936";
          ctx.lineWidth = 1;
          for (let bl = 0; bl < 8; bl++) {
            const bxPos = bX + b.width * 0.15 + (b.width * 0.7 * bl) / 7;
            ctx.beginPath();
            ctx.moveTo(bxPos, bY + b.height * 0.48);
            ctx.lineTo(bxPos, bY + b.height * 0.48 - 10);
            ctx.stroke();
          }
        }

        // Windows with dynamic localized lighting (tighter radius: 120px)
        b.windows.forEach((w) => {
          const winX = bX + w.relX;
          const winY = bY + w.relY;

          const wDist = Math.hypot(curX - (winX + w.width / 2), curY - (winY + w.height / 2));
          const wProx = Math.max(0, 1 - wDist / 120);
          const wSmooth = wProx * wProx * (3 - 2 * wProx);

          const breathing = reducedMotion ? 0 : Math.sin(time * 0.0015 + winX * 0.05) * 0.04;
          const targetWarmth = Math.min(
            1.0,
            w.baseWarmth + breathing + wSmooth * 0.55 * cursorGlowIntensity
          );

          w.currentWarmth += (targetWarmth - w.currentWarmth) * 0.12;
          const warmth = Math.max(0.04, w.currentWarmth);

          // Subtle bloom when lit
          if (warmth > 0.38) {
            ctx.save();
            const glowRadius = w.width * 1.5;
            const winGlow = ctx.createRadialGradient(
              winX + w.width / 2,
              winY + w.height / 2,
              2,
              winX + w.width / 2,
              winY + w.height / 2,
              glowRadius
            );
            winGlow.addColorStop(0, `rgba(184, 115, 51, ${0.35 * (warmth - 0.25)})`);
            winGlow.addColorStop(0.5, `rgba(201, 133, 69, ${0.14 * (warmth - 0.25)})`);
            winGlow.addColorStop(1, "rgba(8, 8, 8, 0)");
            ctx.fillStyle = winGlow;
            ctx.beginPath();
            ctx.arc(winX + w.width / 2, winY + w.height / 2, glowRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // Window Frame
          ctx.fillStyle = "#0c0c0f";
          ctx.fillRect(winX - 1.5, winY - 1.5, w.width + 3, w.height + 3);

          // Window Light Fill
          const r = Math.round(18 + warmth * 190);
          const g = Math.round(18 + warmth * 110);
          const blue = Math.round(22 + warmth * 55);
          ctx.fillStyle = `rgb(${r}, ${g}, ${blue})`;

          if (w.arched) {
            ctx.beginPath();
            ctx.arc(winX + w.width / 2, winY + w.width / 2, w.width / 2, Math.PI, 0);
            ctx.rect(winX, winY + w.width / 2, w.width, w.height - w.width / 2);
            ctx.fill();
          } else {
            ctx.fillRect(winX, winY, w.width, w.height);
          }

          // Mullions
          ctx.strokeStyle = "#101015";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(winX, winY + w.height / 2);
          ctx.lineTo(winX + w.width, winY + w.height / 2);
          ctx.moveTo(winX + w.width / 2, winY);
          ctx.lineTo(winX + w.width / 2, winY + w.height);
          ctx.stroke();
        });
      });

      // --- 4. Trees with subtle wind sway ---
      trees.forEach((tree) => {
        const treeX = tree.x + parallaxMid * 1.1;
        const trunkY = groundY;
        const trunkH = tree.height * 0.45;
        const canopyY = trunkY - trunkH;

        ctx.fillStyle = "#171616";
        ctx.beginPath();
        ctx.moveTo(treeX - 4, trunkY);
        ctx.lineTo(treeX - 2, canopyY);
        ctx.lineTo(treeX + 2, canopyY);
        ctx.lineTo(treeX + 4, trunkY);
        ctx.closePath();
        ctx.fill();

        const sway = reducedMotion ? 0 : Math.sin(time * 0.0018 + tree.swayOffset) * 2.5;
        const treeDist = Math.hypot(curX - (treeX + sway), curY - canopyY);
        const treeProx = Math.max(0, 1 - treeDist / 130);
        const treeSmooth = treeProx * treeProx * (3 - 2 * treeProx);

        ctx.save();
        ctx.translate(treeX + sway, canopyY);

        ctx.fillStyle = "#121814";
        ctx.beginPath();
        ctx.arc(0, -tree.canopyRadius * 0.6, tree.canopyRadius, 0, Math.PI * 2);
        ctx.arc(-tree.canopyRadius * 0.45, -tree.canopyRadius * 0.3, tree.canopyRadius * 0.75, 0, Math.PI * 2);
        ctx.arc(tree.canopyRadius * 0.45, -tree.canopyRadius * 0.3, tree.canopyRadius * 0.75, 0, Math.PI * 2);
        ctx.fill();

        if (treeSmooth > 0.08) {
          ctx.fillStyle = `rgba(184, 115, 51, ${0.28 * treeSmooth * cursorGlowIntensity})`;
          ctx.beginPath();
          ctx.arc(0, -tree.canopyRadius * 0.6, tree.canopyRadius * 0.95, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // --- 5. Street Level ---
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, height);
      groundGrad.addColorStop(0, "#16161b");
      groundGrad.addColorStop(0.2, "#111115");
      groundGrad.addColorStop(1, "#080808");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, width, height - groundY);

      // Curb
      ctx.fillStyle = "#262630";
      ctx.fillRect(0, groundY + 18, width, 3);
      ctx.fillStyle = "#1b1b22";
      ctx.fillRect(0, groundY + 21, width, 4);

      // Paving Lines
      ctx.strokeStyle = "#1a1a22";
      ctx.lineWidth = 1;
      for (let px = 0; px < width; px += 45) {
        ctx.beginPath();
        ctx.moveTo(px, groundY);
        ctx.lineTo(px - 15, groundY + 18);
        ctx.stroke();
      }

      // Community Notice Board
      const boardX = width * 0.06;
      ctx.fillStyle = "#1f1d1a";
      ctx.fillRect(boardX, groundY - 35, 30, 24);
      ctx.strokeStyle = "#2e2a25";
      ctx.strokeRect(boardX, groundY - 35, 30, 24);
      ctx.fillRect(boardX + 5, groundY - 11, 3, 11);
      ctx.fillRect(boardX + 22, groundY - 11, 3, 11);
      ctx.fillStyle = "rgba(184, 115, 51, 0.4)";
      ctx.fillRect(boardX + 4, groundY - 31, 8, 10);
      ctx.fillStyle = "rgba(245, 242, 237, 0.3)";
      ctx.fillRect(boardX + 16, groundY - 28, 9, 8);

      // Park Bench
      const benchX = width * 0.72;
      ctx.fillStyle = "#1e1d1b";
      ctx.fillRect(benchX, groundY - 14, 34, 3);
      ctx.fillRect(benchX, groundY - 10, 34, 3);
      ctx.fillRect(benchX, groundY - 6, 34, 3);
      ctx.fillStyle = "#2a2928";
      ctx.fillRect(benchX + 3, groundY - 6, 3, 6);
      ctx.fillRect(benchX + 28, groundY - 6, 3, 6);

      // --- 6. Streetlights with Lantern Glow ---
      streetlights.forEach((lamp) => {
        const lampX = lamp.x + parallaxMid * 1.15;
        const lampY = groundY;

        ctx.fillStyle = "#272730";
        ctx.fillRect(lampX - 2, lampY - lamp.height, 4, lamp.height);
        ctx.fillRect(lampX - 5, lampY - 6, 10, 6);
        ctx.fillRect(lampX - 7, lampY - lamp.height - 4, 14, 4);
        ctx.fillStyle = "#1f1f26";
        ctx.fillRect(lampX - 5, lampY - lamp.height - 14, 10, 10);

        const lampDist = Math.hypot(curX - lampX, curY - (lampY - lamp.height));
        const lampProx = Math.max(0, 1 - lampDist / 140);
        const lampSmooth = lampProx * lampProx * (3 - 2 * lampProx);

        const glowRadius = 45 + lampSmooth * 30 * cursorGlowIntensity;
        const lGlow = ctx.createRadialGradient(
          lampX,
          lampY - lamp.height - 9,
          1,
          lampX,
          lampY - lamp.height - 9,
          glowRadius
        );
        lGlow.addColorStop(0, "rgba(255, 209, 164, 0.95)");
        lGlow.addColorStop(0.2, `rgba(184, 115, 51, ${0.6 + lampSmooth * 0.25})`);
        lGlow.addColorStop(0.6, `rgba(143, 90, 43, ${0.15 + lampSmooth * 0.15})`);
        lGlow.addColorStop(1, "rgba(8, 8, 8, 0)");

        ctx.fillStyle = lGlow;
        ctx.beginPath();
        ctx.arc(lampX, lampY - lamp.height - 9, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        const poolGrad = ctx.createRadialGradient(
          lampX,
          groundY + 8,
          5,
          lampX,
          groundY + 8,
          38 + lampSmooth * 20
        );
        poolGrad.addColorStop(0, `rgba(184, 115, 51, ${0.25 + lampSmooth * 0.15})`);
        poolGrad.addColorStop(1, "rgba(8, 8, 8, 0)");
        ctx.fillStyle = poolGrad;
        ctx.beginPath();
        ctx.ellipse(lampX, groundY + 8, 38 + lampSmooth * 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- 7. Human Silhouettes (Real People in the Community) ---
      people.forEach((person) => {
        const pX = person.x + parallaxMid * 1.25;
        const pY = groundY + 4;

        const pDist = Math.hypot(curX - pX, curY - pY);
        const pProx = Math.max(0, 1 - pDist / 130);
        const pSmooth = pProx * pProx * (3 - 2 * pProx);
        const microParallaxX = reducedMotion ? 0 : (curX - pX) * 0.012;

        ctx.save();
        ctx.translate(pX + microParallaxX, pY);

        // Scale: slightly larger if peopleVisibilityBoost is enabled
        const finalScale = person.scale * (peopleVisibilityBoost ? 1.16 : 1.0);
        ctx.scale(finalScale, finalScale);

        // Soft warm aura when cursor is near OR subtle persistent warm presence if visibility boost
        if (pSmooth > 0.05 || peopleVisibilityBoost) {
          ctx.save();
          const auraRadius = 26;
          const auraAlpha = peopleVisibilityBoost
            ? 0.22 + 0.35 * pSmooth * cursorGlowIntensity
            : 0.4 * pSmooth * cursorGlowIntensity;
          const pGlow = ctx.createRadialGradient(0, -18, 2, 0, -18, auraRadius);
          pGlow.addColorStop(0, `rgba(184, 115, 51, ${auraAlpha})`);
          pGlow.addColorStop(0.7, `rgba(143, 90, 43, ${auraAlpha * 0.4})`);
          pGlow.addColorStop(1, "rgba(8, 8, 8, 0)");
          ctx.fillStyle = pGlow;
          ctx.beginPath();
          ctx.arc(0, -18, auraRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Silhouette color: richer and more visible when peopleVisibilityBoost is active
        let bodyColor = "#1e1d1c";
        if (peopleVisibilityBoost) {
          bodyColor = pSmooth > 0.15 ? "#554b3f" : "#3c352d";
        } else {
          bodyColor = pSmooth > 0.15 ? "#2e2a26" : "#1c1b1a";
        }
        ctx.fillStyle = bodyColor;

        if (person.type === "walking") {
          // Head
          ctx.beginPath();
          ctx.arc(0, -32, 4.2, 0, Math.PI * 2);
          ctx.fill();
          // Torso
          ctx.beginPath();
          ctx.moveTo(-4, -27);
          ctx.lineTo(4, -27);
          ctx.lineTo(5, -13);
          ctx.lineTo(-4, -13);
          ctx.closePath();
          ctx.fill();
          // Legs
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = bodyColor;
          ctx.beginPath();
          ctx.moveTo(-2, -13);
          ctx.lineTo(-5, 0);
          ctx.moveTo(2, -13);
          ctx.lineTo(5, 0);
          ctx.stroke();

          // Subtle copper edge outline if boosted
          if (peopleVisibilityBoost) {
            ctx.strokeStyle = "rgba(184, 115, 51, 0.45)";
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        } else if (person.type === "chatting_pair") {
          // Person 1 (left)
          ctx.beginPath();
          ctx.arc(-7, -30, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(-10, -25, 6, 13);
          ctx.fillRect(-9, -12, 2.5, 12);
          ctx.fillRect(-5, -12, 2.5, 12);

          // Person 2 (right)
          ctx.beginPath();
          ctx.arc(7, -31, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(4, -26, 6, 14);
          ctx.fillRect(5, -12, 2.5, 12);
          ctx.fillRect(8, -12, 2.5, 12);

          if (peopleVisibilityBoost) {
            ctx.strokeStyle = "rgba(184, 115, 51, 0.4)";
            ctx.lineWidth = 0.75;
            ctx.strokeRect(-10, -25, 6, 13);
            ctx.strokeRect(4, -26, 6, 14);
          }
        } else if (person.type === "dog_walker") {
          // Person
          ctx.beginPath();
          ctx.arc(-8, -32, 4.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(-11, -27, 7, 14);
          ctx.fillRect(-10, -13, 2.5, 13);
          ctx.fillRect(-6, -13, 2.5, 13);

          // Dog
          const dogX = 14;
          const dogY = -2;
          ctx.fillRect(dogX - 6, dogY - 8, 12, 6);
          ctx.beginPath();
          ctx.arc(dogX + 7, dogY - 9, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(dogX - 5, dogY - 2, 2, 4);
          ctx.fillRect(dogX + 4, dogY - 2, 2, 4);

          // Leash
          ctx.strokeStyle = peopleVisibilityBoost
            ? "rgba(184, 115, 51, 0.65)"
            : "rgba(184, 115, 51, 0.35)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-6, -18);
          ctx.quadraticCurveTo(2, -10, dogX + 4, dogY - 9);
          ctx.stroke();
        } else if (person.type === "bench_sitting") {
          // Person seated
          ctx.beginPath();
          ctx.arc(benchX - pX + 16, -24, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(benchX - pX + 13, -19, 7, 10);
          ctx.fillRect(benchX - pX + 13, -9, 8, 3);
          ctx.fillRect(benchX - pX + 19, -6, 2.5, 6);

          if (peopleVisibilityBoost) {
            ctx.strokeStyle = "rgba(184, 115, 51, 0.4)";
            ctx.lineWidth = 0.75;
            ctx.strokeRect(benchX - pX + 13, -19, 7, 10);
          }
        }

        ctx.restore();
      });

      // --- 8. Ambient Night Atmosphere Particles (Gentle Fireflies / Embers) ---
      if (!reducedMotion) {
        ambientEmbers.forEach((ember) => {
          ember.y += ember.vy * dt;
          ember.x += ember.vx * dt + Math.sin(time * 0.002 + ember.y * 0.01) * 0.3;
          ember.life += dt;

          if (ember.y < 0 || ember.life > ember.maxLife) {
            ember.y = height * 0.9;
            ember.x = Math.random() * width;
            ember.life = 0;
          }

          const emberAlpha = ember.alpha * (0.6 + Math.sin(time * 0.003 + ember.x) * 0.4);
          ctx.fillStyle = ember.color;
          ctx.globalAlpha = emberAlpha;
          ctx.beginPath();
          ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;
      }

      // --- 9. Soft Localized Cursor Lantern Glow (Reduced Radius) ---
      if (curX > -500 && curY > -500 && interactive) {
        ctx.save();
        const glowRad = Math.max(60, cursorRadius);
        const cursorGlow = ctx.createRadialGradient(curX, curY, 0, curX, curY, glowRad);
        cursorGlow.addColorStop(0, `rgba(201, 133, 69, ${0.15 * cursorGlowIntensity})`);
        cursorGlow.addColorStop(0.35, `rgba(184, 115, 51, ${0.07 * cursorGlowIntensity})`);
        cursorGlow.addColorStop(0.75, `rgba(143, 90, 43, ${0.02 * cursorGlowIntensity})`);
        cursorGlow.addColorStop(1, "rgba(8, 8, 8, 0)");

        ctx.fillStyle = cursorGlow;
        ctx.beginPath();
        ctx.arc(curX, curY, glowRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // --- 10. Soft Falloff Vignette on Edges ---
      const vignette = ctx.createLinearGradient(0, 0, 0, height);
      vignette.addColorStop(0, "rgba(8, 8, 8, 0.4)");
      vignette.addColorStop(0.15, "rgba(8, 8, 8, 0)");
      vignette.addColorStop(0.85, "rgba(8, 8, 8, 0)");
      vignette.addColorStop(1, "rgba(8, 8, 8, 0.75)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [interactive, cursorGlowIntensity, cursorRadius, peopleVisibilityBoost, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full min-h-dvh bg-[#080808] text-[#F5F2ED] overflow-x-hidden select-none",
        className
      )}
    >
      {/* Interactive Living Neighborhood Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none w-full h-full"
      />

      {/* Atmospheric Ambient Lighting Radial Gradients */}
      <div
        className="absolute inset-0 z-0 pointer-events-none select-none opacity-35 mix-blend-screen"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 25%, rgba(184, 115, 51, 0.10) 0%, transparent 45%),
            radial-gradient(circle at 80% 75%, rgba(143, 90, 43, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 50% 85%, rgba(201, 133, 69, 0.06) 0%, transparent 40%)
          `,
        }}
      />

      {/* Foreground Content Layer — Always Interactive and Unblocked */}
      <div className="relative z-10 w-full flex flex-col pointer-events-auto">
        {children}
      </div>
    </div>
  );
};

export default CommunityBackground;
