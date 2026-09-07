import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-slate-950 text-white hover:bg-slate-800 focus-visible:ring-slate-950",
        secondary: "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:ring-slate-400",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-slate-400",
        danger: "bg-rose-50 text-rose-700 hover:bg-rose-100 focus-visible:ring-rose-400",
      },
      size: {
        default: "",
        sm: "min-h-9 rounded-lg px-3 text-xs",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
