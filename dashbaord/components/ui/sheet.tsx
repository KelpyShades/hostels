"use client";

import type * as React from "react";
import { X } from "lucide-react";


export function Sheet({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) {
  return open ? <div className="fixed inset-0 z-50 bg-slate-950/30"><aside className="absolute inset-y-0 left-0 w-80 bg-white p-5 shadow-xl"><button type="button" className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => onOpenChange(false)} aria-label="Close menu"><X className="h-4 w-4" /></button>{children}</aside></div> : null;
}
