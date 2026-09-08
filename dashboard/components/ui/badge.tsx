import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        new: "border-[#e8d5ae] bg-[#f6ecd7] text-[#7c5a22]",
        contacted: "border-[#cdd6de] bg-[#e4e8ec] text-[#3f5364]",
        booked: "border-[#c3dcca] bg-[#dfebe1] text-[#275c3d]",
        accepting: "border-[#c3dcca] bg-[#dfebe1] text-[#275c3d]",
        closed: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
