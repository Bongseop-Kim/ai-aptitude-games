import { useRef } from "react";

export function useLatencyTracker() {
  const totalMsRef = useRef(0);
  const countRef = useRef(0);

  // Methods close over stable refs, so this object is safe to create once.
  const trackerRef = useRef({
    recordAnswer(latencyMs: number) {
      const nextCount = countRef.current + 1;
      countRef.current = nextCount;
      totalMsRef.current += latencyMs;
      return {
        nextAnsweredCount: nextCount,
        nextAvgLatencyMs: totalMsRef.current / nextCount,
      };
    },
    reset() {
      totalMsRef.current = 0;
      countRef.current = 0;
    },
    getAvgLatencyMs(): number | null {
      if (countRef.current === 0) return null;
      return totalMsRef.current / countRef.current;
    },
  });

  return trackerRef.current;
}
