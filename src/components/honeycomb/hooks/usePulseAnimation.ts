"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PULSE_SPEED, PULSE_OFFSET, PULSE_MAX_OPACITY } from "../utils/constants";

interface UsePulseAnimationOptions {
  /** Number of hexes to animate */
  hexCount: number;
  /** Whether animation is enabled */
  enabled?: boolean;
}

interface UsePulseAnimationReturn {
  /** Get pulse opacity for a specific hex by index */
  getPulseOpacity: (index: number) => number;
  /** Current frame number (for debugging) */
  frame: number;
}

export function usePulseAnimation({
  hexCount,
  enabled = true,
}: UsePulseAnimationOptions): UsePulseAnimationReturn {
  const [frame, setFrame] = useState(0);
  const rafRef = useRef<number | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!enabled || hexCount === 0) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const animate = () => {
      frameRef.current++;

      // Only update React state every few frames to reduce rerenders
      // But still increment the internal counter smoothly
      if (frameRef.current % 2 === 0) {
        setFrame(frameRef.current);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [enabled, hexCount]);

  const getPulseOpacity = useCallback(
    (index: number): number => {
      if (!enabled) return 0;

      // sin(frame * speed + index * offset) produces a wave
      // Each hex is slightly offset in phase from its neighbors
      const phase = frameRef.current * PULSE_SPEED + index * PULSE_OFFSET;
      const rawValue = Math.sin(phase);

      // Clamp to positive values only and scale by max opacity
      return Math.max(0, rawValue) * PULSE_MAX_OPACITY;
    },
    [enabled]
  );

  return {
    getPulseOpacity,
    frame,
  };
}
