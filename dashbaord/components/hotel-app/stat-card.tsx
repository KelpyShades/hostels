import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function StatCard({ label, value, hint, icon: Icon }: { label: string; value: string; hint: string; icon: LucideIcon }) {
  return <Card><CardContent className="flex items-start justify-between p-5"><div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-400">{hint}</p></div><div className="rounded-xl bg-slate-100 p-2.5 text-slate-600"><Icon className="h-4 w-4" /></div></CardContent></Card>;
}
