"use client";

/* PixelCanvas — extrait du composant 21st.dev "pixel shimmer" (logos retirés).
   Grille de pixels gris/blanc dessinée sur <canvas>. MUET au repos (intensité
   basse), PLEIN au survol de la carte parente. Monochrome + theme-aware :
   la couleur des pixels est lue depuis --foreground du thème (clair/sombre). */

import { useCallback, useEffect, useRef } from "react";

const rand = (min, max) => Math.random() * (max - min) + min;

function hexToRgb(hex) {
  let h = (hex || "").trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return "250,250,250";
  return `${r},${g},${b}`;
}

export default function PixelCanvas({ gap = 6 }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const pixelsRef = useRef([]);
  const rafRef = useRef(0);
  const hoverRef = useRef(false);
  const intensityRef = useRef(0.18);
  const colorRef = useRef("250,250,250");
  const reducedRef = useRef(false);

  const readColor = () => {
    const el = wrapRef.current;
    if (!el) return "250,250,250";
    const fg = getComputedStyle(el).getPropertyValue("--foreground");
    return hexToRgb(fg);
  };

  const init = useCallback(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = wrap.getBoundingClientRect();
    const w = Math.max(1, Math.floor(width)), h = Math.max(1, Math.floor(height));
    canvas.width = w; canvas.height = h;
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    colorRef.current = readColor();

    const pixels = [];
    for (let x = 0; x < w; x += gap) {
      for (let y = 0; y < h; y += gap) {
        pixels.push({
          x, y,
          alpha: rand(0.25, 0.95),
          size: rand(0, 0.6),
          full: rand(0.7, 2.1),   // amplitude au survol
          muted: rand(0.15, 0.7), // amplitude au repos
          speed: rand(0.012, 0.05),
          dir: Math.random() > 0.5 ? 1 : -1,
        });
      }
    }
    pixelsRef.current = pixels;
  }, [gap]);

  const loop = useCallback(() => {
    rafRef.current = requestAnimationFrame(loop);
    const canvas = canvasRef.current, ctx = canvas && canvas.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const target = hoverRef.current ? 1 : (reducedRef.current ? 0.16 : 0.32);
    intensityRef.current += (target - intensityRef.current) * 0.08;
    const gi = intensityRef.current;
    const col = colorRef.current;
    const maxInt = 2;

    for (const p of pixelsRef.current) {
      const cap = hoverRef.current ? p.full : p.muted;
      if (!reducedRef.current) {
        p.size += p.speed * p.dir;
        if (p.size >= cap) p.dir = -1;
        else if (p.size <= 0.05) p.dir = 1;
      } else {
        p.size = cap * 0.5;
      }
      const s = Math.max(0, Math.min(p.size, cap));
      const offset = (maxInt - s) * 0.5;
      ctx.globalAlpha = p.alpha * gi;
      ctx.fillStyle = `rgb(${col})`;
      ctx.fillRect(p.x + offset, p.y + offset, s, s);
    }
    ctx.globalAlpha = 1;
  }, []);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    init();

    const ro = new ResizeObserver(() => init());
    if (wrapRef.current) ro.observe(wrapRef.current);

    // Le survol est suivi sur la carte parente (la dropzone), pas le canvas,
    // pour ne jamais bloquer les clics/drop.
    const host = wrapRef.current && wrapRef.current.parentElement;
    const enter = () => { hoverRef.current = true; };
    const leave = () => { hoverRef.current = false; };
    host && host.addEventListener("mouseenter", enter);
    host && host.addEventListener("mouseleave", leave);

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
      host && host.removeEventListener("mouseenter", enter);
      host && host.removeEventListener("mouseleave", leave);
    };
  }, [init, loop]);

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
