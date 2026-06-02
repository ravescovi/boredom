"use client";

import { useEffect, useState } from "react";

/**
 * Haptics + device-input helpers for the toy pages.
 *
 * Everything here is SSR-safe (guards `window`/`navigator`) and never throws,
 * so call sites don't need their own feature checks.
 *
 * Note: iOS Safari has never shipped `navigator.vibrate`, so `vibrate()` is a
 * silent no-op on iPhone. Shake-to-roll still works there via DeviceMotion.
 */

/** Standard vibration patterns (ms). Arrays alternate vibrate/pause. */
export const HAPTIC = {
  tick: 10, // light: card flip, +/- buttons
  tap: 20, // medium: piece move, deal
  roll: [0, 30, 40, 30], // dice roll
  epic: [0, 40, 30, 40, 30, 80], // epic roll / win
} as const;

/** Fire a vibration pattern. No-op where unsupported; never throws. */
export function vibrate(pattern: number | readonly number[]): void {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(typeof pattern === "number" ? pattern : [...pattern]);
  } catch {
    /* some engines throw on odd patterns — ignore */
  }
}

/** True on touch / coarse-pointer devices. SSR-safe (false on the server). */
export function isPointerCoarse(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

type DeviceMotionEventiOS = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

/**
 * Request DeviceMotion access.
 * - iOS 13+: calls the one-shot permission prompt. MUST be invoked synchronously
 *   from inside a user-gesture handler (don't `await` anything before this).
 * - Android / desktop: no prompt exists, so we resolve "granted".
 */
export async function requestMotionPermission(): Promise<"granted" | "denied" | "unsupported"> {
  if (typeof window === "undefined" || typeof DeviceMotionEvent === "undefined") {
    return "unsupported";
  }
  const DM = DeviceMotionEvent as DeviceMotionEventiOS;
  if (typeof DM.requestPermission === "function") {
    try {
      return await DM.requestPermission();
    } catch {
      return "denied";
    }
  }
  return "granted";
}

/** True when DeviceMotion needs an explicit iOS-style permission tap. */
export function motionNeedsPermission(): boolean {
  if (typeof window === "undefined" || typeof DeviceMotionEvent === "undefined") return false;
  return typeof (DeviceMotionEvent as DeviceMotionEventiOS).requestPermission === "function";
}

/**
 * Reactive coarse-pointer flag. Returns `false` during SSR and the first client
 * render, then resolves after mount — avoids hydration mismatches.
 */
export function usePointerCoarse(): boolean {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return coarse;
}
