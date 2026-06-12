import * as React from "react";
import { cn } from "../../lib/cn.js";

/* Composant Card shadcn/ui — issu de 21st.dev (Magic), converti en JS. */
export const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} data-slot="card"
    className={cn("bg-card text-card-foreground flex flex-col rounded-xl border border-border shadow-sm", className)}
    {...props} />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-start justify-between gap-2 px-6 pt-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 pb-6 pt-5", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center px-5 pb-5", className)} {...props} />
));
CardFooter.displayName = "CardFooter";
