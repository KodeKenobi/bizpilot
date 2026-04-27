"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { cn } from "@/lib/utils";

interface GlobeProps {
  dark?: boolean;
  baseColor?: string;
  glowColor?: string;
  markerColor?: string;
  opacity?: number;
  brightness?: number;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  speed?: number;
  markers?: Array<{ location: [number, number]; size: number }>;
  className?: string;
}

export function Globe({
  dark = false,
  baseColor = "#FFFFFF",
  glowColor = "#FFFFFF",
  markerColor = "#00FFFF",
  opacity = 1,
  brightness = 1,
  offsetX = 0,
  offsetY = 0,
  scale = 1,
  speed = 0.0025,
  markers = [],
  className = "",
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    let globe: ReturnType<typeof createGlobe> | null = null;

    if (canvasRef.current) {
      // Convert hex colors to RGB arrays [0-1]
      const hexToRgb = (hex: string): [number, number, number] => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return [r, g, b];
      };

      globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: 600 * 2,
        height: 600 * 2,
        phi: 0,
        theta: 0,
        dark: dark ? 1 : 0,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: brightness,
        baseColor: hexToRgb(baseColor),
        markerColor: hexToRgb(markerColor),
        glowColor: hexToRgb(glowColor),
        markers: markers,
        onRender: (state) => {
          state.phi = phi;
          phi += speed;
        },
      });
    }

    return () => {
      if (globe) {
        globe.destroy();
      }
    };
  }, [dark, baseColor, glowColor, markerColor, brightness, speed, markers]);

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
      style={{
        transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
        filter: `brightness(${brightness})`,
        opacity: opacity,
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute"
        style={{
          width: "600px",
          height: "600px",
          opacity: opacity,
        }}
      />
    </div>
  );
}