"use client";

import { CSSProperties, ReactNode, useEffect, useRef } from "react";
import "./CursorGrid.css";

type GridHighlight = "area" | "cell";
type GridStyle = "lines" | "dashed" | "dots" | "crosses";
type GridFalloff = "smooth" | "linear" | "sharp";

interface CursorGridProps {
  color?: string;
  gridColor?: string;
  cellSize?: number;
  highlight?: GridHighlight;
  gridStyle?: GridStyle;
  radius?: number;
  falloff?: GridFalloff;
  holdTime?: number;
  fadeDuration?: number;
  lineWidth?: number;
  maxOpacity?: number;
  fillOpacity?: number;
  gridOpacity?: number;
  spotlight?: number;
  cellGap?: number;
  cellRadius?: number;
  clickPulse?: boolean;
  pulseSpeed?: number;
  ambient?: number;
  edgeFade?: number;
  intro?: boolean;
  lightMode?: boolean;
  dpr?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export default function CursorGrid({
  color,
  gridColor,
  cellSize = 60,
  highlight = "area",
  gridStyle = "lines",
  radius = 140,
  falloff = "smooth",
  holdTime = 400,
  fadeDuration = 800,
  lineWidth = 1,
  maxOpacity = 1,
  fillOpacity = 0.06,
  gridOpacity = 0.08,
  spotlight = 0.6,
  cellGap = 0,
  cellRadius = 0,
  clickPulse = true,
  pulseSpeed = 600,
  ambient = 0,
  edgeFade = 0.2,
  intro = true,
  lightMode = false,
  dpr,
  children,
  className = "",
  style
}: CursorGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const ink = lightMode ? "#18181b" : "#ffffff";
    const litColor = color || ink;
    const lineColor = gridColor || ink;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 1;
    let height = 1;
    let frame = 0;
    let visible = true;
    let pointer = { x: 0, y: 0, inside: false };
    let pulses: Array<{ x: number; y: number; start: number }> = [];
    let introStart = intro && !reduced ? performance.now() : -1;
    let lastAmbient = performance.now();

    const getFalloff = (distance: number, reach: number) => {
      const t = clamp(1 - distance / reach, 0, 1);
      if (falloff === "linear") return t;
      if (falloff === "sharp") return t * t * t;
      return t * t * (3 - 2 * t);
    };

    const resize = () => {
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      const ratio = Math.min(dpr || window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const drawGrid = (now: number) => {
      frame = 0;
      context.clearRect(0, 0, width, height);

      let reveal = 1;
      if (introStart >= 0) {
        const elapsed = (now - introStart) / 1400;
        reveal = clamp(elapsed, 0, 1);
      }

      const offsetX = ((width % cellSize) / 2);
      const offsetY = ((height % cellSize) / 2);
      context.save();
      context.globalAlpha = gridOpacity;
      context.strokeStyle = lineColor;
      context.fillStyle = lineColor;
      context.lineWidth = lineWidth;

      if (gridStyle === "dashed") context.setLineDash([cellSize / 3, cellSize / 6]);
      else context.setLineDash([]);

      for (let x = offsetX; x <= width; x += cellSize) {
        if (gridStyle === "dots") {
          for (let y = offsetY; y <= height; y += cellSize) {
            context.beginPath();
            context.arc(x, y, Math.max(1, lineWidth * 1.2), 0, Math.PI * 2);
            context.fill();
          }
        } else if (gridStyle === "crosses") {
          for (let y = offsetY; y <= height; y += cellSize) {
            const arm = cellSize * 0.1 + lineWidth;
            context.beginPath();
            context.moveTo(x - arm, y);
            context.lineTo(x + arm, y);
            context.moveTo(x, y - arm);
            context.lineTo(x, y + arm);
            context.stroke();
          }
        } else {
          context.beginPath();
          context.moveTo(x, 0);
          context.lineTo(x, height);
          context.stroke();
        }
      }

      if (gridStyle === "lines" || gridStyle === "dashed") {
        for (let y = offsetY; y <= height; y += cellSize) {
          context.beginPath();
          context.moveTo(0, y);
          context.lineTo(width, y);
          context.stroke();
        }
      }
      context.restore();

      const edgeDistance = (x: number, y: number) => {
        if (edgeFade <= 0) return 1;
        const sx = clamp(Math.min(x, width - x) / (width * edgeFade), 0, 1);
        const sy = clamp(Math.min(y, height - y) / (height * edgeFade), 0, 1);
        return sx * sy;
      };

      const minCol = highlight === "cell" ? Math.floor((pointer.x - offsetX) / cellSize) : Math.max(0, Math.floor((pointer.x - radius - offsetX) / cellSize));
      const maxCol = highlight === "cell" ? minCol : Math.min(Math.ceil(width / cellSize), Math.ceil((pointer.x + radius - offsetX) / cellSize));
      const minRow = highlight === "cell" ? Math.floor((pointer.y - offsetY) / cellSize) : Math.max(0, Math.floor((pointer.y - radius - offsetY) / cellSize));
      const maxRow = highlight === "cell" ? minRow : Math.min(Math.ceil(height / cellSize), Math.ceil((pointer.y + radius - offsetY) / cellSize));

      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          const cx = offsetX + col * cellSize;
          const cy = offsetY + row * cellSize;
          const distance = Math.hypot(cx - pointer.x, cy - pointer.y);
          if (pointer.inside && (highlight === "cell" || distance <= radius)) {
            const strength = highlight === "cell" ? 1 : getFalloff(distance, radius);
            const edge = edgeDistance(cx, cy);
            const x = cx - cellSize / 2 + cellGap;
            const y = cy - cellSize / 2 + cellGap;
            const size = cellSize - cellGap * 2;

            context.save();
            context.globalAlpha = strength * edge * fillOpacity * reveal;
            context.strokeStyle = litColor;
            context.fillStyle = litColor;
            context.lineWidth = lineWidth;
            context.beginPath();
            context.roundRect ? context.roundRect(x, y, size, size, cellRadius) : context.rect(x, y, size, size);
            context.fill();
            context.globalAlpha = strength * edge * (maxOpacity - fillOpacity * 0.5) * reveal;
            context.stroke();
            context.restore();
          }
        }
      }

      if (pointer.inside) {
        const spot = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);
        spot.addColorStop(0, litColor);
        spot.addColorStop(1, "transparent");
        context.save();
        context.globalAlpha = spotlight * 0.12;
        context.fillStyle = spot;
        context.fillRect(pointer.x - radius, pointer.y - radius, radius * 2, radius * 2);
        context.restore();
      }

      for (const pulse of pulses) {
        const ringRadius = ((now - pulse.start) / 1000) * pulseSpeed;
        if (ringRadius > Math.hypot(width, height) + 100) continue;
        context.save();
        context.globalAlpha = Math.max(0, 0.7 * (1 - ringRadius / (Math.hypot(width, height) + 100)));
        context.strokeStyle = litColor;
        context.lineWidth = lineWidth * 2;
        context.beginPath();
        context.arc(pulse.x, pulse.y, ringRadius, 0, Math.PI * 2);
        context.stroke();
        context.restore();
      }
      pulses = pulses.filter((pulse) => ((now - pulse.start) / 1000) * pulseSpeed <= Math.hypot(width, height) + 100);

      if (ambient > 0 && !reduced && now - lastAmbient > 900) {
        lastAmbient = now;
        pulses.push({
          x: Math.random() * width,
          y: Math.random() * height,
          start: now
        });
      }

      if (
        pointer.inside ||
        pulses.length ||
        (introStart >= 0 && now - introStart < 1400) ||
        ambient > 0
      ) {
        frame = requestAnimationFrame(drawGrid);
      }
    };

    const locate = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };
    };

    const onPointerMove = (event: PointerEvent) => {
      const located = locate(event);
      pointer = located;
      if (!frame) frame = requestAnimationFrame(drawGrid);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!clickPulse || reduced) return;
      const located = locate(event);
      if (!located.inside) return;
      pulses.push({ x: located.x, y: located.y, start: performance.now() });
      if (!frame) frame = requestAnimationFrame(drawGrid);
    };
    const onPointerLeave = () => {
      pointer.inside = false;
      if (!frame) frame = requestAnimationFrame(drawGrid);
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (!frame) frame = requestAnimationFrame(drawGrid);
    });

    resize();
    observer.observe(container);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    frame = requestAnimationFrame(drawGrid);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [
    ambient,
    cellGap,
    cellRadius,
    cellSize,
    clickPulse,
    color,
    dpr,
    edgeFade,
    fadeDuration,
    falloff,
    fillOpacity,
    gridColor,
    gridOpacity,
    gridStyle,
    highlight,
    holdTime,
    intro,
    lightMode,
    lineWidth,
    maxOpacity,
    pulseSpeed,
    radius,
    spotlight
  ]);

  return (
    <div ref={containerRef} className={`cursor-grid${className ? ` ${className}` : ""}`} style={style}>
      <canvas ref={canvasRef} className="cursor-grid__canvas" aria-hidden="true" />
      {children ? <div className="cursor-grid__content">{children}</div> : null}
    </div>
  );
}
