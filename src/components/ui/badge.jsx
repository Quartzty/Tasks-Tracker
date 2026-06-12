"use client";

/* Badge 21st.dev (Badge.Anchor + Badge) — adapté MONOCHROME aux tokens de l'app.
   Utilisé uniquement sur la dropbox du Personal Brain : compteur de fichiers
   ancré dans un coin. */
import * as React from "react";
import { cn } from "../../lib/cn.js";

const placementClasses = {
  "top-right": "absolute right-0 top-0 translate-x-1/4 -translate-y-1/4",
  "top-left": "absolute left-0 top-0 -translate-x-1/4 -translate-y-1/4",
  "bottom-right": "absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4",
  "bottom-left": "absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/4",
};
const sizeClasses = {
  sm: "min-h-4 min-w-4 rounded-xl text-[10px] leading-[1.34]",
  md: "min-h-6 min-w-6 rounded-3xl text-xs leading-[1.34]",
  lg: "min-h-7 min-w-7 rounded-2xl text-[13px] leading-[1.43]",
};
const toneClasses = {
  default: "bg-primary text-primary-foreground",
  soft: "bg-secondary text-secondary-foreground",
  success: "bg-emerald-600 text-white",
  danger: "bg-rose-600 text-white",
};

export function BadgeAnchor({ children, className, ...props }) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)} data-slot="badge-anchor" {...props}>
      {children}
    </span>
  );
}

export function Badge({ children, className, placement = "top-right", size = "md", tone = "default", ...props }) {
  const hasLabel = typeof children === "string" || typeof children === "number";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-0.5 border border-background font-semibold shadow-sm transition-all",
        placementClasses[placement],
        sizeClasses[size],
        toneClasses[tone],
        !children && "size-3 min-h-3 min-w-3 rounded-full p-0",
        className
      )}
      data-slot="badge"
      {...props}
    >
      {hasLabel ? <span className="px-1">{children}</span> : children}
    </span>
  );
}

Badge.Anchor = BadgeAnchor;
export default Badge;
