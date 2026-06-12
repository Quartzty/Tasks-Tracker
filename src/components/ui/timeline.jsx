"use client";

/* Timeline — composant 21st.dev adapté :
   - converti TS → JS, orientation verticale (ScrollArea/radix retirés)
   - variants cva conservés (default / compact / spacious)
   - items : { id, title, description?, timestamp?, status?, icon?, content?, tag? } */

import * as React from "react";
import { cva } from "class-variance-authority";
import { Check, Clock, X } from "lucide-react";
import { cn } from "../../lib/cn.js";

const timelineVariants = cva("relative flex flex-col", {
  variants: {
    variant: { default: "gap-4", compact: "gap-2", spacious: "gap-8" },
  },
  defaultVariants: { variant: "default" },
});

const timelineIconVariants = cva(
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-background text-xs font-medium",
  {
    variants: {
      status: {
        default: "border-border text-muted-foreground",
        completed: "border-primary bg-primary text-primary-foreground",
        active: "border-primary bg-background text-primary",
        pending: "border-muted-foreground/30 text-muted-foreground",
        error: "border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: { status: "default" },
  }
);

function getStatusIcon(status) {
  switch (status) {
    case "completed": return <Check className="h-3.5 w-3.5" />;
    case "active": return <Clock className="h-3.5 w-3.5" />;
    case "pending": return <Clock className="h-3.5 w-3.5" />;
    case "error": return <X className="h-3.5 w-3.5" />;
    default: return <div className="h-2 w-2 rounded-full bg-current" />;
  }
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "";
  const date = typeof timestamp === "string" || typeof timestamp === "number" ? new Date(timestamp) : timestamp;
  return date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function Timeline({ items, className, variant, showConnectors = true, ...props }) {
  return (
    <div className={className} {...props}>
      <div className={cn(timelineVariants({ variant }))}>
        {items.map((item, index) => (
          <div key={item.id} className="relative flex flex-row gap-3.5 pb-2">
            {showConnectors && index < items.length - 1 && (
              <div className="absolute left-3.5 top-9 h-full w-px bg-border" />
            )}
            <div className="relative z-10 flex shrink-0">
              <div className={cn(timelineIconVariants({ status: item.status }))}>
                {item.icon || getStatusIcon(item.status)}
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1 pt-0.5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[14px] font-medium leading-tight">
                  {item.title}
                  {item.tag && <span className="ml-2 rounded-full bg-accent px-2.5 py-0.5 align-middle text-[11.5px] font-semibold text-accent-foreground">{item.tag}</span>}
                </h3>
                {item.timestamp && (
                  <time className="shrink-0 font-mono text-[11.5px] text-muted-foreground">{formatTimestamp(item.timestamp)}</time>
                )}
              </div>
              {item.description && <p className="text-[13px] leading-relaxed text-muted-foreground">{item.description}</p>}
              {item.content && <div className="mt-2">{item.content}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { timelineVariants, timelineIconVariants };
