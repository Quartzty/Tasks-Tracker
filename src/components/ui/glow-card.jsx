import React, { useRef, useEffect } from "react";
import { cn } from "../../lib/cn.js";

/* GlowCard 21st.dev adapté MONOCHROME : halo blanc (foreground) qui suit la
   souris, au lieu du halo coloré par hue de l'original. */
export function GlowCard({ children, className, ...props }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - r.left + "px");
      el.style.setProperty("--my", e.clientY - r.top + "px");
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);
  return (
    <div ref={ref} className={cn("tt-glow", className)} {...props}>
      {children}
    </div>
  );
}
export default GlowCard;
