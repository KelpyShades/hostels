import type * as React from "react";
import { cn } from "@/lib/utils";

type SeparatorProps = React.ComponentPropsWithoutRef<"hr"> & {
  orientation?: "horizontal" | "vertical";
};

export function Separator({ className, orientation = "horizontal", ...props }: SeparatorProps) {
  if (orientation === "vertical") {
    return <div aria-hidden="true" className={cn("h-full w-px bg-slate-200", className)} />;
  }
  return <hr className={cn("h-px w-full border-0 bg-slate-200", className)} {...props} />;
}
