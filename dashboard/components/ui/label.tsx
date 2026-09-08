import * as LabelPrimitive from "@radix-ui/react-label";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type LabelProps = ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
  htmlFor: string;
};

function Label({ className, htmlFor, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      htmlFor={htmlFor}
      className={cn("text-sm font-medium leading-none text-foreground", className)}
      {...props}
    />
  );
}

export { Label };
