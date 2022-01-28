import React, { useCallback, useEffect, useRef } from "react";

const RetinaCanvas = React.forwardRef<
  HTMLCanvasElement,
  Omit<React.HTMLProps<HTMLCanvasElement>, "width" | "height"> & Partial<Record<"width" | "height", number>>
>(({ width = 0, height = 0, ...props }, ref) => {
  const realRef = useRef<HTMLCanvasElement | null>(null);
  const getRef = useCallback(
    (el: HTMLCanvasElement) => {
      realRef.current = el;
      if (typeof ref === "function") {
        ref(el);
      } else {
        ref && (ref.current = el);
      }
    },
    [ref],
  );
  useEffect(() => {
    const el = realRef.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const ratio = window.devicePixelRatio || 1;
    if (width !== 0 && height !== 0) {
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
    }

    el.width = width * ratio;
    el.height = height * ratio;
    ctx.scale(ratio, ratio);
  }, [realRef, width, height]);
  return <canvas {...props} ref={getRef}></canvas>;
});

export default RetinaCanvas;
