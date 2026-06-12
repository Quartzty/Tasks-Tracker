import React from "react";
import { cn } from "../../lib/cn.js";

/* Loader carré 21st.dev (adapté monochrome — ombre = foreground). */
export function Loader({ className }) {
  return (
    <div className={cn("tt-loader", className)}>
      <span />
      <span />
    </div>
  );
}
export default Loader;
