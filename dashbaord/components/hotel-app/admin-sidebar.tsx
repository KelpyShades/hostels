"use client";

import { Building2, FilePenLine, Inbox, LayoutDashboard, Menu, Settings2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Clients", icon: Building2 },
  { label: "Inquiries", icon: Inbox },
  { label: "Content", icon: FilePenLine },
];

export function AdminSidebar({ active, onActiveChange }: { active: string; onActiveChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const content = <div className="flex h-full flex-col"><div className="flex items-center gap-3 px-3 py-4"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">H</div><div><p className="text-sm font-bold text-slate-950">hostel<span className="text-slate-400">/</span>app</p><p className="text-xs text-slate-400">Operator workspace</p></div></div><nav className="mt-5 flex-1 space-y-1">{navItems.map((item) => { const Icon = item.icon; return <button type="button" key={item.label} onClick={() => { onActiveChange(item.label); setOpen(false); }} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium", active === item.label ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-950")}><Icon className="h-4 w-4" />{item.label}</button>; })}</nav><div className="border-t border-slate-200 pt-4"><button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-950"><Settings2 className="h-4 w-4" />Settings</button><div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">K</div><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-800">Kelvin</p><p className="truncate text-[11px] text-slate-400">Internal operator</p></div></div></div></div>;
  return <><Button variant="secondary" size="icon" className="fixed left-4 top-4 z-30 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu className="h-4 w-4" /></Button><aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white p-4 lg:block">{content}</aside>{open ? <div className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"><aside className="h-full w-72 bg-white p-4"><div className="mb-3 flex justify-end"><Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close navigation"><X className="h-4 w-4" /></Button></div>{content}</aside></div> : null}</>;
}
