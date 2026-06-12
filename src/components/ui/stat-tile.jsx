import React from "react";
import { cn } from "../../lib/cn.js";

/* Tuile « 01 » 21st.dev : carré mono, scale au survol. */
export function StatTile({ value, label, sub, danger, className }) {
  return (
    <div className={cn("tt-tile flex min-h-[112px] flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-4 text-center", className)}>
      <span className={cn("font-mono text-[34px] font-semibold leading-none tracking-tight tabular-nums", danger && "text-destructive")}>{value}</span>
      {label && <span className="text-[12.5px] font-medium text-muted-foreground">{label}</span>}
      {sub && <span className="font-mono text-[11px] text-muted-foreground/70">{sub}</span>}
    </div>
  );
}
export default StatTile;
