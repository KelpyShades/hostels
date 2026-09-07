import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", {
  variants: {
    variant: {
      live: "bg-emerald-50 text-emerald-700",
      draft: "bg-amber-50 text-amber-700",
      paused: "bg-slate-100 text-slate-600",
      new: "bg-sky-50 text-sky-700",
      contacted: "bg-violet-50 text-violet-700",
      booked: "bg-emerald-50 text-emerald-700",
    },
  },
  defaultVariants: { variant: "draft" },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}
