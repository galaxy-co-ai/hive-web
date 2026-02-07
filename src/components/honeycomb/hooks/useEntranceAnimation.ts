"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ENTRANCE_STAGGER,
  ENTRANCE_DURATION,
  ENTRANCE_TOTAL_DURATION,
} from "../utils/constants";

interface UseEntranceAnimationOptions {
  /** Number of hexes to animate */
  hexCount: number;
  /** Trigger key - animation restarts when this changes */
  triggerKey?: string | number;
  /** Whether animation is enabled */
  enabled?: boolean;
}

interface UseEntranceAnimationReturn {
  /** Get entrance progress for a specific hex (0 = not started, 1 = complete) */
  getEntranceProgress: (index: number) => number;
  /** Whether animation is currently active */
  isAnimating: boolean;
  /** Reset and restart animation */
  restart: () => void;
}

export function useEntranceAnimation({
  hexCount,
  triggerKey,
  enabled = true,
}: UseEntranceAnimationOptions): UseEntranceAnimationReturn {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [, forceUpdate] = useState(0);
  const rafRef = useRef<number | null>(null);

  const restart = useCallback(() => {
    if (!enabled || hexCount === 0) return;

    setStartTime(performance.now());
    setIsAnimating(true);
  }, [enabled, hexCount]);

  // Start animation when triggerKey changes or on mount
  useEffect(() => {
    restart();
  }, [triggerKey, hexCount, restart]);

  // Animation loop
  useEffect(() => {
    if (!isAnimating || startTime === null) return;

    const animate = () => {
      const elapsed = performance.now() - startTime;

      // Check if animation is complete
      const totalDuration = ENTRANCE_TOTAL_DURATION + hexCount * ENTRANCE_STAGGER;
      if (elapsed >= totalDuration) {
        setIsAnimating(false);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        return;
      }

      // Force re-render to update progress values
      forceUpdate((n) => n + 1);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isAnimating, startTime, hexCount]);

  const getEntranceProgress = useCallback(
    (index: number): number => {
      if (!enabled) return 1;
      if (startTime === null) return 0;

      const elapsed = performance.now() - startTime;
      const hexStartTime = index * ENTRANCE_STAGGER;
      const hexProgress = (elapsed - hexStartTime) / ENTRANCE_DURATION;

      // Clamp to 0-1 range
      return Math.max(0, Math.min(1, hexProgress));
    },
    [enabled, startTime]
  );

  return {
    getEntranceProgress,
    isAnimating,
    restart,
  };
}

/**
 * Easing function for smooth entrance animation
 * Uses ease-out-cubic for a natural deceleration
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Easing function for bounce effect
 */
export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
