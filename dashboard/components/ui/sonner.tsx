"use client";

import { Toaster as Sonner } from "sonner";
import type * as React from "react";

function Toaster(props: React.ComponentProps<typeof Sonner>) {
  return (
    <Sonner
      position="top-center"
      theme="light"
      toastOptions={{
        classNames: {
          toast: "rounded-xl border bg-card text-foreground shadow-lg",
          description: "text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
