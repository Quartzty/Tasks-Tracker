import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/* Helper shadcn/21st.dev : fusionne les classes Tailwind sans conflit. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
