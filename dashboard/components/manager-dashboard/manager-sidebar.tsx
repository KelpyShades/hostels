"use client";

import { BedDouble, Inbox, Menu, X } from "lucide-react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems: Array<{ label: "Inbox" | "Rooms"; value: "inbox" | "rooms"; icon: typeof Inbox }> = [
  { label: "Inbox", value: "inbox", icon: Inbox },
  { label: "Rooms", value: "rooms", icon: BedDouble },
];

export function ManagerSidebar({ active, onActiveChange, hostelName, branchName }: { active: "inbox" | "rooms"; onActiveChange: (value: "inbox" | "rooms") => void; hostelName: string; branchName?: string }) {
  const [open, setOpen] = useState(false);
  const content = <div className="flex h-full flex-col">
    <div className="px-3 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">H</div>
        <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-950">{hostelName}</p><p className="truncate text-xs text-slate-400">{branchName ?? "All locations"}</p></div>
      </div>
    </div>
    <nav className="mt-5 flex-1 space-y-1">
      {navItems.map((item) => { const Icon = item.icon; return <button type="button" key={item.value} onClick={() => { onActiveChange(item.value); setOpen(false); }} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium", active === item.value ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-950")}><Icon className="h-4 w-4" />{item.label}</button>; })}
    </nav>
    <p className="px-3 pb-3 text-xs leading-relaxed text-slate-400">This dashboard is for your hostel. Keep this address bookmarked and share it only with your management team.</p>
  </div>;
  return <><Button type="button" variant="secondary" size="icon" className="fixed left-4 top-4 z-30 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu className="h-4 w-4" /></Button><aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white p-4 lg:block">{content}</aside>{open ? <div className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"><aside className="h-full w-72 bg-white p-4"><div className="mb-3 flex justify-end"><Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close navigation"><X className="h-4 w-4" /></Button></div>{content}</aside></div> : null}</>;
}
