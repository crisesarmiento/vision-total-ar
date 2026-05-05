"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type WakeLockState = {
  isActive: boolean;
  isSupported: boolean;
  toggle: () => Promise<void>;
};

export function useWakeLock(): WakeLockState {
  const [isActive, setIsActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    setIsSupported("wakeLock" in navigator);
  }, []);

  const release = useCallback(async () => {
    if (sentinelRef.current) {
      await sentinelRef.current.release();
      sentinelRef.current = null;
    }
    setIsActive(false);
  }, []);

  const acquire = useCallback(async () => {
    if (!isSupported) return;
    try {
      sentinelRef.current = await navigator.wakeLock.request("screen");
      setIsActive(true);
      sentinelRef.current.addEventListener("release", () => {
        sentinelRef.current = null;
        setIsActive(false);
      });
    } catch {
      setIsActive(false);
    }
  }, [isSupported]);

  const toggle = useCallback(async () => {
    if (!isSupported) return;
    if (isActive) {
      await release();
    } else {
      await acquire();
    }
  }, [isSupported, isActive, acquire, release]);

  // Re-acquire the wake lock when the page becomes visible again (e.g. tab switch back)
  useEffect(() => {
    if (!isSupported) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden") {
        await release();
      } else if (document.visibilityState === "visible" && isActive) {
        await acquire();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isSupported, isActive, acquire, release]);

  // Release on unmount
  useEffect(() => {
    return () => {
      void sentinelRef.current?.release();
    };
  }, []);

  return { isActive, isSupported, toggle };
}
