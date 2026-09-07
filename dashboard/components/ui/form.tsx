"use client";

import type * as React from "react";


export function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <fieldset className="space-y-2"><legend className="text-xs font-semibold text-slate-600">{label}</legend>{children}{error ? <p className="text-xs text-rose-600">{error}</p> : null}</fieldset>;
}
