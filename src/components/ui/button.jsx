import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn.js";

/* Button shadcn/ui (variants via cva) — convention 21st.dev. */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[13.5px] font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90 shadow-sm",
        secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-accent",
        ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
        outline: "border border-border bg-transparent hover:bg-secondary",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3.5 text-[12.5px]",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";

export { buttonVariants };
