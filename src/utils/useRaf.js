import { useEffect, useRef, useCallback } from "react";

export default function useRaf(callback) {
  const raf = useRef();
  const startTimeRef = useRef();
  const previousTimeRef = useRef();

  const animate = useCallback(
    (time) => {
      if (startTimeRef.current === undefined) {
        startTimeRef.current = time;
      }
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        const elapsedTime = time - startTimeRef.current;
        callback(deltaTime, elapsedTime);
      }
      previousTimeRef.current = time;
      raf.current = requestAnimationFrame(animate);
    },
    [callback]
  );

  useEffect(() => {
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [animate]);
}
