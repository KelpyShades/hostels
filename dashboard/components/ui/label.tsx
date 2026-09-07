import * as LabelPrimitive from "@radix-ui/react-label";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type LabelProps = ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
  htmlFor: string;
};

export function Label({ className, htmlFor, ...props }: LabelProps) {
  return <LabelPrimitive.Root htmlFor={htmlFor} className={cn("text-xs font-semibold text-slate-600", className)} {...props} />;
}
