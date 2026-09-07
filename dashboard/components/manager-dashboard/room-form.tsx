"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { ManagerRoom } from "./types";

const roomSchema = z.object({ price: z.coerce.number().int().positive(), available: z.coerce.number().int().nonnegative(), accepting: z.enum(["open", "closed"]) });

export function RoomForm({ room, onSave }: { room: ManagerRoom; onSave: (values: { price: number; available: number; accepting: boolean }) => Promise<void> | void }) {
  const [price, setPrice] = useState(String(room.pricePerSemester));
  const [available, setAvailable] = useState(String(room.availableCount));
  const [accepting, setAccepting] = useState(room.accepting ? "open" : "closed");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function submit(event: React.FormEvent) { event.preventDefault(); const parsed = roomSchema.safeParse({ price, available, accepting }); if (!parsed.success) { setError("Enter a positive price and a whole number of rooms."); return; } setError(""); await onSave({ price: parsed.data.price, available: parsed.data.available, accepting: parsed.data.accepting === "open" }); setSaved(true); setTimeout(() => setSaved(false), 1800); }
  return <form onSubmit={submit} className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end"><div><Label htmlFor={`${room._id}-price`}>Price / semester</Label><div className="relative mt-2"><span className="absolute left-3 top-2.5 text-sm text-slate-400">GHS</span><Input id={`${room._id}-price`} value={price} onChange={(event) => setPrice(event.target.value)} className="pl-12" /></div></div><div><Label htmlFor={`${room._id}-available`}>Rooms left</Label><Input id={`${room._id}-available`} type="number" min="0" value={available} onChange={(event) => setAvailable(event.target.value)} className="mt-2" /></div><div><Label htmlFor={`${room._id}-accepting`}>Availability</Label><Select id={`${room._id}-accepting`} value={accepting} onChange={(event) => setAccepting(event.target.value)} className="mt-2"><option value="open">Accepting inquiries</option><option value="closed">Not accepting</option></Select></div><Button type="submit" variant={saved ? "secondary" : "default"}>{saved ? "Saved" : "Save changes"}</Button>{error ? <p className="text-xs text-rose-600 md:col-span-4">{error}</p> : null}</form>;
}
